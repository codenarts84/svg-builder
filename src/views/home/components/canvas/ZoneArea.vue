<template>
  <g class="area" :transform="transform" @mousedown="mousedown" @mouseup="mouseup"
    :class="classes">
    <g v-if="area.shape === 'circle'">
      <circle :fill="area.color || '#888888'"
        :stroke="area.border_color || '#888888'" cx="0" cy="0"
        :r="area.circle.radius" :stroke-width="area.border_width || '2px'">
      </circle>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>
    <g v-if="area.shape === 'ellipse'">
      <ellipse :stroke="area.border_color || '#888888'" cx="0" cy="0"
        :fill="area.color || '#888888'" :rx="area.ellipse.radius.x"
        :ry="area.ellipse.radius.y" :stroke-width="area.border_width || '2px'">
      </ellipse>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>


    <g v-if="area.shape === 'gaCircle'">
      <ellipse :stroke="area.border_color || '#888888'" cx="0" cy="0"
        :fill="area.color || '#888888'" :rx="area.ellipse.radius.x"
        :ry="area.ellipse.radius.y" :stroke-width="area.border_width || '2px'"
        :data-section="area.section || ''" :data-category="area.category || ''"
        :data-abv="area.abbreviation || ''">
      </ellipse>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>

    <!-- <rect v-if="area.shape === 'rectangle' || area.shape === 'gaSquare'"
      :fill="area.color || '#888888'" :stroke="area.border_color || '#888888'"
      x="0" y="0" :width="area.rectangle.width" :height="area.rectangle.height"
      stroke-width="2px"></rect> -->
    <g v-if="area.shape === 'rectangle'">
      <rect :fill="area.color || '#888888'"
        :stroke="area.border_color || '#888888'" x="0" y="0"
        :width="area.rectangle.width" :height="area.rectangle.height"
        :stroke-width="area.border_width || '2px'"></rect>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>

    <g v-if="area.shape === 'gaSquare'">
      <rect :fill="area.color || '#888888'"
        :stroke="area.border_color || '#888888'" x="0" y="0"
        :width="area.rectangle.width" :height="area.rectangle.height"
        :stroke-width="area.border_width || '2px'"
        :data-section="area.section || ''" :data-category="area.category || ''"
        :data-abv="area.abbreviation || ''"></rect>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>

    <g v-if="area.shape === 'polygon'">
      <polygon :fill="area.color || '#888888'"
        :stroke="area.border_color || '#888888'" :points="polygonPoints"
        :stroke-width="area.border_width || '2px'"></polygon>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>

    <g v-if="area.shape === 'gaPolygon'">
      <polygon :fill="area.color || '#888888'"
        :stroke="area.border_color || '#888888'" :points="polygonPoints"
        :stroke-width="area.border_width || '2px'"
        :data-section="area.section || ''" :data-category="area.category || ''"
        :data-abv="area.abbreviation || ''"></polygon>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>


    <!-- <g v-if="area.shape === 'roundTable'"
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
    </g> -->

    <g v-if="area.shape === 'roundTable'">
      <!-- <circle :cx="area.position.x" :cy="area.position.y" :r="area.position.r">
      </circle> -->
      <circle :cx="0" :cy="0" :r="area.position.r" fill="#ffffff" stroke="#000"
        stroke-width="1">
      </circle>
      <circle v-for="item in area.roundTable.seats" :key="item" :cx="item.x"
        :cy="item.y" :r="item.r" stroke="#000" style="stroke-width: 1px;"
        fill="#ffffff" stroke-width="1">
      </circle>
      <text fill="black" v-for="item in area.roundTable.seats" :x="item.x"
        :y="item.y" text-anchor="middle" font-size="10px" font-family="sans-serif"
        :key="item" dy=".3em">{{ item.text }}</text>
    </g>

    <g v-if="area.shape === 'rectangleTable'">
      <rect :x="0" :y="0" :width="area.position.width"
        :height="area.position.height" fill="#ffffff" stroke="#000"
        stroke-width="1"></rect>
      <circle v-for=" item  in  area.rectangleTable.seats " :key="item"
        :cx="item.x" :cy="item.y" :r="item.r" stroke="#000"
        style="stroke-width: 1px;" fill="#ffffff" stroke-width="1">
      </circle>
      <text fill="black" v-for=" item  in  area.rectangleTable.seats " :x="item.x"
        :y="item.y" text-anchor="middle" font-size="10px" font-family="sans-serif"
        :key="item" dy=".3em">{{ item.text }}</text>
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
      <rect class="polygon-point-handle"
        v-for="( p, pid ) in  area.polygon.points " :key="'point-handle-' + pid"
        :x="p.x - 3" :y="p.y - 3" width="6" height="6"
        @mousedown="mousedownPolygonPoint($event, pid)"></rect>
      <rect class="polygon-new-point-handle"
        v-for="( p, pid ) in  area.polygon.points "
        :key="'new-point-handle-' + pid" :x="(p.x + getNextPoint(pid).x) / 2 - 2"
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
        // console.log('zonearea', this.area, this.zone, this.selection)
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
