<template>
  <div class="c-status-bar">
    <div class="left-container">

      <span v-if="selectionIsPolygon">
        <span class="hint">Move nodes by dragging</span>
        <span class="hint">Click blue squares to add nodes</span>
        <span class="hint">Middle-click nodes to delete them</span>
      </span>

      <span v-if="tool == 'seatselect' && selection.length === 2">
        <span class="hint">Seat distance: {{ seatDistance }}</span>
      </span>

      <span v-if="tool == 'seatselect' || tool == 'select'">
        <span v-if="dragging">
          <span class="hint">Hold down <code>SHIFT</code> to snap to grid
            positions</span>
        </span>
        <!-- <span v-else-if="plan.rotating">
        <span class="hint"
          >Hold down <code>SHIFT</code> to only rotate in 5° steps</span
        >
      </span> -->
        <span v-else-if="selection.length">
          <span class="hint">Press <code>SHIFT</code> and click to (de)select more
            objects</span>
          <span class="hint">Press arrow keys to move objects (hold
            <code>SHIFT</code> to move
            fast, <code>ALT</code> to move slow)</span>
          <span class="hint">Click and drag to move objects</span>
        </span>
        <span v-else>
          <span class="hint">Click any object to select it</span>
          <span class="hint"
            v-if="plan && zoomTransform.k !== plan.defaultScale">Click + drag
            while
            pressing
            <code>{{ $parent.cmdOtherwiseCtrl }}</code> to move around</span>
          <span class="hint" v-else>Press
            <code>{{ $parent.cmdOtherwiseCtrl }}</code> and scroll to
            zoom</span>
        </span>
      </span>

      <span v-if="tool == 'row'">
        <span v-if="plan.rowDrawing">
          <span class="hint">Move your mouse and click again once the correct
            number
            of seats is
            visible</span>
          <span class="hint">Press <code>ESC</code> to abort</span>
          <span class="hint">Drawing {{ plan.rowDrawingSeats.length }}
            seats</span>
        </span>
        <span v-else>
          <span class="hint">Click on the position of the first seat to
            draw</span>
          <span class="hint">Hold down <code>SHIFT</code> to choose a position on
            the grid</span>
        </span>
        <span class="hint">Spacing {{ plan.rowSeatSpacing }}, press
          <code>+</code>/<code>-</code>
          to vary (<code>ALT</code> for smaller steps)</span>
      </span>

      <span v-else-if="tool === 'rowCircle' || tool === 'rowCircleFixedCenter'">
        <span class="hint">Press <code>SHIFT</code> to snap to grid</span>
        <span class="hint">Click to apply</span>
      </span>

      <span v-else-if="tool === 'hand'">
        <span class="hint">You can <code>wheel</code> to zoom in and out.</span>
        <span class="hint">Drag board</span>
      </span>

      <span v-else-if="tool === 'rows'">
        <span v-if="plan.rowBlockDrawing">
          <span class="hint">Move your mouse and click again once the correct
            number
            of seats is
            visible</span>
          <span class="hint">Press <code>ESC</code> to abort</span>
          <span class="hint">Drawing
            {{ plan.rowBlockRows * plan.rowBlockSeats }}
            seats</span>
        </span>
        <span v-else>
          <span class="hint">Click on the position of the first seat to
            draw</span>
          <span class="hint">Hold down <code>SHIFT</code> to choose a position on
            the grid</span>
        </span>
        <span class="hint">Spacing {{ plan.rowSpacing }}x{{ plan.rowSeatSpacing
        }},
          press
          <code>CTRL</code>+<code>-</code> to vary (<code>ALT</code> for smaller
          steps)</span>
      </span>

      <span v-else-if="['rectangle', 'circle', 'ellipse'].includes(tool)">
        <span v-if="plan.drawing">
          <span class="hint">Move your mouse to start drawing, release it once
            you're done</span>
          <span class="hint">Hold down <code>SHIFT</code> to limit movement to
            grid
            positions</span>
          <span class="hint">Press <code>ESC</code> to abort</span>
        </span>
        <span v-else>
          <span class="hint">Click and drag to draw a new shape</span>
          <span class="hint">Hold down <code>SHIFT</code> to only start at grid
            positions</span>
        </span>
      </span>

      <span v-else-if="tool === 'polygon'">
        <span v-if="plan.polygonDrawing">
          <span class="hint">Click to add another point</span>
          <span class="hint">Press <code>ENTER</code> or double-click to
            finish</span>
          <span class="hint">Hold down <code>SHIFT</code> to limit angles to 5°
            steps</span>
          <span class="hint">Press <code>ESC</code> to abort</span>
        </span>
        <span v-else>
          <span class="hint">Click to add the first point of your polygon</span>
          <span class="hint">Hold down <code>SHIFT</code> to choose a position on
            the grid</span>
        </span>
      </span>

      <span v-else-if="tool === 'text'">
        <span class="hint">Click anywhere to add a new text object</span>
      </span>
    </div>
    <span class="selected-hint">
      {{ seatStatus }}
    </span>

    <!-- Additional tool conditions -->
    <!-- Add other conditions similar to the above based on your requirements -->
  </div>
</template>

<script>
// import { mapGetters, mapMutations, mapState } from "vuex";
// import store from "../store";
import { computed, ref } from "vue";
import sampleplan from "@/sampleplan";
import * as d3 from "d3";
import Ajv from "ajv";
import * as schema from "@/schema/seating-plan.schema.json";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";

export default {
  data() {
    return {};
  },
  setup() {
    const store = useMainStore();
    const planstore = usePlanStore();

    const tool = computed(() => store.tool);
    const selection = computed(() => store.selection);
    const zoomTransform = computed(() => store.zoomTransform);
    const dragging = computed(() => store.dragging);

    const plan = computed(() => planstore.plan);

    return { tool, selection, zoomTransform, dragging, plan };
  },
  methods: {
    selectionCount(uuids, addition) {
      let res = 0;
      if (addition && this.selection.length > 0) {
        for (const uuid of uuids) {
          if (!this.selection.includes(uuid)) {
            res++;
            this.selection.push(uuid);
          }
        }
      } else {
        this.selectedZone = addition;
        this.selection = uuids;
        res = uuids.length;
      }
      return res;
    }
  },
  computed: {
    seatStatus() {
      let total = 0;
      let selected = 0;
      let qa = 0;
      for (const z of this.plan.zones) {
        for (const s of z.rows) {
          total += s.seats.length;
        }

        for (const a of z.areas) {
          if (a.shape === 'gaSquare' || a.shape === 'gaCircle' || a.shape === 'gaPolygon') {
            qa += a.capacity;
          } else if (a.shape === 'roundTable') {
            total += a.capacity;
          } else if (a.shape === 'rectangleTable') {
            total += a.seats.length;
          }
        }
        // for (const a of z.areas) {
        //   if (a.shape === 'gaSquare' || a.shape === 'gaCircle' || a.shape === 'gaPolygon') {
        //     total += a.capacity;
        //   }
        // if (a.shape === 'roundTable') {
        //   seats += a.roundTable.seats.length;
        // } else if (a.shape === 'rectangleTable') {
        //   seats += a.rectangleTable.seats.length;
        // } else if (a.shape === 'gaSquare') {
        //   qa++;
        // } else if (a.shape === 'gaCircle') {
        //   qa++;
        // }
        // }
      }

      if (this.tool !== 'seatselect') {
        let allSelection = this.selection;
        for (const z of this.plan.zones) {
          for (const s of z.rows) {
            const idx = allSelection.findIndex(item => item === s.uuid);
            if (idx !== -1) {
              selected += s.seats.length;
            }
          }
        }
      } else {
        selected = this.selection.length;
      }

      return `Seats: ${total} (${selected}) | GA Seats: ${qa}`
    },
    totalSeatsCount() {
      let seats = 0;
      let qa = 0;
      for (const z of this.plan.zones) {
        for (const s of z.rows) {
          seats += s.seats.length;
        }
        for (const a of z.areas) {
          if (a.shape === 'roundTable') {
            seats += a.roundTable.seats.length;
          } else if (a.shape === 'rectangleTable') {
            seats += a.rectangleTable.seats.length;
          } else if (a.shape === 'gaSquare') {
            qa++;
          } else if (a.shape === 'gaCircle') {
            qa++;
          }
        }
      }
      return seats;
    },
    selectedSeatsCount() {
      let seats = 0;
      let qa = 0;
      return `Seats: ${seats} | GA Seats: ${qa}`;
    },
    selectionIsPolygon() {
      if (!this.plan && !this.plan.zones) return false;

      for (const z of this.plan.zones) {
        for (const r of z.rows) {
          if (this.selection.includes(r.uuid)) {
            return false;
          }
          for (const s of r.seats) {
            if (this.selection.includes(s.uuid)) {
              return false;
            }
          }
        }
        for (const a of z.areas) {
          if (this.selection.includes(a.uuid) && a.shape !== "polygon") {
            return false;
          }
        }
      }
      return this.selection.length === 1;
    },
    seatDistance() {
      let p1 = null;
      for (const z of this.plan.zones) {
        for (const r of z.rows) {
          for (const s of r.seats) {
            if (this.selection.includes(s.uuid)) {
              if (p1 === null) {
                p1 = [
                  z.position.x + r.position.x + s.position.x,
                  z.position.y + r.position.y + s.position.y,
                ];
              } else {
                const p2 = [
                  z.position.x + r.position.x + s.position.x,
                  z.position.y + r.position.y + s.position.y,
                ];
                const d = Math.sqrt(
                  Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2)
                );
                return d.toFixed(3);
              }
            }
          }
        }
      }
      return "?";
    },
  },
};
</script>

<style>
.c-status-bar {
  position: fixed;
  padding: 10px 20px;
  bottom: 0;
  left: 0;
  width: calc(100% - 300px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
}

.c-status-bar code {
  display: inline-block;
  border: 1px solid #888;
  border-radius: 2px;
  padding: 1px;
  position: relative;
  top: -1px;
}

.selected-hint {
  padding: 0 5px;
  max-width: 200px;
  width: 200px;
}

.left-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.left-container span {
  text-align: left;
}

.left-container span.hint {
  padding: 0 5px;
}
</style>
