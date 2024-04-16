import Vue from "vue";
// import Vuex from "vuex";

import { defineStore } from "pinia";
import { round } from "../lib/numbers";
import * as d3 from "d3";
import {
  degreeInCircle,
  findCircleCenter,
  findClosestGridPoint,
} from "../lib/geometry";
import { v4 as uuid } from "uuid";
import { usePlanStore } from "./plan";

const planStore = usePlanStore();

export const useMainStore = defineStore({
  id: "main",
  state: () => ({
    zoomTransform: d3.zoomTransform({ k: 1, x: 0, y: 0 }),
    grid: (window.localStorage.getItem("grid_enabled") || "false") === "true",
    clipboardAreas: [],
    clipboardRows: [],
    tool: "select",
    ignoreNextSelection: false,
    selectedZone: null,
    lockedZones: [],
    selection: [],
    dragging: false,
    draggingPolygonPoint: false,
    draggingPolygonPointId: 0,
    dragged: false,
    dragStartX: 0,
    dragStartY: 0,
    plan: planStore.plan,
  }),

  getters: {
    cursor: (state) => {
      switch (state.tool) {
        case "select":
        case "seatselect":
          return "default";
        case "circle":
        case "rectangle":
        case "polygon":
        case "ellipse":
        case "text":
        case "rows":
        case "row":
          return "crosshair";
        case "hand":
          return "grab";
        case "handon":
          return "grabbing";
        default:
          return "default";
      }
    },
  },

  actions: {
    loadPlan(plan) {
      const temp = usePlanStore();
      temp.loadPlan(plan);
      this.selectedZone = temp.plan.zones[0].uuid;
      this.selection = [];
    },

    toggleGrid() {
      this.grid = !this.grid;
      window.localStorage.setItem("grid_enabled", this.grid ? "true" : "false");
    },

    disableGrid() {
      this.grid = false;
      window.localStorage.setItem("grid_enabled", "false");
    },
    toggleZoneLock(uuid) {
      if (!this.lockedZones.includes(uuid)) {
        this.lockedZones.push(uuid);
        this.selection = [];
      } else {
        this.lockedZones = this.lockedZones.filter((s) => s !== uuid);
      }
    },
    selectAllInZone(uuid) {
      if (this.lockedZones.includes(uuid)) return;
      if (this.selectedZone !== uuid) {
        this.selectedZone = uuid;
      }
      this.selection = [];
      const temp = usePlanStore();
      const z = temp.plan.zones.find((z) => z.uuid === this.selectedZone);
      if (this.tool === "seatselect") {
        for (const r of z.rows) {
          for (const s of r.seats) {
            this.selection.push(s.uuid);
          }
        }
      } else {
        for (const r of z.rows) {
          this.selection.push(r.uuid);
        }
        for (const a of z.areas) {
          this.selection.push(a.uuid);
        }
      }
    },
    selectZone(uuid) {
      if (this.selectedZone !== uuid) {
        this.selectedZone = uuid;
        this.selection = [];
      }
    },
    unselect(uuids) {
      this.selection = this.selection.filter((s) => !uuids.includes(s));
    },

    setSelection(uuids, addition, zone) {
      if (addition && this.selection.length > 0) {
        for (const uuid of uuids) {
          if (!this.selection.includes(uuid)) {
            this.selection.push(uuid);
          }
        }
      } else {
        this.selectedZone = zone;
        this.selection = uuids;
      }
    },
    toggleSelection(uuids, addition, zone) {
      if (this.ignoreNextSelection) {
        // Work around that the end of a "drag" also might be a "click"
        this.ignoreNextSelection = false;
        return;
      }
      if (addition && this.selection.length > 0) {
        for (const uuid of uuids) {
          if (this.selection.includes(uuid)) {
            this.selection = this.selection.filter((s) => s !== uuid);
          } else {
            this.selection.push(uuid);
          }
        }
      } else {
        this.selectedZone = zone;
        if (
          this.selection.length === 1 &&
          uuids.filter((u) => this.selection.includes(u)).length
        ) {
          this.selection = [];
        } else {
          this.selection = uuids;
        }
      }
    },
    changeTool(tool) {
      const rowTools = [
        "rows",
        "row",
        "select",
        "rowCircle",
        "rowCircleFixedCenter",
      ];
      const keepSelection =
        tool === this.tool ||
        ((this.tool === "rows" || this.tool === "row") && tool === "select") ||
        (rowTools.includes(this.tool) && rowTools.includes(tool));
      if (!keepSelection) {
        this.selection = [];
      }
      this.tool = tool;
    },
    clearSelection() {
      this.selection = [];
    },

    startDragging(uuid, addition, x, y, zone) {
      if (!this.selection.includes(uuid)) {
        if (addition) this.selection.push(uuid);
        else {
          this.selection = [uuid];
          this.selectedZone = zone;
        }
        this.ignoreNextSelection = true;
      }
      this.dragging = true;
      this.draggingPolygonPoint = false;
      this.dragged = false;
      this.dragStartX = x;
      this.dragStartY = y;
    },
    startDraggingPolygonPoint(uuid, pid, addition, x, y, zone) {
      if (!this.selection.includes(uuid)) {
        return;
      }
      this.dragging = true;
      this.draggingPolygonPoint = true;
      this.draggingPolygonPointId = pid;
      this.dragged = false;
      this.dragStartX = x;
      this.dragStartY = y;
    },
    stopDragging() {
      if (this.dragging && this.dragged) {
        planStore.persistPlan();
      }
      this.dragging = false;
      this.dragged = false;
    },
    selectAll() {
      this.selection = [];
      if (this.tool === "seatselect") {
        const temp = usePlanStore();
        for (const z of temp.plan.zones) {
          if (this.lockedZones.includes(z.uuid)) continue;
          for (const r of z.rows) {
            for (const s of r.seats) {
              this.selection.push(s.uuid);
            }
          }
        }
      } else {
        const temp = usePlanStore();
        for (const z of temp.plan.zones) {
          if (this.lockedZones.includes(z.uuid)) continue;
          for (const r of z.rows) {
            if (r.seats.length === 0) continue;
            this.selection.push(r.uuid);
          }
          for (const a of z.areas) {
            this.selection.push(a.uuid);
          }
        }
      }
    },

    circleRows(tx, ty, fixedCenter) {
      /**
       * Align all currently selected rows along a circle line with radius specified by target position {tx, ty}
       */
      const temp = usePlanStore();
      for (const z of temp.plan.zones) {
        if (this.lockedZones.includes(z.uuid)) continue;
        for (const r of z.rows) {
          if (!this.selection.includes(r.uuid) || r.seats.length === 0) {
            continue;
          }

          // Our circle line segment starts with the first seat of the row
          const firstx = r.seats[0].position.x;
          const firsty = r.seats[0].position.y;

          // and ends with the last seat of the row (at least in the non-fixedCenter case)
          const lastx = r.seats[r.seats.length - 1].position.x;
          const lasty = r.seats[r.seats.length - 1].position.y;

          // The distance between those two points is e.g. our minimum diameter
          const distance = Math.sqrt(
            (lastx - firstx) * (lastx - firstx) +
              (lasty - firsty) * (lasty - firsty)
          );

          // rtx,rty is the position of the mouse which we'll use to compute the circle center
          const rtx = tx - r.position.x - z.position.x;
          const rty = ty - r.position.y - z.position.y;
          const sign = Math.sign(
            (rtx - firstx) * (lasty - firsty) -
              (rty - firsty) * (lastx - firstx)
          );
          let radius, cx, cy;

          if (fixedCenter) {
            // The radius is computed from the distance of rtx,rty to the first seat
            radius = Math.sqrt(
              (rtx - firstx) * (rtx - firstx) + (rty - firsty) * (rty - firsty)
            );
            cx = rtx;
            cy = rty;
          } else {
            // The radius is computed from the distance of rtx,rty to the line between the first and last seat
            radius = Math.max(
              Math.abs(
                (rtx - firstx) * (lasty - firsty) -
                  (rty - firsty) * (lastx - firstx)
              ) / distance,
              distance / 2
            );

            // The center of the circle is found using the two points and the radius
            const cc = findCircleCenter({
              x1: firstx,
              y1: firsty,
              x2: lastx,
              y2: lasty,
              radius,
              sign,
            });
            cx = cc.cx;
            cy = cc.cy;
          }
          let theta0 = degreeInCircle(firsty - cy, firstx - cx);
          let theta1 = degreeInCircle(lasty - cy, lastx - cx);

          // This makes sure we always take the "short" path over the circle, i.e. never more than 180°
          if (theta1 - theta0 > Math.PI) {
            theta0 += 2 * Math.PI;
          } else if (theta0 - theta1 > Math.PI) {
            theta1 += 2 * Math.PI;
          }

          // This deals with problem at minimum radius: Our circle equation has two solutions and we want to use one
          // or the other depending on the mouse position
          if (Math.abs(distance / 2 - radius) < 0.00001) {
            if (theta0 <= Math.PI && sign < 0 && theta1 > theta0) {
              theta1 -= 2 * Math.PI;
            } else if (theta0 >= Math.PI && sign > 0 && theta1 < theta0) {
              theta1 += 2 * Math.PI;
            }
          }

          // Distribute the seats evenly along the circle line
          const thetaStep = (theta1 - theta0) / (r.seats.length - 1);
          for (const [sidx, s] of r.seats.entries()) {
            s.position.x = cx + radius * Math.cos(theta0 + thetaStep * sidx);
            s.position.y = cy - radius * Math.sin(theta0 + thetaStep * sidx);
          }
        }
      }
      planStore.persistPlan();
    },
    moveSelected(x, y) {
      // TODO: delegate to plan module?
      const temp = usePlanStore();
      for (const z of temp.plan.zones) {
        if (this.lockedZones.includes(z.uuid)) continue;
        for (const r of z.rows) {
          if (this.selection.includes(r.uuid)) {
            r.position.x += x;
            r.position.y += y;
          }
          for (const s of r.seats) {
            if (this.selection.includes(s.uuid)) {
              s.position.x += x;
              s.position.y += y;
            }
          }
        }
        for (const a of z.areas) {
          if (this.selection.includes(a.uuid)) {
            a.position.x += x;
            a.position.y += y;
          }
        }
      }
      planStore.persistPlan();
    },
    moveDragging(x, y, snap, zoomLevel) {
      if (!this.dragging) return;
      let dx = x - this.dragStartX;
      let dy = y - this.dragStartY;
      if (dx * zoomLevel < 2 && dy * zoomLevel < 2) {
        // More likely a misclick than an intentional drag
      }
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) this.dragged = true;
      if (
        this.tool === "select" ||
        this.tool === "seatselect" ||
        this.tool === "polygon"
      ) {
        // TODO: delegate to plan module?
        const temp = usePlanStore();
        for (const z of temp.plan.zones) {
          if (this.lockedZones.includes(z.uuid)) continue;
          if (!this.draggingPolygonPoint) {
            for (const r of z.rows) {
              if (this.selection.includes(r.uuid)) {
                r.position.x += dx;
                r.position.y += dy;
                if (snap) {
                  const oldpos = r.position;
                  r.position = findClosestGridPoint({
                    x: r.position.x,
                    y: r.position.y,
                    zone: z,
                  });
                  if (r.position.x !== oldpos.x || r.position.y !== oldpos.y) {
                    dx += r.position.x - oldpos.x;
                    dy += r.position.y - oldpos.y;
                    x += r.position.x - oldpos.x;
                    y += r.position.y - oldpos.y;
                  }
                  snap = false;
                }
              }
              for (const s of r.seats) {
                if (this.selection.includes(s.uuid)) {
                  s.position.x += dx;
                  s.position.y += dy;
                  if (snap) {
                    const oldpos = s.position;
                    s.position = findClosestGridPoint({
                      x: s.position.x + r.position.x,
                      y: s.position.y + r.position.y,
                      zone: z,
                    });
                    s.position.x -= r.position.x;
                    s.position.y -= r.position.y;
                    if (
                      s.position.x !== oldpos.x ||
                      s.position.y !== oldpos.y
                    ) {
                      dx += s.position.x - oldpos.x;
                      dy += s.position.y - oldpos.y;
                      x += s.position.x - oldpos.x;
                      y += s.position.y - oldpos.y;
                    }
                    snap = false;
                  }
                }
              }
            }
          }
          for (const a of z.areas) {
            if (this.selection.includes(a.uuid)) {
              if (this.draggingPolygonPoint) {
                if (a.shape !== "polygon") {
                  console.warn(
                    "trying to move polygon points, but shape is not a polygon"
                  );
                  continue;
                }
                let ppoint = a.polygon.points[this.draggingPolygonPointId];
                ppoint.x += dx;
                ppoint.y += dy;
                if (snap) {
                  const oldpos = ppoint;
                  ppoint = findClosestGridPoint({
                    x: ppoint.x,
                    y: ppoint.y,
                    zone: z,
                  });
                  Vue.set(
                    a.polygon.points,
                    this.draggingPolygonPointId,
                    ppoint
                  );
                  if (ppoint.x !== oldpos.x || ppoint.y !== oldpos.y) {
                    dx += ppoint.x - oldpos.x;
                    dy += ppoint.y - oldpos.y;
                    x += ppoint.x - oldpos.x;
                    y += ppoint.y - oldpos.y;
                  }
                  snap = false;
                }
              } else {
                a.position.x += dx;
                a.position.y += dy;
                if (snap) {
                  const oldpos = a.position;
                  a.position = findClosestGridPoint({
                    x: a.position.x,
                    y: a.position.y,
                    zone: z,
                  });
                  if (a.position.x !== oldpos.x || a.position.y !== oldpos.y) {
                    dx += a.position.x - oldpos.x;
                    dy += a.position.y - oldpos.y;
                    x += a.position.x - oldpos.x;
                    y += a.position.y - oldpos.y;
                  }
                  snap = false;
                }
              }
            }
          }
        }
      } else {
        // TODO
      }
      this.dragStartX = x;
      this.dragStartY = y;
    },
    moveRotating(ox, oy, theta) {
      const deg = (theta / Math.PI) * 180;
      const planStore = usePlanStore(); // Retrieve the plan store

      const temp = usePlanStore();
      for (const z of temp.plan.zones) {
        if (this.lockedZones.includes(z.uuid)) continue;

        const lox = ox - z.position.x;
        const loy = oy - z.position.y;

        for (const r of z.rows) {
          let rdx = 0;
          let rdy = 0;

          if (this.selection.includes(r.uuid)) {
            rdx =
              Math.cos(theta) * (r.position.x - lox) -
              Math.sin(theta) * (r.position.y - loy) +
              lox -
              r.position.x;
            rdy =
              Math.sin(theta) * (r.position.x - lox) +
              Math.cos(theta) * (r.position.y - loy) +
              loy -
              r.position.y;
          }

          const llox = lox - r.position.x;
          const lloy = loy - r.position.y;

          for (const s of r.seats) {
            if (
              this.selection.includes(s.uuid) ||
              this.selection.includes(r.uuid)
            ) {
              const oldx = s.position.x;
              const oldy = s.position.y;
              s.position.x =
                Math.cos(theta) * (oldx - llox) -
                Math.sin(theta) * (oldy - lloy) +
                llox -
                rdx;
              s.position.y =
                Math.sin(theta) * (oldx - llox) +
                Math.cos(theta) * (oldy - lloy) +
                lloy -
                rdy;
            }
          }

          if (rdx) r.position.x += rdx;
          if (rdy) r.position.y += rdy;
        }

        for (const area of z.areas) {
          if (this.selection.includes(area.uuid)) {
            const oldx = area.position.x;
            const oldy = area.position.y;
            area.position.x =
              Math.cos(theta) * (oldx - lox) -
              Math.sin(theta) * (oldy - loy) +
              lox;
            area.position.y =
              Math.sin(theta) * (oldx - lox) +
              Math.cos(theta) * (oldy - loy) +
              loy;
            area.rotation = round((area.rotation + deg) % 360, 2);
            if (area.rotation < 0) area.rotation += 360;
          }
        }
      }
      planStore.persistPlan(); // Call the persistPlan action from the plan store
    },
    moveResizing(ox, oy, factor) {
      const temp = usePlanStore();
      for (const z of temp.plan.zones) {
        if (this.lockedZones.includes(z.uuid)) continue;

        const lox = ox - z.position.x;
        const loy = oy - z.position.y;

        for (const row of z.rows) {
          if (this.selection.includes(row.uuid)) {
            row.position.x = lox + (row.position.x - lox) * factor;
            row.position.y = loy + (row.position.y - loy) * factor;

            for (const seat of row.seats) {
              seat.position.x *= factor;
              seat.position.y *= factor;
            }
          }
        }

        for (const area of z.areas) {
          if (this.selection.includes(area.uuid)) {
            area.position.x = lox + (area.position.x - lox) * factor;
            area.position.y = loy + (area.position.y - loy) * factor;

            switch (area.shape) {
              case "rectangle":
                area.rectangle.width *= factor;
                area.rectangle.height *= factor;
                break;
              case "circle":
                area.circle.radius *= factor;
                break;
              case "ellipse":
                area.ellipse.radius.x *= factor;
                area.ellipse.radius.y *= factor;
                break;
              case "polygon":
                for (let p of area.polygon.points) {
                  p.x *= factor;
                  p.y *= factor;
                }
                break;
              case "text":
                area.text.size =
                  (area.text.size ? area.text.size : 16) * factor;
                break;
              default:
                console.warn("Unknown shape type", area.shape);
            }
          }
        }
      }
    },

    setZoomTransform(t) {
      this.zoomTransform = t;
    },

    copy(objects, offset) {
      offset = offset === undefined ? 10 : offset;
      this.clipboardAreas = [];
      this.clipboardRows = [];
      const clone = (o) => JSON.parse(JSON.stringify(o));
      const temp = usePlanStore();
      for (const z of temp.plan.zones) {
        if (this.lockedZones.includes(z.uuid)) continue;

        const rowsToClip = z.rows
          .filter((r) => objects.includes(r.uuid))
          .map(clone);
        for (const r of rowsToClip) {
          r.position.x += z.position.x + offset;
          r.position.y += z.position.y + offset;
        }
        this.clipboardRows.push(...rowsToClip);

        const areasToClip = z.areas
          .filter((a) => objects.includes(a.uuid))
          .map(clone);
        for (const a of areasToClip) {
          a.position.x += z.position.x + offset;
          a.position.y += z.position.y + offset;
        }
        this.clipboardAreas.push(...areasToClip);
      }
    },

    //edit
    cut(objects) {
      this.copy(objects, 0);
      planStore.deleteObjects(objects);
    },

    paste() {
      const temp = usePlanStore();
      const z = temp.plan.zones.find((z) => z.uuid === this.selectedZone);
      const select = [];
      for (let r of this.clipboardRows) {
        r = JSON.parse(JSON.stringify(r));
        r.uuid = uuid();
        for (const s of r.seats) {
          s.uuid = uuid();
          s.seat_guid =
            z.zone_id +
            "-" +
            r.row_number.toString() +
            "-" +
            s.seat_number.toString();
        }
        select.push(r.uuid);
        r.position.x -= z.position.x;
        r.position.y -= z.position.y;
        z.rows.push(r);
      }
      for (let a of this.clipboardAreas) {
        a = JSON.parse(JSON.stringify(a));
        a.uuid = uuid();
        a.position.x -= z.position.x;
        a.position.y -= z.position.y;
        z.areas.push(a);
        select.push(a.uuid);
      }
      this.toggleSelection(select, false, z.uuid);
      planStore.persistPlan();
    },
  },
});
