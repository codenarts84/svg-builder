import { defineStore } from "pinia";
import Vue, { ref } from "vue";

import { v4 as uuid } from "uuid";
import Ajv from "ajv";
import schema from "../schema/seating-plan.schema.json";
import {
  letterCounter,
  skipLetterCounter,
  reverse,
  SEAT_NUMBERINGS,
} from "@/lib/numbering";
import { generateID } from "@/lib/numbers";
import { useMainStore } from ".";

// This is certainly not a best practice, but we don't want these two reactive for performance reasons

const zoneNameToID = (name) => name.replace(/[^0-9A-Za-z]/, "");

export const usePlanStore = defineStore("plan", {
  state: () => ({
    _plan: {
      zones: [],
      categories: [],
      sections: [],
      size: {
        width: 0,
        height: 0,
      },
      point: {
        x: 0,
        y: 0,
      },
      name: "My Charting Board",
      mode: false,
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
    categories: (state) => state._plan.categories,
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

    setMode(mode) {
      this._plan.mode = mode;
      this.persistPlan();
    },

    validationPlan() {
      let nCategory = 0;
      let nSection = 0;
      const seatIds = [];
      let nTableLabel = 0;
      let nTableAbv = 0;
      let nCapacity = 0;
      let nSectionLabel = 0;
      let nSectionAbv = 0;
      let nSeatLabel = 0;
      let nRowLabel = 0;

      for (const z of this.plan.zones) {
        for (const r of z.rows) {
          for (const s of r.seats) {
            if (!s.category || !s.section_label || !s.seat_number) {
              s.valid = false;
              if (!s.category) {
                nCategory++;
              }
              if (!s.section_label) {
                nSection++;
              }
              if (!s.seat_number) {
                nSeatLabel++;
              }
            } else {
              s.valid = true;
            }
            seatIds.push(s.guid);
          }
          if (!r.row_number) nRowLabel++;
        }
        for (const a of z.areas) {
          if (
            a.shape === "gaCircle" ||
            a.shape === "gaSquare" ||
            a.shape === "gaPolygon"
          ) {
            if (
              !a.category ||
              !a.section_label ||
              a.capacity < 1 ||
              !a.label ||
              !a.abbreviation
            ) {
              a.valid = false;
              if (!a.category) {
                nCategory++;
              }
              if (!a.section_label) {
                nSection++;
              }
              if (a.capacity <= 0) {
                nCapacity++;
              }
              if (!a.label) {
                nSectionLabel++;
              }
              if (!a.abbreviation) {
                nSectionAbv++;
              }
            } else a.valid = true;
            seatIds.push(a.guid);
          }
          if (a.shape === "roundTable" || a.shape === "rectangleTable") {
            for (const s of a.seats) {
              if (
                !s.category ||
                !s.section_label ||
                !s.seat_number ||
                !a.label.name ||
                !a.label.abv
              ) {
                s.valid = false;
                if (!s.category) {
                  nCategory++;
                }
                if (!s.section_label) {
                  nSection++;
                }
                if (!s.seat_number) nSeatLabel++;
              } else s.valid = true;
              seatIds.push(s.guid);
            }
            if (!a.label.name) {
              nTableLabel += a.seats.length;
            }
            if (!a.label.abv) {
              nTableAbv += a.seats.length;
            }
          }
        }
      }

      const temp = [...new Set(seatIds)];
      const nSeat = seatIds.length - temp.length;
      const isValid =
        nCategory ||
        nSection ||
        nSeat ||
        nTableLabel ||
        nTableAbv ||
        nCapacity ||
        nSectionLabel ||
        nSectionAbv ||
        nSeatLabel ||
        nRowLabel;

      return {
        category: nCategory,
        section: nSection,
        seatId: nSeat,
        tableLabel: nTableLabel,
        tableAbv: nTableAbv,
        capacity: nCapacity,
        sectionLabel: nSectionLabel,
        sectionAbv: nSectionAbv,
        seatLabel: nSeatLabel,
        rowLabel: nRowLabel,
        isValid,
      };

      // return {
      //   category: nCategory
      //     ? `${nCategory} element(s) without category.`
      //     : "All elements contain category.",
      //   section: nSection
      //     ? `${nSection} element(s) without section.`
      //     : "All elements contain section.",
      // };
    },

    validatePosition() {
      let nSeat = 0;
      const positions = [];

      for (const z of this.plan.zones) {
        for (const r of z.rows) {
          for (const s of r.seats) {
            positions.push({
              x: s.position.x + r.position.x,
              y: s.position.y + r.position.y,
            });
          }
        }
      }

      const res = this.detectOverlaps(positions, 19);
      return res;
    },

    detectOverlaps(positions, threshold) {
      const cellSize = threshold;
      const grid = new Map();

      function getGridKey(x, y) {
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);
        return `${gridX},${gridY}`;
      }

      // Place each position into the grid
      for (const { x, y } of positions) {
        const key = getGridKey(x, y);
        if (!grid.has(key)) {
          grid.set(key, []);
        }
        grid.get(key).push({ x, y });
      }

      let overlapCount = 0;

      // Check for overlaps within each cell and adjacent cells
      for (const [key, points] of grid.entries()) {
        const [gridX, gridY] = key.split(",").map(Number);

        for (let i = 0; i < points.length; i++) {
          const { x: x1, y: y1 } = points[i];

          // Check the same cell
          for (let j = i + 1; j < points.length; j++) {
            const { x: x2, y: y2 } = points[j];
            if (
              Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) <
              threshold
            ) {
              overlapCount++;
            }
          }

          // Check the adjacent cells
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx === 0 && dy === 0) continue; // Skip the current cell
              const adjacentKey = `${gridX + dx},${gridY + dy}`;
              if (grid.has(adjacentKey)) {
                for (const { x: x2, y: y2 } of grid.get(adjacentKey)) {
                  if (
                    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) <
                    threshold
                  ) {
                    overlapCount++;
                  }
                }
              }
            }
          }
        }
      }

      return overlapCount;
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
                    text: `Seat ${z.name} > ${r.row_number} > ${s.seat_number} has no seat ID.`,
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
              // row_number: (rix + 1).toString(),
              row_number: letterCounter(rix + 1, "A"),
              row_number_position: "both",
              seats: [],
              uuid: uuid(),
              guid: generateID(),
              rotation: 0,
            };
            for (const six of [...Array(seats).keys()]) {
              row.seats.push({
                seat_number: (six + 1).toString(),
                seat_guid: uuid(),
                uuid: uuid(),
                guid: generateID(),
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
          // console.log(rows);
          for (const rix of [...Array(rows).keys()]) {
            // console.log(rix)
            let row = {};
            if (rix % 2 === 0) {
              row = {
                position: { x: position.x, y: position.y + rix * row_spacing },
                // row_number: (rix + 1).toString(),
                row_number: letterCounter(rix + 1, "A"),
                row_number_position: "both",
                seats: [],
                guid: generateID(),
                uuid: uuid(),
                rotation: 0,
              };

              for (const six of [...Array(seats).keys()]) {
                row.seats.push({
                  seat_number: (six + 1).toString(),
                  // row_number: letterCounter(rix + 1, 'A'),
                  seat_guid: uuid(),
                  uuid: uuid(),
                  guid: generateID(),
                  position: { x: six * seat_spacing, y: 0 },
                  category: "",
                });
              }
            } else {
              row = {
                position: {
                  x: position.x + 10,
                  y: position.y + rix * row_spacing,
                },
                // row_number: (rix + 1).toString(),
                row_number: letterCounter(rix + 1, "A"),
                row_number_position: "both",
                seats: [],
                uuid: uuid(),
                guid: generateID(),
                rotation: 0,
              };
              for (const six of [...Array(seats - 1).keys()]) {
                row.seats.push({
                  seat_number: (six + 1).toString(),
                  seat_guid: uuid(),
                  uuid: uuid(),
                  guid: generateID(),
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
      if (this.undoStack.length > 2) {
        const plan = this.undoStack.pop();
        this.redoStack.push(plan);
        this._plan = JSON.parse(this.undoStack[this.undoStack.length - 1]);
        this.hasRedo = true;
        this.hasUndo = this.undoStack.length > 2;
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
      if (this._plan.mode) {
        alert("Can not delete category");
        return;
      }
      this._plan.categories = this._plan.categories.filter(
        (z) => z.name !== name
      );
      this.persistPlan();
    },

    deleteObjects(objects) {
      if (this._plan.mode) {
        alert("Can not delete object");
        return;
      }
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
        for (const a of z.areas) {
          if (a.shape === "roundTable" || a.shape === "rectangleTable") {
            a.seats = a.seats.filter((s) => !objects.includes(s.uuid));
          }
        }
      }
      // Assume there's an `unselect` action
      // this.unselect(objects);
      useMainStore().unselect(objects);
      this.persistPlan();
    },

    // unselect(uuids) {
    //   // let res = useMainStore().selection;
    //   // uuids.forEach(uuid => res = res.filter(uid => uid !== uuid));
    //   // useMainStore().setSelection(res);
    //   // this.persistPlan();
    // },

    recordHistoryState(json) {
      this.undoStack.push(json);
      if (this.undoStack.length > 100) {
        this.undoStack.shift(); // Maintain a maximum of 100 states
      }
      this.redoStack = [];
      this.hasUndo = this.undoStack.length >= 2;
      this.hasRedo = false;
    },

    setTableCategory(tables, val) {
      tables.forEach((t) => {
        for (const s of t.seats) {
          s.category = val;
        }
      });
      this.persistPlan();
    },

    setTableSeatCategory(seats, val) {
      for (const s of seats) {
        s.category = val;
      }
      this.persistPlan();
    },

    setGACategory(areas, val) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((a) => {
          if (areas.includes(a.uuid)) {
            a.category = val;
          }
        });
      });
      this.persistPlan();
    },

    modifyRows({ rowIds, ...args }) {
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

    modifySeats({ seatIds, ...args }) {
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

    modifyRectangleTableWidth(areas, w) {
      areas.forEach((a) => {
        a.rectangleTable.width = w;
        let top = a.seats.filter((item) => item.special === "top");
        let bottom = a.seats.filter((item) => item.special === "bottom");
        let left = a.seats.filter((item) => item.special === "left");
        let right = a.seats.filter((item) => item.special === "right");
        const dt = (w - 20) / (top.length - 1);
        const db = (w - 20) / (bottom.length - 1);
        top = top.map((item, idx) => {
          item.position.x = dt * idx + 10;
          return item;
        });
        bottom = bottom.map((item, idx) => {
          item.position.x = db * idx + 10;
          return item;
        });
        right = right.map((item, idx) => {
          item.position.x = w + 10;
          return item;
        });
        a.seats = [...top, ...bottom, ...left, ...right];
      });
      this.persistPlan();
    },

    modifyRectangleTableHeight(areas, h) {
      areas.forEach((a) => {
        a.rectangleTable.height = h;
        let top = a.seats.filter((item) => item.special === "top");
        let bottom = a.seats.filter((item) => item.special === "bottom");
        let left = a.seats.filter((item) => item.special === "left");
        let right = a.seats.filter((item) => item.special === "right");
        const dl = (h - 20) / (left.length - 1);
        const dr = (h - 20) / (right.length - 1);
        bottom = bottom.map((item, idx) => {
          item.position.y = h + 10;
          return item;
        });
        left = left.map((item, idx) => {
          item.position.y = idx * dl + 10;
          return item;
        });
        right = right.map((item, idx) => {
          item.position.y = idx * dr + 10;
          return item;
        });
        a.seats = [...top, ...bottom, ...left, ...right];
      });
      this.persistPlan();
    },

    modifyRectangleTableCapacityT(areas, val) {
      areas.forEach((r) => {
        const width = r.rectangleTable.width;
        let top = r.seats.filter((item) => item.special === "top");
        const category = r.seats[r.seats.length - 1].category;
        const dt = (width - 20) / (val - 1);
        let numbers = [];
        for (let numbering of SEAT_NUMBERINGS) {
          try {
            let guessedStartAt = numbering.findStartAt(r.seats[0].seat_number);

            let guessedNumbers = numbering.compute(r.seats, guessedStartAt);
            if (
              r.seats.filter((s, idx) => s.seat_number === guessedNumbers[idx])
                .length === r.seats.length
            ) {
              const temp = [];
              for (let i = 0; i < 500; i++) {
                temp.push({});
              }
              numbers = numbering.compute(r.seats.concat(temp), guessedStartAt);

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
              numbers = numbering.compute(
                seatsReversed.concat([{}]),
                guessedStartAtRev
              );
              // for (const s of r.seats) {
              //   s.seat_number = newNumbers.pop();
              //   // s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
              //   s.seat_guid = uuid();
              // }
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

        if (val > 1) {
          top = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: idx * dt + 10,
                  y: -10,
                },
                radius: 10,
                seat_number: numbers[idx],
                color: "#333333",
                guid: generateID(),
                uuid: uuid(),
                special: "top",
                category,
              };
            });
        } else {
          top = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: width / 2,
                  y: -10,
                },
                radius: 10,
                seat_number: numbers[idx],
                color: "#333333",
                uuid: uuid(),
                guid: generateID(),
                special: "top",
                category,
              };
            });
        }

        const ss = r.seats.filter((item) => item.special !== "top");
        ss.forEach((item, idx) => (item.seat_number = numbers[idx + val]));
        r.seats = [...top, ...ss];
      });
      this.persistPlan();
    },

    modifyRectangleTableCapacityB(areas, val) {
      areas.forEach((r) => {
        const width = r.rectangleTable.width;
        const height = r.rectangleTable.height;
        let bottom = r.seats.filter((item) => item.special === "bottom");
        const category = r.seats[r.seats.length - 1].category;
        const dt = (width - 20) / (val - 1);
        let numbers = [];
        for (let numbering of SEAT_NUMBERINGS) {
          try {
            let guessedStartAt = numbering.findStartAt(r.seats[0].seat_number);

            let guessedNumbers = numbering.compute(r.seats, guessedStartAt);
            if (
              r.seats.filter((s, idx) => s.seat_number === guessedNumbers[idx])
                .length === r.seats.length
            ) {
              const temp = [];
              for (let i = 0; i < 500; i++) {
                temp.push({});
              }
              numbers = numbering.compute(r.seats.concat(temp), guessedStartAt);

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
              numbers = numbering.compute(
                seatsReversed.concat([{}]),
                guessedStartAtRev
              );
              // for (const s of r.seats) {
              //   s.seat_number = newNumbers.pop();
              //   // s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
              //   s.seat_guid = uuid();
              // }
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

        const top = r.seats.filter((item) => item.special === "top");
        const right = r.seats.filter((item) => item.special === "right");
        const left = r.seats.filter((item) => item.special === "left");

        let st = top.length + right.length;

        if (val > 1) {
          bottom = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: idx * dt + 10,
                  y: height + 10,
                },
                radius: 10,
                seat_number: numbers[st + idx],
                color: "#333333",
                uuid: uuid(),
                guid: generateID(),
                special: "bottom",
                category,
              };
            });
        } else {
          bottom = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: width / 2,
                  y: height + 10,
                },
                radius: 10,
                seat_number: numbers[st + idx],
                color: "#333333",
                uuid: uuid(),
                guid: generateID(),
                special: "bottom",
                category,
              };
            });
        }

        st += val;

        left.forEach((i, idx) => {
          i.seat_number = numbers[st + idx];
        });
        r.seats = [...top, ...right, ...bottom, ...left];
      });
      this.persistPlan();
    },

    modifyRectangleTableCapacityR(areas, val) {
      areas.forEach((r) => {
        const width = r.rectangleTable.width;
        const height = r.rectangleTable.height;
        let right = r.seats.filter((item) => item.special === "right");
        const category = r.seats[r.seats.length - 1].category;
        const dt = (height - 20) / (val - 1);
        let numbers = [];
        for (let numbering of SEAT_NUMBERINGS) {
          try {
            let guessedStartAt = numbering.findStartAt(r.seats[0].seat_number);

            let guessedNumbers = numbering.compute(r.seats, guessedStartAt);
            if (
              r.seats.filter((s, idx) => s.seat_number === guessedNumbers[idx])
                .length === r.seats.length
            ) {
              const temp = [];
              for (let i = 0; i < 500; i++) {
                temp.push({});
              }
              numbers = numbering.compute(r.seats.concat(temp), guessedStartAt);

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
              numbers = numbering.compute(
                seatsReversed.concat([{}]),
                guessedStartAtRev
              );
              // for (const s of r.seats) {
              //   s.seat_number = newNumbers.pop();
              //   // s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
              //   s.seat_guid = uuid();
              // }
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

        const top = r.seats.filter((item) => item.special === "top");
        const bottom = r.seats.filter((item) => item.special === "bottom");
        const left = r.seats.filter((item) => item.special === "left");

        let st = top.length;
        if (val > 1) {
          right = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: width + 10,
                  y: idx * dt + 10,
                },
                radius: 10,
                seat_number: numbers[idx + st],
                color: "#333333",
                uuid: uuid(),
                guid: generateID(),
                special: "right",
                category,
              };
            });
        } else {
          right = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: width + 10,
                  y: height / 2,
                },
                radius: 10,
                seat_number: numbers[idx + st],
                color: "#333333",
                uuid: uuid(),
                guid: generateID(),
                special: "right",
                category,
              };
            });
        }

        st += val;
        bottom.forEach((i, idx) => {
          i.seat_number = numbers[st + idx];
        });
        st += bottom.length;
        left.forEach((i, idx) => {
          i.seat_number = numbers[st + idx];
        });
        r.seats = [...top, ...right, ...bottom, ...left];
      });
      this.persistPlan();
    },

    modifyRectangleTableCapacityL(areas, val) {
      areas.forEach((r) => {
        const width = r.rectangleTable.width;
        const height = r.rectangleTable.height;
        let left = r.seats.filter((item) => item.special === "left");
        const category = r.seats[r.seats.length - 1].category;
        const dt = (height - 20) / (val - 1);
        let numbers = [];
        for (let numbering of SEAT_NUMBERINGS) {
          try {
            let guessedStartAt = numbering.findStartAt(r.seats[0].seat_number);

            let guessedNumbers = numbering.compute(r.seats, guessedStartAt);
            if (
              r.seats.filter((s, idx) => s.seat_number === guessedNumbers[idx])
                .length === r.seats.length
            ) {
              const temp = [];
              for (let i = 0; i < 500; i++) {
                temp.push({});
              }
              numbers = numbering.compute(r.seats.concat(temp), guessedStartAt);

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
              numbers = numbering.compute(
                seatsReversed.concat([{}]),
                guessedStartAtRev
              );
              // for (const s of r.seats) {
              //   s.seat_number = newNumbers.pop();
              //   // s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
              //   s.seat_guid = uuid();
              // }
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

        const top = r.seats.filter((item) => item.special === "top");
        const right = r.seats.filter((item) => item.special === "right");
        const bottom = r.seats.filter((item) => item.special === "bottom");
        const st = top.length + right.length + bottom.length;

        if (val > 1) {
          left = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: -10,
                  y: idx * dt + 10,
                },
                radius: 10,
                seat_number: numbers[st + idx],
                color: "#333333",
                uuid: uuid(),
                guid: generateID(),
                special: "left",
                category,
              };
            });
        } else {
          left = Array(val)
            .fill(0)
            .map((item, idx) => {
              return {
                position: {
                  x: -10,
                  y: height / 2,
                },
                radius: 10,
                seat_number: numbers[st + idx],
                color: "#333333",
                uuid: uuid(),
                guid: generateID(),
                special: "left",
                category,
              };
            });
        }
        r.seats = [...top, ...right, ...bottom, ...left];
      });
      this.persistPlan();
    },

    modifyRoundTableRadius(areas, r) {
      areas.forEach((a) => {
        a.radius = r;
        const total = a.seats.length + a?.space;
        a.seats.forEach((s, idx, arr) => {
          const degree = ((2 * Math.PI) / total) * idx;
          s.position.x = (r + 10) * Math.cos(degree);
          s.position.y = (r + 10) * Math.sin(degree);
        });
      });
      this.persistPlan();
    },

    modifyRoundTableSpace(areas, value) {
      areas.forEach((a) => {
        a.space = value;
        const total = value + a.capacity;
        const r = a.radius;
        a.seats.forEach((s, idx, arr) => {
          const degree = ((2 * Math.PI) / total) * idx;
          s.position.x = (r + 10) * Math.cos(degree);
          s.position.y = (r + 10) * Math.sin(degree);
        });
      });
      this.persistPlan();
    },

    modifyTableSeatLabel(seatId, seat_number) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((a) => {
          if (a.shape === "roundTable" || a.shape === "rectangleTable") {
            const seat = a.seats.find((s) => s.uuid === seatId);
            if (seat) {
              seat.seat_number = seat_number;
            }
          }
        });
      });
      this.persistPlan();
    },

    modifyAreas({ areaIds, ...args }) {
      // console.log(areaIds, args)
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

    addPolygonPoint(area, pid, point) {
      area.polygon.points.splice(pid, 0, point);
      this.persistPlan();
    },

    removePolygonPoint(area, pid) {
      area.polygon.points.splice(area, pid);
      this.persistPlan();
    },

    addSeat(rowIds) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length) {
            let newposition;

            // Figure out new position
            if (r.seats.length === 1) {
              newposition = {
                x: r.seats[0].position.x + 25,
                y: r.seats[0].position.y,
              };
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
              // seat_guid: `${z.zone_id}-${r.row_number}-${newnumber}`,
              seat_guid: uuid(),
              uuid: uuid(),
              guid: generateID(),
              position: newposition,
              category: r.seats[r.seats.length - 1].category,
            });
          }
        });
      });
      this.persistPlan();
    },

    addSectionLabel(rowIds, label, abv) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length) {
            r.seats.forEach((s) => {
              s.section_label = label;
              s.section_abv = abv;
            });
          } else {
            r.seats.forEach((s) => {
              if (rowIds.includes(s.uuid)) {
                s.section_label = label;
                s.section_abv = abv;
              }
            });
          }
        });
      });
      this.persistPlan();
    },

    addGASectionLabel(areaIds, label, abv) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((r) => {
          if (areaIds.includes(r.uuid)) {
            r.section_label = label;
            r.section_abv = abv;
          }
        });
      });
      this.persistPlan();
    },

    addTableSectionLabel(ids, label, abv) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((r) => {
          if (ids.includes(r.uuid) && r.seats.length) {
            r.seats.forEach((s) => {
              s.section_label = label;
              s.section_abv = abv;
            });
          } else {
            if (r?.seats?.length)
              r.seats.forEach((s) => {
                if (ids.includes(s.uuid)) {
                  s.section_label = label;
                  s.section_abv = abv;
                }
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
            // console.log(r.seats, numbers);
            r.seats.forEach((s) => {
              s.seat_number = reversed ? numbers.pop() : numbers.shift();
              s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
            });
          }
        });
      });
      this.persistPlan();
    },

    skipLetterSeats(rowIds, numbering, startAt, reversed, skip_letter) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length) {
            const numbers = numbering.skip(r.seats, startAt, skip_letter);
            // console.log(r.seats, numbers);
            r.seats.forEach((s) => {
              s.skip_number = reversed ? numbers.pop() : numbers.shift();
            });
          }
        });
      });
      this.persistPlan();
    },

    skipLetterRows(rowIds, numbering, startAt, reversed, skip_letter) {
      const numbers = numbering.skip(rowIds, startAt, skip_letter);
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length) {
            r.skip_number = reversed ? numbers.pop() : numbers.shift();
          }
        });
      });
      this.persistPlan();
    },

    renumberTableSeats(areaIds, numbering, startAt, reversed) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((r) => {
          if (areaIds.includes(r.uuid) && r.seats.length) {
            const numbers = numbering.compute(r.seats, startAt);
            // console.log(r.seats, numbers);
            r.seats.forEach((s) => {
              s.seat_number = reversed ? numbers.pop() : numbers.shift();
              s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
            });
          }
        });
      });
      this.persistPlan();
    },

    skipLetterTableSeats(areaIds, numbering, startAt, reversed, skip_letter) {
      this._plan.zones.forEach((z) => {
        z.areas.forEach((r) => {
          if (areaIds.includes(r.uuid) && r.seats.length) {
            const numbers = numbering.skip(r.seats, startAt, skip_letter);
            r.seats.forEach((s) => {
              s.skip_number = reversed ? numbers.pop() : numbers.shift();
              // s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
            });
          }
        });
      });
      this.persistPlan();
    },

    changeNumberSeats(rowIds, value) {
      value = Math.max(1, value);
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length) {
            // add seats
            if (r.seats.length === value) return;
            const cnt = Math.abs(r.seats.length - value);

            let newnumber = [];
            if (r.seats.length < value) {
              let newPositions = [];
              if (r.seats.length === 1) {
                for (let i = 0; i < cnt; i++) {
                  newPositions.push({
                    x: r.seats[0].position.x + 25 * (i + 1),
                    y: r.seats[0].position.y,
                  });
                }
              } else {
                const dx =
                  r.seats[r.seats.length - 1].position.x -
                  r.seats[r.seats.length - 2].position.x;
                const dy =
                  r.seats[r.seats.length - 1].position.y -
                  r.seats[r.seats.length - 2].position.y;

                for (let i = 0; i < cnt; i++) {
                  newPositions.push({
                    x: r.seats[r.seats.length - 1].position.x + dx * (i + 1),
                    y: r.seats[r.seats.length - 1].position.y + dy * (i + 1),
                  });
                }
              }

              for (let numbering of SEAT_NUMBERINGS) {
                try {
                  let guessedStartAt = numbering.findStartAt(
                    r.seats[0].seat_number
                  );

                  let guessedNumbers = numbering.compute(
                    r.seats,
                    guessedStartAt
                  );
                  if (
                    r.seats.filter(
                      (s, idx) => s.seat_number === guessedNumbers[idx]
                    ).length === r.seats.length
                  ) {
                    const temp = [];
                    for (let i = 0; i < cnt; i++) {
                      temp.push({});
                    }
                    let newNumbers = numbering.compute(
                      r.seats.concat(temp),
                      guessedStartAt
                    );

                    newnumber = newNumbers.slice(
                      r.seats.length,
                      r.seats.length + cnt + 1
                    );
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
                      // s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
                      s.seat_guid = uuid();
                    }
                    newnumber = newNumbers.slice(0, cnt);
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

              for (let i = 0; i < cnt; i++) {
                r.seats.push({
                  seat_number: newnumber[i],
                  // seat_guid: `${z.zone_id}-${r.row_number}-${newnumber[i]}`,
                  uuid: uuid(),
                  guid: generateID(),
                  position: newPositions[i],
                  category: r.seats[r.seats.length - 1].category,
                });
              }
            }
            // remove seats
            else {
              // r.seats = r.seats.slice(0, cnt);
              for (let i = 0; i < cnt; i++) {
                r.seats.pop();
              }
            }
            this.persistPlan();
          }
        });
      });
    },

    renumberCircleSeats(rowIds, count) {
      count = Math.max(1, count);
      this._plan.zones.forEach((z) => {
        z.areas.forEach((r) => {
          if (rowIds.includes(r.uuid)) {
            const res = [];
            r.capacity = count;
            let numbers = [];
            for (let numbering of SEAT_NUMBERINGS) {
              try {
                let guessedStartAt = numbering.findStartAt(
                  r.seats[0].seat_number
                );

                let guessedNumbers = numbering.compute(r.seats, guessedStartAt);
                if (
                  r.seats.filter(
                    (s, idx) => s.seat_number === guessedNumbers[idx]
                  ).length === r.seats.length
                ) {
                  const temp = [];
                  for (let i = 0; i < 500; i++) {
                    temp.push({});
                  }
                  numbers = numbering.compute(
                    r.seats.concat(temp),
                    guessedStartAt
                  );

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
                  numbers = numbering.compute(
                    seatsReversed.concat([{}]),
                    guessedStartAtRev
                  );
                  // for (const s of r.seats) {
                  //   s.seat_number = newNumbers.pop();
                  //   // s.seat_guid = `${z.zone_id}-${r.row_number}-${s.seat_number}`;
                  //   s.seat_guid = uuid();
                  // }
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

            const total = count + (r.space || 0);
            for (let i = 0; i < count; i++) {
              const degree = ((2 * Math.PI) / total) * i;
              res.push({
                seat_number: numbers[i],
                position: {
                  x: (r.radius + 10) * Math.cos(degree),
                  y: (r.radius + 10) * Math.sin(degree),
                },
                category: r.seats[r.seats.length - 1].category,
                r: 10,
                guid: generateID(),
                uuid: uuid(),
              });
            }

            r.seats = res;

            // for (let si = 0; si < count; si++) {
            //   const degree = ((2 * Math.PI) / count) * si;
            //   res.push({
            //     text: (si + 1).toString(),
            //     position: {
            //       x: (r.radius + 10) * Math.cos(degree),
            //       y: (r.radius + 10) * Math.sin(degree),
            //     },
            //     category: r.seats[r.seats.length - 1].category,
            //     r: 10,
            //     uuid: uuid(),
            //   });
            // }
            // r.seats = res;
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
          zone = this._plan.zones.find((z) => z.uuid === zone);
          const row = {
            position: { x: position.x, y: position.y },
            row_number: "A",
            row_number_position: "both",
            seats: [],
            guid: generateID(),
            uuid: uuid(),
            rotation: 0,
          };
          for (const [six, spos] of seats.entries()) {
            row.seats.push({
              seat_number: (six + 1).toString(),
              guid: generateID(),
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
      spacing = Math.max(spacing, 20); // Ensure minimum spacing is at least 1
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
      console.log(plan);
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

    setFocusPoint(x, y) {
      this._plan.point.x = x;
      this._plan.point.y = y;
      this.persistPlan();
    },

    setTag(rowIds, value) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid) && r.seats.length > 0) {
            r.seats.forEach((s) => {
              s.tag_name = value;
            });
          } else {
            r.seats.forEach((s) => {
              if (rowIds.includes(s.uuid)) {
                s.tag_name = value;
              }
            });
          }
        });

        z.areas.forEach((r) => {
          if (r.shape === "roundTable" || r.shape === "rectangleTable") {
            if (rowIds.includes(r.uuid) && r.seats.length > 0) {
              r.seats.forEach((s) => {
                s.tag_name = value;
              });
            } else {
              r.seats.forEach((s) => {
                if (rowIds.includes(s.uuid)) {
                  s.tag_name = value;
                }
              });
            }
          } else if (
            r.shape === "gaCircle" ||
            r.shape === "gaSquare" ||
            r.shape === "gaPolygon"
          ) {
            if (rowIds.includes(r.uuid)) {
              r.tag_name = value;
            }
          }
        });
      });
      this.persistPlan();
    },

    setRotateLabel(rowIds, value) {
      this._plan.zones.forEach((z) => {
        z.rows.forEach((r) => {
          if (rowIds.includes(r.uuid)) {
            r.rotate_label = value;
          }
        });
      });
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

    createCategory(name, color) {
      this._plan.categories.push({
        id: uuid(),
        name: name,
        color: color,
      });
      this.persistPlan();
    },

    changeCategory(oldname, newname, color) {
      const cat = this._plan.categories.find((c) => c.name === oldname);
      if (oldname !== newname) {
        if (this._plan.categories.filter((c) => c.name === newname).length) {
          // duplicate name, ignore
          // todo: error message
        } else {
          cat.name = newname;
          for (const z of this._plan.zones) {
            for (const r of z.rows) {
              for (const s of r.seats) {
                if (s.category === oldname) {
                  s.category = newname;
                }
              }
            }
            for (const a of z.areas) {
              if (
                a.shape === "gaCircle" ||
                a.shape === "gaSquare" ||
                a.shape === "gaPolygon"
              )
                if (a.category === oldname) {
                  a.category = newname;
                }
              if (a.shape === "roundTable" || a.shape === "rectanlgeTable") {
                for (const s of a.seats) {
                  if (s.category === oldname) {
                    s.category = newname;
                  }
                }
              }
            }
          }
        }
      } else {
        cat.color = color;
      }
      this.persistPlan();
    },
  },
});
