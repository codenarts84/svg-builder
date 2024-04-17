<template>
  <g
    :transform="transform"
    @mousedown="mousedown"
    @mouseup="mouseup"
    :class="classObject"
  >
    <text
      v-if="rowNumberStart"
      :x="rowNumberStart.x"
      :y="rowNumberStart.y"
      dy=".3em"
      :font-size="rowNumberStart.fontSize"
      :text-anchor="rowNumberStart.textAnchor"
      :transform="rowNumberStart.transform"
      fill="#888"
      >{{ row.row_number }}</text
    >
    <text
      v-if="rowNumberEnd"
      :x="rowNumberEnd.x"
      :y="rowNumberEnd.y"
      dy=".3em"
      :font-size="rowNumberEnd.fontSize"
      :text-anchor="rowNumberEnd.textAnchor"
      :transform="rowNumberEnd.transform"
      fill="#888"
      >{{ row.row_number }}</text
    >
    <Seat
      v-for="s in row.seats"
      :seat="s"
      :key="s.uuid"
      :zone="zone"
      @startDragging="startDragging"
    ></Seat>
    <path
      class="selection-line"
      v-if="selection.includes(row.uuid)"
      :d="selectionLinePath"
    ></path>
  </g>
</template>
<script>
import Seat from "./Seat";
import { useMainStore } from "@/stores";
import { computed } from "vue";
// import { mapState } from "vuex";
// import { positionInZone } from "../../lib/geometry";

const round = (fl, places) => Number(fl.toFixed(places ? places : 0));

const getRowNumber = (row, end) => {
  if (
    row.row_number_position !== "both" &&
    row.row_number_position !== (end ? "end" : "start")
  )
    return null;
  if (row.seats.length < 2) return null;

  // To determine the *position* of the row number, we calculate the vector from the second-outmost
  // seat to the outmost seat and extend it by distFactor times the radius of the outmost seat.
  const distFactor = 2; // Determined by "what looks good?" with lots of real plans
  const idxedge = end ? row.seats.length - 1 : 0;
  const idxcomp = end ? row.seats.length - 2 : 1;
  const linevec = [
    row.seats[idxedge].position.x - row.seats[idxcomp].position.x,
    row.seats[idxedge].position.y - row.seats[idxcomp].position.y,
  ];
  const linelen = Math.sqrt(linevec[0] * linevec[0] + linevec[1] * linevec[1]);
  const linevec_normed = [
    round(linevec[0] / linelen, 8), // prevent floating point issues
    round(linevec[1] / linelen, 8),
  ];

  const x =
    row.seats[idxedge].position.x +
    linevec_normed[0] * distFactor * (row.seats[idxedge].radius || 10);
  const y =
    row.seats[idxedge].position.y +
    linevec_normed[1] * distFactor * (row.seats[idxedge].radius || 10);

  // To support upside-down rows properly, we base the text-anchor on the vector, not on the end flag
  let flipped = linevec_normed[0] < 0;

  // To determine the *rotation* of the row number, we compute the angle between the vector from the
  // second-outmost seat to the outmost seat and the vertical axis.
  // We then rotate the result 90° in the direction of the vertical axis, because we want our vector
  // to be the text's length axis, not it's size axis.
  // We use atan(), which only returns results between -90° and 90°. This is nice, because it mean
  // we'll never render text which is upside down, but alwas favor the direction most suitable to read.
  // The exception is if we have a perfectly vertical row, in which case it is unclear whether -90° or 90°
  // is easier to read. Visually, it looks nice if the text is rotated in the way that it is correct
  // "looking from the stage". We don't know where the stage is, so we're assuming the order of the seats
  // in the row is "left to right" (looking from the seat to the stage), because that's the most likely way
  // to create the row.
  let transform = "";
  let theta = -Math.atan(linevec_normed[0] / linevec_normed[1]);
  theta -= ((Math.sign(theta) >= 0 ? 1 : -1) * Math.PI) / 2; // Do not use Math.sign directly to multiply because Math.sign(0)==0
  if (Math.abs(Math.abs(theta) - Math.PI / 2) < 0.0001) {
    // 90°
    if (linevec_normed[1] > 0 !== end) {
      // right of stage
      theta += Math.PI;
    }
    flipped = end;
  }
  if (Math.abs(theta) > 0.0001) {
    transform = `rotate(${(theta / Math.PI) * 180}, ${x}, ${y})`;
  }

  return {
    x,
    y,
    textAnchor: flipped ? "end" : "start",
    transform: transform,
  };
};

export default {
  name: "SeatComp",
  components: { Seat },
  props: {
    row: Object,
    zone: Object,
  },
  setup() {
    const store = useMainStore();
    const selection = computed(() => store.selection);
    return { selection };
  },
  data() {
    return {
      lastMouseUp: 0,
    };
  },
  computed: {
    // ...mapState(["selection"]),

    classObject() {
      return {
        row: true,
        selected: this.selection.includes(this.row.uuid),
      };
    },
    selectionLinePath() {
      let p = "";
      for (let s of this.row.seats) {
        if (p) {
          p += ` L ${s.position.x} ${s.position.y}`;
        } else {
          p += `M ${s.position.x} ${s.position.y}`;
        }
      }
      return p;
    },
    transform() {
      return `translate(${this.row.position.x}, ${this.row.position.y})`;
    },
    rowNumberStart() {
      return getRowNumber(this.row, false);
    },
    rowNumberEnd() {
      return getRowNumber(this.row, true);
    },
  },
  watch: {},
  mounted() {},
  unmounted() {},
  methods: {
    startDragging(uuid, zone, event) {
      this.$emit("startDragging", uuid, zone, event);
    },
    mouseup(event) {
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      const interval = new Date().getTime() - this.lastMouseUp;
      this.lastMouseUp = new Date().getTime();
      if (useMainStore().tool === "select") {
        if (!useMainStore().dragged) {
          useMainStore().toggleSelection(
            [this.row.uuid],
            event.shiftKey,
            this.zone.uuid
          );
        }
        if (useMainStore().dragging) {
          useMainStore().stopDragging();
        }
        return true;
      }
      return false;
    },
    mousedown(event) {
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      if (useMainStore().tool === "select") {
        this.$emit("startDragging", this.row.uuid, this.zone, event);
        event.stopPropagation();
        return true;
      }
      return false;
    },
  },
};
</script>
<style>
.selection-line {
  stroke: #0064d080;
  stroke-width: 2px;
  pointer-events: none;
  fill: none;
}
</style>
