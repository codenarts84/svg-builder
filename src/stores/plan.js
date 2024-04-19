import { defineStore } from "pinia";
import Vue, { ref } from "vue";

import { v4 as uuid } from "uuid";
import Ajv from "ajv";
import schema from "../schema/seating-plan.schema.json";
import { reverse, SEAT_NUMBERINGS } from "@/lib/numbering";
import { useMainStore } from ".";

// This is certainly not a best practice, but we don't want these two reactive for performance reasons

const zoneNameToID = (name) => name.replace(/[^0-9A-Za-z]/, "");

export const usePlanStore = defineStore("plan", {
  state: () => ({
    _plan: {
      zones: [],
      categories: [],
      size: {
        width: 0,
        height: 0,
      },
    },
    validationErrors: undefined,
    hasUndo: false,
    hasRedo: false,
    undoStack: [],
    redoStack: [],
    timeoutID: null,
  }),
  getters: {
    plan: (state) => state._plan,
    planSize: (state) => state._plan.size || 0,
    getCategoryByName: (state) => (category) => {
      return state._plan.categories.find((c) => c.name === category);
    },
  },
  actions: {
    persistPlan(skipHistory = false) {
      const s = JSON.stringify(this._plan);
      localStorage.setItem("frontrow2.editor.plan", s);

      if (!skipHistory) {
        this.recordHistoryState(s);
      }

      this.setValidationErrors(undefined);

      if (this.timeoutID) {
        clearTimeout(this.timeoutID);
      }

      this.timeoutID = setTimeout(() => {
        this.validatePlan();
        this.timeoutID = null;
      }, 500);
    },

    validatePlan() {
      const ajv = new Ajv({ allErrors: true, verbose: true });
      const plan = this._plan;
      Promise.resolve(
        ajv.validate(JSON.parse(JSON.stringify(schema)), plan)
      ).then((valid) => {
        if (valid) {
          const errors = [];
          const seatGuids = new Set();
          const seatNames = new Set();
          const errorIds = new Set();

          for (const z of plan.zones) {
            if (errors.length > 50) break;
            for (const r of z.rows) {
              if (errors.length > 50) break;
              for (const s of r.seats) {
                if (errors.length > 50) break;
                const sname = `${z.name}>${r.row_number}>${s.seat_number}`;
                if (!s.seat_guid) {
                  errors.push({
                    text: `Seat ${escape(z.name)} > ${r.row_number} > ${s.seat_number
                      } has no seat ID.`,
                    uuid: s.uuid,
                    tool: "seatselect",
                  });
                } else if (
                  seatGuids.has(s.seat_guid) &&
                  !errorIds.has(s.seat_guid)
                ) {
                  errors.push({
                    text: `Seat ID "${s.seat_guid}" is not unique! This will lead to errors when people try to book these seats. (Seen again in "${z.name}" > "${r.row_number}" > "${s.seat_number}")`,
                    uuid: s.uuid,
                    tool: "seatselect",
                  });
                  errorIds.add(s.seat_guid);
                } else if (seatNames.has(sname) && !errorIds.has(sname)) {
                  errors.push({
                    text: `You have multiple seats with zone "${z.name}", row "${r.row_number}", and seat "${s.seat_number}". This is going to be very confusing.`,
                    uuid: s.uuid,
                    tool: "seatselect",
                  });
                  errorIds.add(sname);
                }
                seatGuids.add(s.seat_guid);
                seatNames.add(sname);
              }
            }
          }

          this.setValidationErrors(errors);
        } else {
          this.setValidationErrors([
            {
              text:
                "JSON schema validation error (contact support for help): " +
                ajv.errorsText(ajv.errors),
            },
          ]);
        }
      });
    },

    setValidationErrors(errors) {
      this.validationErrors = errors;
    },

    createRowBlock(zone, position, rows, seats, row_spacing, seat_spacing) {
      return new Promise((res, rej) => {
        try {
          const rowids = [];
          zone = this._plan.zones.find((z) => z.uuid === zone);
          for (const rix of [...Array(rows).keys()]) {
            const row = {
              position: { x: position.x, y: position.y + rix * row_spacing },
              row_number: (rix + 1).toString(),
              row_number_position: "both",
              seats: [],
              uuid: uuid(),
            };
            for (const six of [...Array(seats).keys()]) {
              row.seats.push({
                seat_number: (six + 1).toString(),
                seat_guid: uuid(),
                uuid: uuid(),
                position: { x: six * seat_spacing, y: 0 },
                category: "",
              });
            }
            this.createRowAfter(zone.uuid, row, false);
            rowids.push(row.uuid);
          }
          this.persistPlan();
          return rowids;
        } catch (err) {
          rej(err);
        }
      });
    },

    createStgRowBlock(zone, position, rows, seats, row_spacing, seat_spacing) {
      return new Promise((res, rej) => {
        try {
          const rowids = [];
          zone = this._plan.zones.find((z) => z.uuid === zone);
          console.log(rows);
          for (const rix of [...Array(rows).keys()]) {
            console.log(rix)
            let row = {};
            if (rix % 2 === 0) {
              row = {
                position: { x: position.x, y: position.y + rix * row_spacing },
                row_number: (rix + 1).toString(),
                row_number_position: "both",
                seats: [],
                uuid: uuid(),
              }

              for (const six of [...Array(seats).keys()]) {
                row.seats.push({
                  seat_number: (six + 1).toString(),
                  seat_guid: uuid(),
                  uuid: uuid(),
                  position: { x: six * seat_spacing, y: 0 },
                  category: "",
                });
              }
            } else {
              row = {
                position: { x: position.x + 10, y: position.y + rix * row_spacing },
                row_number: (rix + 1).toString(),
                row_number_position: "both",
                seats: [],
                uuid: uuid(),
              };
              for (const six of [...Array(seats - 1).keys()]) {
                row.seats.push({
                  seat_number: (six + 1).toString(),
                  seat_guid: uuid(),
                  uuid: uuid(),
                  position: { x: six * seat_spacing, y: 0 },
                  category: "",
                });
              }
            }

            this.createRowAfter(zone.uuid, row, false);
            rowids.push(row.uuid);
          }
          this.persistPlan();
          return rowids;
        } catch (err) {
          rej(err);
        }
      });
    },

    undo() {
      if (this.undoStack.length >= 2) {
        const plan = this.undoStack.pop();
        this.redoStack.push(plan);
        this._plan = JSON.parse(this.undoStack[this.undoStack.length - 1]);
        this.hasRedo = true;
        this.hasUndo = this.undoStack.length >= 2;
        this.persistPlan({ skipHistory: true });
      }
    },

    redo() {
      if (this.redoStack.length) {
        const plan = this.redoStack.pop();
        this.undoStack.push(plan);
        this._plan = JSON.parse(plan);
        this.hasUndo = this.undoStack.length >= 2;
        this.hasRedo = this.redoStack.length >= 1;
        this.persistPlan({ skipHistory: false });
      }
    },

    restackAreas(areaIds, front) {
      for (const z of this._plan.zones) {
        let movedAreas = [];
        z.areas = z.areas.filter((a) => {
          const isTarget = areaIds.includes(a.uuid);
          if (isTarget) movedAreas.push(a);
          return !isTarget;
        });
        if (front) {
          z.areas.push(...movedAreas);
        } else {
          z.areas.unshift(...movedAreas);
        }
      }
      this.persistPlan();
    },

    deleteCategory(name) {
      this._plan.categories = this._plan.categories.filter(
        (z) => z.name !== name
      );
      this.persistPlan();
    },

    deleteObjects(objects) {
      objects = useMainStore().selection;
      this._plan.zones = this._plan.zones.filter(
        (z) => !objects.includes(z.uuid)
      );
      for (const z of this._plan.zones) {
        z.areas = z.areas.filter((a) => !objects.includes(a.uuid));
        z.rows = z.rows.filter((r) => !objects.includes(r.uuid));
        for (const r of z.rows) {
          r.seats = r.seats.filter((s) => !objects.includes(s.uuid));
        }
      }
      // Assume there's an `unselect` action
      this.unselect({ uuids: objects });
      this.persistPlan();
    },

    unselect(uuids) {
      console.log("unselected", uuids);
    },

    recordHistoryState(json) {
      this.undoStack.push(json);
      if (this.undoStack.length > 100) {
        this.undoStack.shift(); // Maintain a maximum of 100 states
      }
      this.redoStack = [];
      this.hasUndo = this.undoStack.length >= 2;
      this.hasRedo = false;
    },

    modifyRows(rowIds, args) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid)) {
            for (const arg in args) {
              if (arg.includes("__")) {
                let inner = r;
                const argparts = arg.split("__");
                argparts.forEach((part, index) => {
                  if (index === argparts.length - 1) {
                    inner[part] = args[arg];
                  } else {
                    inner = inner[part];
                  }
                });
              } else {
                r[arg] = args[arg];
              }
            }
          }
        });
      });
      this.persistPlan();
    },

    modifySeats(seatIds, args) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          r.seats.forEach((s) => {
            if (seatIds.includes(s.uuid)) {
              for (const arg in args) {
                if (arg.includes("__")) {
                  let inner = s;
                  const argparts = arg.split("__");
                  argparts.forEach((part, index) => {
                    if (index === argparts.length - 1) {
                      inner[part] = args[arg];
                    } else {
                      inner = inner[part];
                    }
                  });
                } else {
                  s[arg] = args[arg];
                }
              }
            }
          });
        });
      });
      this.persistPlan();
    },

    modifyAreas(areaIds, args) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((a) => {
          if (areaIds.includes(a.uuid)) {
            for (const arg in args) {
              if (arg.includes("__")) {
                let inner = a;
                const argparts = arg.split("__");
                argparts.forEach((part, index) => {
                  if (index === argparts.length - 1) {
                    inner[part] = args[arg];
                  } else {
                    inner = inner[part];
                  }
                });
              } else {
                a[arg] = args[arg];
              }
            }
          }
        });
      });
      this.persistPlan();
    },

    addSeat(rowIds) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length) {
            let newposition;

            // Figure out new position
            if (r.seats.length === 1) {
              newposition = { x: r.seats[0].x + 25, y: r.seats[0].y };
            } else {
              const dx =
                r.seats[r.seats.length - 1].position.x -
                r.seats[r.seats.length - 2].position.x;
              const dy =
                r.seats[r.seats.length - 1].position.y -
                r.seats[r.seats.length - 2].position.y;
              newposition = {
                x: r.seats[r.seats.length - 1].position.x + dx,
                y: r.seats[r.seats.length - 1].position.y + dy,
              };
            }

            // Assuming SEAT_NUMBERINGS is available and imported
            //Changed here
            let newnumber = "?";
            for (let numbering of SEAT_NUMBERINGS) {
              try {
                numbering = SEAT_NUMBERINGS.find((n) => n.id === "alpha");
                let guessedStartAt = numbering.findStartAt(
                  r.seats[0].seat_number
                );
                let guessedNumbers = numbering.compute(r.seats, guessedStartAt);
                if (
                  r.seats.filter(
                    (s, idx) => s.seat_number === guessedNumbers[idx]
                  ).length === r.seats.length
                ) {
                  let newNumbers = numbering.compute(
                    r.seats.concat([{}]),
                    guessedStartAt
                  );
                  newnumber = newNumbers[newNumbers.length - 1];
                  break;
                }

                let seatsReversed = [...r.seats].reverse();
                let guessedStartAtRev = numbering.findStartAt(
                  seatsReversed[0].seat_number
                );
                let guessedNumbersRev = numbering.compute(
                  seatsReversed,
                  guessedStartAtRev
                );
                if (
                  seatsReversed.filter(
                    (s, idx) => s.seat_number === guessedNumbersRev[idx]
                  ).length === r.seats.length
                ) {
                  let newNumbers = numbering.compute(
                    seatsReversed.concat([{}]),
                    guessedStartAtRev
                  );
                  for (const s of r.seats) {
                    s.seat_number = newNumbers.pop();
                    s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
                  }
                  newnumber = newNumbers[0];
                  break;
                }
              } catch (e) {
                console.warn(
                  "Crash while trying to test seat numbering schema",
                  numbering,
                  e
                );
              }
            }

            r.seats.push({
              seat_number: newnumber,
              seat_guid: `${z.zone_id}-${r.row_number}-${newnumber}`,
              uuid: uuid(),
              position: newposition,
              category: r.seats[r.seats.length - 1].category,
            });
          }
        });
      });
      this.persistPlan();
    },

    renumberRows(rowIds, numbering, startAt, reversed) {
      const rows = [];
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid)) {
            rows.push([z, r]);
          }
        });
      });
      const numbers = numbering.compute(
        rows.map(([z, r]) => r),
        startAt
      );
      rows.forEach(([z, r], index) => {
        r.row_number = reversed ? numbers.pop() : numbers.shift();
        r.seats.forEach((s) => {
          s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
        });
      });
      this.persistPlan();
    },

    renumberSeats(rowIds, numbering, startAt, reversed) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length) {
            const numbers = numbering.compute(r.seats, startAt);
            console.log(r.seats, numbers);
            r.seats.forEach((s) => {
              s.seat_number = reversed ? numbers.pop() : numbers.shift();
              s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
            });
          }
        });
      });
      this.persistPlan();
    },

    renumberCircleSeats(rowIds, count) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((r) => {
          if (rowIds.includes(r.uuid)) {
            const res = [];
            for (let si = 0; si < count; si++) {
              const uid = uuid();
              const degree = 2 * Math.PI / count * si;
              res.push({
                text: (si + 1).toString(),
                x: 40 * Math.cos(degree),
                y: 40 * Math.sin(degree),
                r: 10,
                uid
              })
            }
            r.roundTable.seats = res;
          }
        });
      });
      this.persistPlan();
    },


    respaceRows(rowIds, spacing) {
      spacing = Math.max(spacing, 1); // Ensure spacing is at least 1
      this._plan.zones.forEach((z) => {
        const rows = z.rows.filter((r) => rowIds.includes(r.uuid));
        if (rows.length < 2) return; // Skip if not enough rows to re-space

        const newPositions = [rows[0].position]; // Start with the first position
        rows.slice(1).forEach((row, index) => {
          let previousRow = rows[index];
          let dx = row.position.x - previousRow.position.x;
          let dy = row.position.y - previousRow.position.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let normalisationFactor = distance ? spacing / distance : 0;

          newPositions.push({
            x: previousRow.position.x + dx * normalisationFactor,
            y: previousRow.position.y + dy * normalisationFactor,
          });
        });

        rows.forEach((row, index) => {
          row.position = newPositions[index];
        });
      });
      this.persistPlan();
    },

    createRowAfter(zone, row, persist) {
      zone = this._plan.zones.find((z) => z.uuid === zone);
      zone.rows.push(row);
      if (persist) this.persistPlan();
    },

    createRow(zone, position, seats) {
      return new Promise((res, rej) => {
        try {
          const rowids = [];

          zone = this._plan.zones.find((z) => z.uuid === zone);
          const row = {
            position: { x: position.x, y: position.y },
            row_number: "1",
            row_number_position: "both",
            seats: [],
            uuid: uuid(),
          };
          for (const [six, spos] of seats.entries()) {
            console.log(six, spos);
            row.seats.push({
              seat_number: (six + 1).toString(),
              seat_guid: uuid(),
              uuid: uuid(),
              position: { x: spos.x, y: spos.y },
              category: "",
            });
          }

          this.createRowAfter(zone.uuid, row, false);
          // if (temp[0] == "0") {
          //   for (const [six, spos] of seats.entries()) {
          //     console.log(six, spos);
          //     row.seats.push({
          //       seat_number: (six + 1).toString(),
          //       seat_guid: uuid(),
          //       uuid: uuid(),
          //       position: { x: spos.x, y: spos.y },
          //       category: "",
          //     });
          //   }
          // } else {
          //   seats.seats.forEach((v) => {
          //     row.seats.push(v);
          //   });
          // }
          // zone.rows.push(row);
          this.persistPlan();
          return row.uuid;
        } catch (err) {
          rej(err);
        }
      });
    },

    createAreaAfter(zone, area) {
      zone = this._plan.zones.find((z) => z.uuid === zone);
      zone.areas.push(area);
      this.persistPlan();
    },

    createArea(zone, area) {
      return new Promise((res, rej) => {
        try {
          this.createAreaAfter(zone, area);
        } catch (err) {
          rej(err);
        }
      });
    },
    respaceSeats(rowIds, spacing) {
      spacing = Math.max(spacing, 1); // Ensure minimum spacing is at least 1
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length > 1) {
            const newPositions = [r.seats[0].position];
            for (let si = 1; si < r.seats.length; si++) {
              const previousPosition = newPositions[si - 1];
              const dxOld = r.seats[si].position.x - r.seats[si - 1].position.x;
              const dyOld = r.seats[si].position.y - r.seats[si - 1].position.y;
              const dOld = Math.sqrt(dxOld * dxOld + dyOld * dyOld);
              const scale = spacing / dOld;
              newPositions.push({
                x: previousPosition.x + dxOld * scale,
                y: previousPosition.y + dyOld * scale,
              });
            }
            r.seats.forEach((s, index) => {
              s.position = newPositions[index];
            });
          }
        });
      });
      this.persistPlan();
    },

    loadPlan(plan) {
      for (const z of plan.zones) {
        if (!z.uuid) z.uuid = uuid();
        if (z._editor_id) {
          z.zone_id = z._editor_id;
          delete z._editor_id;
        }
        if (!z.zone_id) z.zone_id = zoneNameToID(z.name);
        for (const r of z.rows) {
          if (!r.uuid) r.uuid = uuid();
          for (const s of r.seats) {
            if (!s.uuid) s.uuid = uuid();
          }
        }
        for (const a of z.areas) {
          if (!a.uuid) a.uuid = uuid();
        }
      }

      this._plan = plan;
      this.undoStack.splice(0, this.undoStack.length);
      this.redoStack.splice(0, this.redoStack.length);
      this.hasUndo = false;
      this.hasRedo = false;
      this.persistPlan();
    },

    setPlanName(name) {
      this._plan.name = name;
      this.persistPlan();
    },
    setPlanSize(width, height) {
      if (width) this._plan.size.width = width;
      if (height) this._plan.size.height = height;
      window.dispatchEvent(new Event("resize"));
      this.persistPlan();
    },

    createZone(name, uuid) {
      this._plan.zones.push({
        name: name,
        zone_id: zoneNameToID(name),
        uuid: uuid,
        position: { x: 0, y: 0 },
        rows: [],
        areas: [],
      });
      this.persistPlan();
    },

    createCategory(name, color) {
      this._plan.categories.push({
        name: name,
        color: color,
      });
      this.persistPlan();
    },

    moveZoneInOrder(uuid, delta) {
      const zone = this._plan.zones.find((z) => z.uuid === uuid);
      const currentIdx = this._plan.zones.findIndex((z) => z.uuid === uuid);
      const newIdx = Math.min(
        Math.max(currentIdx + delta, 0),
        this._plan.zones.length - 1
      );
      this._plan.zones.splice(currentIdx, 1);
      this._plan.zones.splice(newIdx, 0, zone);
      this.persistPlan();
    },

    changeZone(uuid, name, zone_id) {
      const zone = this._plan.zones.find((z) => z.uuid === uuid);
      zone.name = name;
      zone.zone_id = zone_id;
      this.persistPlan();
    },

    changeCategory(oldname, newname, color) {
      const cat = this._plan.categories.find((c) => c.name === oldname);
      if (oldname !== newname) {
        if (this._plan.categories.filter((c) => c.name === newname).length) {
          // duplicate name, ignore
          // todo: error message
        }
        cat.name = newname;
        for (const z of this._plan.zones) {
          for (const r of z.rows) {
            for (const s of r.seats) {
              if (s.category === oldname) {
                s.category = newname;
              }
            }
          }
        }
      }
      cat.color = color;
      this.persistPlan();
    },
  },
});
