<template>
  <g class="area" :transform="transform" @mousedown="mousedown" @mouseup="mouseup"
    :class="classes">
    <circle v-if="area.shape === 'circle'" :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'" cx="0" cy="0"
      :r="area.circle.radius" stroke-width="2px"></circle>
    <ellipse v-if="area.shape === 'ellipse'" :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'" cx="0" cy="0"
      :rx="area.ellipse.radius.x" :ry="area.ellipse.radius.y" stroke-width="2px">
    </ellipse>
    <rect v-if="area.shape === 'rectangle'" :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'" x="0" y="0"
      :width="area.rectangle.width" :height="area.rectangle.height"
      stroke-width="2px"></rect>
    <polygon v-if="area.shape === 'polygon'" :fill="area.color || '#888888'"
      :stroke="area.border_color || '#888888'" :points="polygonPoints"
      stroke-width="2px"></polygon>
    <g v-if="area.shape === 'roundTable'"
      :transform="`scale(${area.roundTable.scale})`" :x="area.position.x"
      :y="area.position.y">
      <path d="M17.5,7.5c-0.6,0-1.1,0.2-1.6,0.6l0,0l0,0c0.2,0.6,0.3,1.2,0.3,1.8c0,0.6-0.1,1.2-0.3,1.8l0,0l0,0c0.4,0.4,1,0.6,1.6,0.6
		c1.4,0,2.5-1.1,2.5-2.5C20,8.6,18.9,7.5,17.5,7.5z" />
      <path d="M4.1,11.9L4.1,11.9c-0.2-0.6-0.4-1.2-0.4-1.9c0-0.6,0.1-1.2,0.3-1.8l0,0l0,0c-0.4-0.4-1-0.6-1.6-0.6C1.1,7.5,0,8.6,0,10
		c0,1.4,1.1,2.5,2.5,2.5C3.1,12.5,3.6,12.3,4.1,11.9L4.1,11.9z" />
      <path d="M5.4,5.8L5.4,5.8L5.4,5.8c0.5-0.5,0.9-0.9,1.5-1.2C7.4,4.3,8,4.1,8.6,4l0,0l0,0c0.1-0.6,0-1.2-0.3-1.7
		C7.7,1.1,6.2,0.7,5,1.3C3.8,2,3.4,3.5,4.1,4.7C4.4,5.2,4.9,5.6,5.4,5.8z" />
      <path
        d="M14.6,14.2L14.6,14.2L14.6,14.2c-0.5,0.5-0.9,0.9-1.5,1.2c-0.5,0.3-1.1,0.5-1.7,0.6l0,0l0,0c-0.1,0.6,0,1.2,0.3,1.7
		c0.7,1.2,2.2,1.6,3.4,0.9c1.2-0.7,1.6-2.2,0.9-3.4C15.6,14.8,15.1,14.4,14.6,14.2z" />
      <path d="M8.7,16L8.7,16c-0.7-0.1-1.3-0.3-1.8-0.6c-0.5-0.3-1-0.7-1.4-1.2l0,0l0,0c-0.5,0.2-1,0.6-1.3,1.1C3.4,16.5,3.8,18,5,18.7
		c1.2,0.7,2.7,0.3,3.4-0.9C8.7,17.2,8.8,16.6,8.7,16L8.7,16z" />
      <path d="M11.3,4L11.3,4c0.7,0.1,1.3,0.3,1.8,0.6c0.5,0.3,1,0.7,1.4,1.2l0,0l0,0c0.5-0.2,1-0.6,1.3-1.1C16.6,3.5,16.2,2,15,1.3
		c-1.2-0.7-2.7-0.3-3.4,0.9C11.3,2.8,11.2,3.4,11.3,4L11.3,4z" />
      <path d="M14.8,10c0-2.7-2.2-4.9-4.8-4.9S5.2,7.3,5.2,10s2.2,4.8,4.8,4.8S14.8,12.7,14.8,10z M10,14.1c-2.3,0-4.1-1.8-4.1-4.1
		S7.7,5.9,10,5.9s4.1,1.8,4.1,4.1S12.3,14.1,10,14.1z" />
    </g>

    <!-- <g v-if="area.shape === 'roundTable'">
      <circle cx="0" cy="0" :r="40"></circle>
    </g> -->

    <g v-if="area.shape === 'rectangleTable'"
      :transform="`scale(${area.rectangleTable.scale})`" :x="area.position.x"
      :y="area.position.y">
      <path d="M10,16.3c-0.6,0-1.2-0.1-1.8-0.3c-0.4,0.4-0.6,1-0.6,1.6c0,1.4,1.1,2.5,2.5,2.5c1.4,0,2.5-1.1,2.5-2.5
		c-0.1-0.7-0.3-1.2-0.7-1.7C11.3,16.1,10.7,16.3,10,16.3z" />
      <path d="M10,3.8c0.6,0,1.2,0.1,1.8,0.3c0.4-0.4,0.6-1,0.6-1.6C12.5,1.1,11.4,0,10,0S7.5,1.1,7.5,2.5c0,0.6,0.2,1.1,0.6,1.6
		C8.8,3.9,9.4,3.8,10,3.8z" />
      <path d="M3.2,16.2c-0.6,0-1.2-0.1-1.8-0.3c-0.4,0.4-0.6,1-0.6,1.6c0,1.4,1.1,2.5,2.5,2.5c1.4,0,2.5-1.1,2.5-2.5
		c-0.1-0.6-0.3-1.2-0.7-1.7C4.5,16,3.9,16.2,3.2,16.2z" />
      <path d="M3.2,3.7C3.8,3.7,4.4,3.8,5,4c0.4-0.4,0.6-1,0.6-1.6C5.7,1.1,4.6,0,3.2,0C1.9,0,0.8,1.1,0.8,2.5C0.8,3,1,3.6,1.4,4.1
		C2,3.8,2.6,3.7,3.2,3.7z" />
      <path d="M16.7,16.2c-0.6,0-1.2-0.1-1.8-0.3c-0.4,0.4-0.6,1-0.6,1.6c0,1.4,1.1,2.5,2.5,2.5c1.4,0,2.5-1.1,2.5-2.5
		c-0.1-0.6-0.3-1.2-0.7-1.7C18,16,17.4,16.2,16.7,16.2z" />
      <path d="M16.8,3.7c0.6,0,1.2,0.1,1.8,0.3c0.4-0.4,0.6-1,0.6-1.6c0-1.4-1.1-2.5-2.5-2.5c-1.4,0-2.5,1.1-2.5,2.5
		c0.1,0.6,0.3,1.2,0.7,1.7C15.5,3.9,16.1,3.7,16.8,3.7z" />
      <path
        d="M19.2,5.1H0.8C0.4,5.1,0,5.5,0,5.9v8.2c0,0.5,0.4,0.8,0.8,0.8h18.4c0.5,0,0.8-0.4,0.8-0.8V5.9C20,5.5,19.6,5.1,19.2,5.1z M19.2,14.1C19.2,14.1,19.2,14.2,19.2,14.1L0.8,14.2c0,0-0.1,0-0.1-0.1V5.9c0,0,0-0.1,0.1-0.1h18.4c0,0,0.1,0,0.1,0.1V14.1z" />
    </g>

    <g v-if="area.shape === 'gaSquare'"
      :transform="`scale(${area.gaSquare.scale})`" :x="area.position.x"
      :y="area.position.y">
      <path d="M0,0v20h20V0H0z M19,19H1V1h18V19z" />
      <path
        d="M6.2,13.6c1.2,0,2.2-0.5,2.9-1.1v-3h-3v1.1h1.8V12c-0.4,0.3-1,0.5-1.7,0.5c-1.4,0-2.4-1.1-2.4-2.5v0c0-1.3,1-2.5,2.3-2.5
		c0.9,0,1.4,0.3,2,0.8l0.8-0.9c-0.7-0.6-1.5-1-2.7-1C4.1,6.4,2.5,8,2.5,10v0C2.5,12.1,4,13.6,6.2,13.6z" />
      <path
        d="M12.1,11.8h3.3l0.7,1.7h1.3l-3.1-7.1h-1.1l-3.1,7.1h1.3L12.1,11.8z M13.8,7.9l1.2,2.8h-2.4L13.8,7.9z" />
    </g>

    <g v-if="area.shape === 'gaCircle'"
      :transform="`scale(${area.gaCircle.scale})`" :x="area.position.x"
      :y="area.position.y">

      <g>
        <path d="M10,0.8c5.1,0,9.2,4.1,9.2,9.2s-4.1,9.2-9.2,9.2S0.8,15.1,0.8,10S4.9,0.8,10,0.8 M10,0C4.5,0,0,4.5,0,10s4.5,10,10,10
		s10-4.5,10-10S15.5,0,10,0L10,0z" />
      </g>
      <path
        d="M6.2,13.6c1.2,0,2.2-0.5,2.9-1.1v-3h-3v1.1h1.8V12c-0.4,0.3-1,0.5-1.7,0.5c-1.4,0-2.4-1.1-2.4-2.5v0c0-1.3,1-2.5,2.3-2.5
	c0.9,0,1.4,0.3,2,0.8l0.8-0.9c-0.7-0.6-1.5-1-2.7-1C4.1,6.4,2.5,8,2.5,10v0C2.5,12.1,4,13.6,6.2,13.6z" />
      <path
        d="M12.1,11.8h3.3l0.7,1.7h1.3l-3.1-7.1h-1.1l-3.1,7.1h1.3L12.1,11.8z M13.8,7.9l1.2,2.8h-2.4L13.8,7.9z" />

    </g>

    <text v-if="area.shape === 'text' && area.text && area.text.text"
      :x="area.text.position.x" :y="area.text.position.y"
      :font-size="area.text.size || 16" text-anchor="middle"
      font-family="sans-serif" dy=".3em" :fill="area.text.color || '#888888'">{{
        area.text.text }}</text>
    <g v-if="isIndividuallySelected &&
      area.shape === 'polygon' &&
      area.polygon &&
      area.polygon.points
      ">
      <rect class="polygon-point-handle" v-for="(p, pid) in area.polygon.points"
        :key="'point-handle-' + pid" :x="p.x - 3" :y="p.y - 3" width="6"
        height="6" @mousedown="mousedownPolygonPoint($event, pid)"></rect>
      <rect class="polygon-new-point-handle"
        v-for="(p, pid) in area.polygon.points" :key="'new-point-handle-' + pid"
        :x="(p.x + getNextPoint(pid).x) / 2 - 2"
        :y="(p.y + getNextPoint(pid).y) / 2 - 2" width="4" height="4"
        @mousedown="insertPolygonPointBefore($event, pid)"></rect>
    </g>
  </g>
</template>

<script>
import { useMainStore } from "@/stores";
import { computed } from "vue";

import TableRoundIcon from "@/assets/svgs/menuIcons/TableRoundIcon.vue";

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
      if (event.ctrlKey || event.metaKey) {
        return false;
      }

      if (this.store.tool === "select") {
        console.log('zonearea', this.area, this.zone)
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
