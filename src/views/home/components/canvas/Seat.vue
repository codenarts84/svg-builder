<template>
  <g @mousedown="mousedown" @mouseup="mouseup" :class="classObject">
    <circle :id="seatID" :fill="seatColor" :cx="seat.position.x"
      :cy="seat.position.y" :r="radius" :stroke="category ? 'none' : '#000'"
      style="stroke-width: 1px" data-seat-label="" data-row-label=""
      data-section-label="" data-section-abv="" data-category-name=""
      data-category-abv="">
    </circle>
    <text class="seat_label" :fill="textColor ? 'black' : 'black'"
      :x="seat.position.x" :y="seat.position.y" text-anchor="middle"
      font-size="10px" font-family="sans-serif" dy=".3em">
      {{ textContent }}
    </text>
  </g>
</template>
<script>
import { contrast, hex2rgb } from "@/lib/colors";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
import { computed } from "vue";
import { letterCounter } from "@/lib/numbering";

export default {
  name: "SeatComp",
  props: {
    seat: Object,
    zone: Object,
    row_number: String,
  },
  data() {
    return {
      lastMouseUp: 0,
    };
  },
  setup() {
    const planstore = usePlanStore();
    const store = useMainStore();

    const getCategoryByName = computed(() => planstore.getCategoryByName);
    const cursor = computed(() => store.cursor);

    return { getCategoryByName, cursor };
  },
  computed: {
    seatID() {
      return `seat-${this.$props.row_number}-${this.seat.seat_number}`
    },

    classObject() {
      return {
        seat: true,
        selected: useMainStore().selection.includes(this.seat.uuid),
      };
    },
    textContent() {
      // let content = this.seat.seat_number;
      // if (this.seat.flag) {
      //   content = this.seat.flag;
      // }
      // if (this.seat.start_direction) {
      //   content = this.seat.start_direction;
      // }
      // return content;
      return this.seat.seat_number;
      // return letterCounter(this.seat.seat_number, 'A');
    },
    category() {
      return this.getCategoryByName(this.seat.category);
    },
    radius() {
      if (this.seat.radius !== undefined) {
        return this.seat.radius;
      } else {
        return 10;
      }
    },
    seatColor() {
      if (this.category) {
        return this.category.color;
      } else {
        return "#fff";
      }
    },
    textColor() {
      if (this.category) {
        const c = contrast([0, 0, 0], hex2rgb(this.category.color));
        if (c < 5) return "#FFFFFF";
        else return "#000000";
      } else {
        return "#666666";
      }
    },
  },
  methods: {
    mouseup(event) {
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      const interval = new Date().getTime() - this.lastMouseUp;
      this.lastMouseUp = new Date().getTime();
      if (useMainStore().tool === "seatselect") {
        if (!useMainStore().dragged) {
          useMainStore().toggleSelection(
            [this.seat.uuid],
            event.shiftKey,
            this.zone.uuid
          );
        }
        if (useMainStore().dragging) {
          useMainStore().stopDragging();
        }
        return true;
      } else if (useMainStore().tool === "select" && interval < 500) {
        // console.log(interval);
        // doubleclick
        useMainStore().changeTool("seatselect");
        useMainStore().toggleSelection([this.seat.uuid], false, this.zone.uuid);

        return true;
      }
      return false;
    },
    mousedown(event) {
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      if (useMainStore().tool === "seatselect") {
        this.$emit("startDragging", this.seat.uuid, this.zone, event);
        event.stopPropagation();
        return true;
      }
      return false;
    },
  },
};
</script>
<style>
.movable .selected g.seat *,
.movable g.seat.selected * {
  cursor: move;
}
</style>
