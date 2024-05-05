<template>
  <g class="area" :transform="transform" @mousedown="mousedown" @mouseup="mouseup"
    :class="classes">
    <g v-if="area.shape === 'circle'">
      <circle cx="0" cy="0" :r="area.circle.radius"
        :fill="area.color || '#888888'"
        :stroke="area.border_width >= 1 ? area.border_color || '#888888' : ''"
        :stroke-width="area.border_width || '2px'">
      </circle>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>
    <g v-if="area.shape === 'ellipse'">
      <ellipse
        :stroke="area.border_width >= 1 ? area.border_color || '#888888' : ''"
        cx="0" cy="0" :fill="area.color || '#888888'" :rx="area.ellipse.radius.x"
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
      <ellipse
        :stroke="area.border_width >= 1 ? area.border_color || '#888888' : ''"
        cx="0" cy="0" :fill="gaColor" :rx="area.ellipse.radius.x"
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

    <g v-if="area.shape === 'rectangle'">
      <rect :fill="area.color || '#888888'"
        :stroke="area.border_width >= 1 ? area.border_color || '#888888' : ''"
        x="0" y="0" :width="area.rectangle.width" :height="area.rectangle.height"
        :stroke-width="area.border_width || '2px'"></rect>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>

    <g v-if="area.shape === 'gaSquare'">
      <rect :fill="gaColor"
        :stroke="area.border_width >= 1 ? area.border_color || '#888888' : ''"
        x="0" y="0" :width="area.rectangle.width" :height="area.rectangle.height"
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
        :stroke="area.border_width >= 1 ? area.border_color || '#888888' : ''"
        :points="polygonPoints" :stroke-width="area.border_width || '2px'">
      </polygon>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>

    <g v-if="area.shape === 'gaPolygon'">
      <polygon :fill="gaColor"
        :stroke="area.border_width >= 1 ? area.border_color || '#888888' : ''"
        :points="polygonPoints" :stroke-width="area.border_width || '2px'"
        :data-section="area.section || ''" :data-category="area.category || ''"
        :data-abv="area.abbreviation || ''"></polygon>
      <text v-if="area.text.text" :x="area.text.position.x"
        :y="area.text.position.y" :font-size="area.text.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.text.color || '#888888'">
        {{ area.text.text }}
      </text>
    </g>

    <g v-if="area.shape === 'roundTable'" class="table">
      <circle class="table_circle" :cx="0" :cy="0" :r="area.radius" fill="#ffffff"
        stroke="#000" stroke-width="1">
      </circle>
      <text class="table_label" :x="area.label.position.x"
        :y="area.label.position.y" :font-size="area.label.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.label.color || '#888888'">
        {{ area.label.abv }}
      </text>
      <g class="table_seat" v-for="item in area.seats" :key="item"
        @mousedown="event => seat_mousedown(event, item.uuid)"
        @mouseup="event => seat_mouseup(event, item.uuid)">
        <circle class="table_seat_circle" :id="item.guid" :cx="item.position.x"
          :cy="item.position.y" :r="item.r" stroke="#000"
          style="stroke-width: 1px;" :fill="seatColor(item.category)"
          stroke-width="1" :data-section-label="item.section_label"
          :data-section-abv="item.section_abv" data-category-name=""
          data-category-abv="">
        </circle>
        <text fill="table_seat_label" :x="item.position.x" :y="item.position.y"
          text-anchor="middle" font-size="10px" font-family="sans-serif"
          :key="item" dy=".3em">{{
            item.seat_number }}</text>
      </g>
    </g>

    <g v-if="area.shape === 'rectangleTable'" class=" table"
      :transform="`translate(${-area.rectangleTable.width / 2}, ${-area.rectangleTable.height / 2})`">
      <rect class="table_rect" :x="0" :y="0" :width="area.rectangleTable.width"
        :height="area.rectangleTable.height" fill="#ffffff" stroke="#000"
        stroke-width="1"></rect>
      <text class="table_label" :x="area.label.position.x"
        :y="area.label.position.y" :font-size="area.label.size || 16"
        text-anchor="middle" font-family="sans-serif" dy=".3em"
        :fill="area.label.color || '#888888'">
        {{ area.label.abv }}
      </text>
      <g class="table-seat" v-for="(item) in area.seats" :key="item"
        @mousedown="event => seat_mousedown(event, item.uuid)"
        @mouseup="event => seat_mouseup(event, item.uuid)">
        <circle :id="item.guid" :cx="item.position.x" :cy="item.position.y"
          :r="item.radius" stroke="#000" style="stroke-width: 1px;"
          :fill="seatColor(item.category)" stroke-width="1"
          :data-section-label="item.section_label"
          :data-section-abv="item.section_abv" data-category-name=""
          data-category-abv="">
        </circle>
        <text fill="black" :x="item.position.x" :y="item.position.y"
          text-anchor="middle" font-size="10px" font-family="sans-serif"
          dy=".3em">{{ item.seat_number }}</text>
      </g>
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
import { usePlanStore } from "@/stores/plan";
import { area } from "d3";
import { computed, ref } from "vue";


export default {
  name: "ZoneArea",
  props: {
    area: Object,
    zone: Object,
    ox: Number,
    oy: Number,
    selectionBoundary: Object
  },
  setup() {
    const store = useMainStore();
    const planStore = usePlanStore();
    const cursor = computed(() => store.cursor);
    const selection = computed(() => store.selection);
    const getCategoryByName = computed(() => planStore.getCategoryByName);
    const temp_ox = ref(0);
    const temp_oy = ref(0);
    return { cursor, selection, store, getCategoryByName, temp_ox, temp_oy };
  },
  computed: {
    gaColor() {
      if (this.area.category) {
        return this.getCategoryByName(this.area.category).color;
      }
      return this.area.color || '#888888'
    },
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
    seatColor(category) {
      if (category) {
        return this.getCategoryByName(category).color
      }
      return '#fff';
    },
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
      setTimeout(() => {
        if (this.selectionBoundary) {

          // const temp = this.selectionBoundary;
          this.temp_ox = this.selectionBoundary.x + this.selectionBoundary.width / 2;
          this.temp_oy = this.selectionBoundary.y + this.selectionBoundary.height / 2;
          const store = useMainStore();
          store.set_Ox(this.temp_ox);
          store.set_Oy(this.temp_oy);
          // console.log('Aha', temp)
        }
      }, 100);

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

    seat_mousedown(event, uuid) {
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      if (useMainStore().tool === "seatselect") {
        this.$emit("startDragging", uuid, this.zone, event);
        event.stopPropagation();
        return true;
      }
      return false;
    },

    seat_mouseup(event, uuid) {
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      const interval = new Date().getTime() - this.lastMouseUp;
      this.lastMouseUp = new Date().getTime();
      if (useMainStore().tool === "seatselect") {
        if (!useMainStore().dragged) {
          useMainStore().toggleSelection(
            [uuid],
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
        useMainStore().toggleSelection([uuid], false, this.zone.uuid);

        return true;
      }
      return false;
    }
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
