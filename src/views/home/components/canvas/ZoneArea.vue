<template>
  <g
    class="area"
    :transform="transform"
    @mousedown="mousedown"
    @mouseup="mouseup"
    :class="classes"
  >
    <circle
      v-if="area.shape === 'circle'"
      :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'"
      cx="0"
      cy="0"
      :r="area.circle.radius"
      stroke-width="2px"
    ></circle>
    <ellipse
      v-if="area.shape === 'ellipse'"
      :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'"
      cx="0"
      cy="0"
      :rx="area.ellipse.radius.x"
      :ry="area.ellipse.radius.y"
      stroke-width="2px"
    ></ellipse>
    <rect
      v-if="area.shape === 'rectangle'"
      :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'"
      x="0"
      y="0"
      :width="area.rectangle.width"
      :height="area.rectangle.height"
      stroke-width="2px"
    ></rect>
    <polygon
      v-if="area.shape === 'polygon'"
      :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'"
      :points="polygonPoints"
      stroke-width="2px"
    ></polygon>
    <text
      v-if="area.text && area.text.text"
      :x="area.text.position.x"
      :y="area.text.position.y"
      :font-size="area.text.size || 16"
      text-anchor="middle"
      font-family="sans-serif"
      dy=".3em"
      :fill="area.text.color || '#888888'"
      >{{ area.text.text }}</text
    >
    <g
      v-if="
        isIndividuallySelected &&
        area.shape === 'polygon' &&
        area.polygon &&
        area.polygon.points
      "
    >
      <rect
        class="polygon-point-handle"
        v-for="(p, pid) in area.polygon.points"
        :key="'point-handle-' + pid"
        :x="p.x - 3"
        :y="p.y - 3"
        width="6"
        height="6"
        @mousedown="mousedownPolygonPoint($event, pid)"
      ></rect>
      <rect
        class="polygon-new-point-handle"
        v-for="(p, pid) in area.polygon.points"
        :key="'new-point-handle-' + pid"
        :x="(p.x + getNextPoint(pid).x) / 2 - 2"
        :y="(p.y + getNextPoint(pid).y) / 2 - 2"
        width="4"
        height="4"
        @mousedown="insertPolygonPointBefore($event, pid)"
      ></rect>
    </g>
  </g>
</template>

<script>
import { useMainStore } from "@/stores";
import { computed } from "vue";

export default {
  name: "ZoneArea",
  props: {
    area: Object,
    zone: Object,
  },
  setup() {
    const store = useMainStore();
    const cursor = computed(() => store.cursor);
    const selection = computed(() => store.selection);
    return { cursor, selection, store };
  },
  computed: {
    isSelected() {
      // console.log("Check here");
      // console.log(this.selection, this.area.uuid);
      return this.selection.includes(this.area.uuid);
    },
    isIndividuallySelected() {
      return this.selection.length === 1 && this.isSelected;
    },
    classes() {
      return {
        selected: this.isSelected,
        ["area-" + this.area.shape]: true,
      };
    },
    transform() {
      return this.area.rotation
        ? `translate(${this.area.position.x}, ${this.area.position.y}) rotate(${this.area.rotation})`
        : `translate(${this.area.position.x}, ${this.area.position.y})`;
    },
    polygonPoints() {
      return this.area.polygon
        ? this.area.polygon.points.map((p) => `${p.x},${p.y}`).join(" ")
        : "";
    },
  },
  methods: {
    startDragging(uuid, zone, event) {
      this.$emit("startDragging", uuid, zone, event);
    },
    getNextPoint(pid) {
      return this.area.polygon.points[
        pid ? pid - 1 : this.area.polygon.points.length - 1
      ];
    },
    insertPolygonPointBefore(event, pid) {
      const newPoint = {
        x: (this.area.polygon.points[pid].x + this.getNextPoint(pid).x) / 2,
        y: (this.area.polygon.points[pid].y + this.getNextPoint(pid).y) / 2,
      };
      this.$emit("insert-point", { point: newPoint, index: pid });
    },
    mousedownPolygonPoint(event, pid) {
      console.log("edge");
      if (event.which === 2) {
        // Middle click
        this.$emit("delete-point", pid);
      } else {
        this.$emit("start-dragging-point", {
          uuid: this.area.uuid,
          pid,
          zone: this.zone,
          event,
        });
      }
    },
    mousedown(event) {
      console.log("Mousedown on ZoneArea", event);
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }

      if (this.store.tool === "select") {
        this.$emit("startDragging", this.area.uuid, this.zone, event);
        event.stopPropagation();
        return true;
      }
      return false;
    },
  },
};
</script>

<style>
.movable g.area.selected,
.movable g.area.selected * {
  cursor: move;
}
.polygon-point-handle {
  stroke: #00c;
  stroke-width: 2px;
  fill: #fff;
  cursor: grabbing !important;
}
.polygon-new-point-handle {
  stroke: #00c;
  stroke-width: 2px;
  fill: #00c;
  cursor: copy !important;
}
</style>
