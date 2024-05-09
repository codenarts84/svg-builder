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
        :data-section-label="area.section || ''"
        :data-category-name="area.category || ''"
        :data-section-abv="area.abbreviation || ''">
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
        :data-section-label="area.section || ''"
        :data-category-name="area.category || ''"
        :data-section-abv="area.abbreviation || ''"></rect>
      <text v-if="area.text.text" :x="area.rectangle.width / 2"
        :y="area.rectangle.height / 2" :font-size="area.text.size || 16"
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
        :data-section-label="area.section || ''"
        :data-category-name="area.category || ''"
        :data-section-abv="area.abbreviation || ''">
      </polygon>
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
        :fill="area.label.color || '#888888'"
        :transform="!area.rotate_label ? `rotate(${-area.rotation})` : ''">
        {{ area.label.abv }}
      </text>
      <g class="table_seat_group" v-for="(item, idx) in area.seats" :key="item"
        @mousedown="event => seat_mousedown(event, item.uuid)"
        @mouseup="event => seat_mouseup(event, item.uuid)">
        <circle class="table_seat_circle" :id="item.guid" :cx="item.position.x"
          :cy="item.position.y" :r="item.r" stroke="#000"
          style="stroke-width: 1px;" :fill="seatColor(item.category)"
          stroke-width="1" :data-section-label="item.section_label"
          :data-section-abv="item.section_abv" :data-category-name="item.category"
          :data-tags="makeTag(item)">
        </circle>

        <g v-if="item.tag_name && !item.tag_name.includes('Standing Room Only') && item.tag_name.includes('Wheelchair')"
          :transform="`matrix(1, 0, 0, 1, ${item.position.x - 5}, ${item.position.y - 6})`"
          data-object-type="seat-icon" x="-5" y="-6" data-seat-id="element-1-1"
          data-seat-icon="wheelchair" data-v-e185086c="">
          <g data-v-e185086c="">
            <path
              d="M 3.261719 0.015625 C 2.613281 0.117188 2.195312 0.742188 2.378906 1.347656 C 2.476562 1.675781 2.761719 1.957031 3.097656 2.058594 C 3.386719 2.144531 3.660156 2.125 3.925781 1.996094 C 4.148438 1.890625 4.3125 1.734375 4.421875 1.523438 C 4.503906 1.367188 4.53125 1.265625 4.535156 1.085938 C 4.539062 0.972656 4.539062 0.9375 4.519531 0.851562 C 4.429688 0.429688 4.101562 0.113281 3.660156 0.0234375 C 3.554688 0 3.371094 -0.00390625 3.261719 0.015625 Z M 3.261719 0.015625 "
              data-v-e185086c=""
              :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor(item) }">
            </path>
            <path
              d="M 3.367188 2.3125 C 3.355469 2.3125 3.324219 2.320312 3.292969 2.324219 C 3.105469 2.363281 2.917969 2.460938 2.769531 2.601562 C 2.574219 2.785156 2.46875 3.011719 2.453125 3.277344 C 2.449219 3.359375 2.457031 3.527344 2.519531 4.523438 C 2.527344 4.609375 2.554688 5.121094 2.589844 5.65625 C 2.636719 6.433594 2.652344 6.652344 2.667969 6.71875 C 2.734375 7.035156 2.957031 7.296875 3.273438 7.4375 C 3.347656 7.472656 3.476562 7.511719 3.574219 7.53125 C 3.613281 7.539062 4.1875 7.542969 5.488281 7.542969 L 7.347656 7.546875 L 7.476562 7.761719 C 8.464844 9.402344 8.824219 9.992188 8.851562 10.023438 C 8.941406 10.128906 9.082031 10.210938 9.222656 10.242188 C 9.324219 10.265625 9.480469 10.257812 9.574219 10.226562 C 9.902344 10.117188 10.074219 9.769531 9.960938 9.445312 C 9.941406 9.382812 9.746094 9.058594 8.988281 7.808594 C 8.46875 6.949219 8.03125 6.226562 8.011719 6.195312 C 7.929688 6.082031 7.789062 5.988281 7.640625 5.945312 C 7.585938 5.929688 7.480469 5.929688 6.160156 5.925781 L 4.738281 5.925781 L 4.730469 5.761719 C 4.726562 5.675781 4.722656 5.496094 4.71875 5.363281 L 4.710938 5.128906 L 5.734375 5.128906 C 6.621094 5.128906 6.769531 5.125 6.820312 5.113281 C 7.078125 5.050781 7.246094 4.820312 7.207031 4.578125 C 7.179688 4.402344 7.0625 4.269531 6.878906 4.195312 C 6.828125 4.175781 6.828125 4.175781 5.738281 4.171875 L 4.652344 4.167969 L 4.644531 4.070312 C 4.609375 3.613281 4.574219 3.21875 4.566406 3.164062 C 4.546875 3.027344 4.476562 2.867188 4.390625 2.742188 C 4.292969 2.605469 4.097656 2.453125 3.9375 2.386719 C 3.792969 2.328125 3.714844 2.3125 3.542969 2.308594 C 3.457031 2.308594 3.378906 2.308594 3.367188 2.3125 Z M 3.367188 2.3125 "
              data-v-e185086c=""
              :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor(item) }">
            </path>
            <path
              d="M 1.84375 4.753906 C 1.328125 5.089844 0.90625 5.511719 0.585938 6.015625 C 0.03125 6.886719 -0.136719 7.957031 0.117188 8.96875 C 0.367188 9.945312 0.988281 10.789062 1.871094 11.347656 C 2.878906 11.984375 4.132812 12.164062 5.292969 11.84375 C 6.285156 11.570312 7.152344 10.929688 7.6875 10.074219 C 7.796875 9.90625 7.925781 9.65625 7.917969 9.640625 C 7.90625 9.609375 7.347656 8.691406 7.34375 8.691406 C 7.339844 8.691406 7.332031 8.71875 7.324219 8.75 C 7.304688 8.835938 7.242188 9.039062 7.191406 9.164062 C 6.839844 10.03125 6.109375 10.703125 5.195312 11 C 4.558594 11.210938 3.851562 11.222656 3.191406 11.035156 C 2.492188 10.832031 1.839844 10.371094 1.421875 9.777344 C 1.140625 9.371094 0.96875 8.941406 0.894531 8.4375 C 0.871094 8.269531 0.871094 7.796875 0.894531 7.636719 C 0.929688 7.40625 0.976562 7.21875 1.046875 7.03125 C 1.214844 6.5625 1.476562 6.167969 1.855469 5.8125 L 2.019531 5.65625 L 1.988281 5.1875 C 1.972656 4.929688 1.960938 4.710938 1.960938 4.703125 C 1.960938 4.695312 1.957031 4.6875 1.953125 4.6875 C 1.949219 4.6875 1.898438 4.71875 1.84375 4.753906 Z M 1.84375 4.753906 "
              data-v-e185086c=""
              :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor(item) }">
            </path>
          </g>
        </g>

        <circle v-if="showTag(item)" :fill="seatColor(item.category)"
          :cx="item.position.x" :cy="item.position.y + 7" :r="3" :stroke="'#000'"
          style="stroke-width: 1px">
        </circle>

        <text fill="table_seat_label" :x="item.position.x" :y="item.position.y"
          text-anchor="middle" font-size="10px" font-family="sans-serif"
          :key="item" dy=".3em"
          :transform="!area.rotate_label ? roundTableTransform(area, item, idx) : ''">{{
            area.skip_letter ? item.skip_number : item.seat_number }}</text>
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
        :fill="area.label.color || '#888888'"
        :transform="!area.rotate_label ? `translate(${area.rectangleTable.width / 2}, ${area.rectangleTable.height / 2}) rotate(${-area.rotation})`
          : `translate(${area.rectangleTable.width / 2}, ${area.rectangleTable.height / 2})`">
        {{ area.label.abv }}
      </text>
      <g class="table_seat_group" v-for="(item, index) in area.seats" :key="item"
        @mousedown="event => seat_mousedown(event, item.uuid)"
        @mouseup="event => seat_mouseup(event, item.uuid)">
        <circle :id="item.guid" :cx="item.position.x" :cy="item.position.y"
          :r="item.radius" stroke="#000" style="stroke-width: 1px;"
          :fill="seatColor(item.category)" stroke-width="1"
          :data-section-label="item.section_label"
          :data-section-abv="item.section_abv" :data-category-name="item.category"
          :data-tags="makeTag(item)">
        </circle>

        <g v-if="item.tag_name && !item.tag_name.includes('Standing Room Only') && item.tag_name.includes('Wheelchair')"
          :transform="`matrix(1, 0, 0, 1, ${item.position.x - 5}, ${item.position.y - 6})`"
          data-object-type="seat-icon" x="-5" y="-6" data-seat-id="element-1-1"
          data-seat-icon="wheelchair" data-v-e185086c="">
          <g data-v-e185086c="">
            <path
              d="M 3.261719 0.015625 C 2.613281 0.117188 2.195312 0.742188 2.378906 1.347656 C 2.476562 1.675781 2.761719 1.957031 3.097656 2.058594 C 3.386719 2.144531 3.660156 2.125 3.925781 1.996094 C 4.148438 1.890625 4.3125 1.734375 4.421875 1.523438 C 4.503906 1.367188 4.53125 1.265625 4.535156 1.085938 C 4.539062 0.972656 4.539062 0.9375 4.519531 0.851562 C 4.429688 0.429688 4.101562 0.113281 3.660156 0.0234375 C 3.554688 0 3.371094 -0.00390625 3.261719 0.015625 Z M 3.261719 0.015625 "
              data-v-e185086c=""
              :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor(item) }">
            </path>
            <path
              d="M 3.367188 2.3125 C 3.355469 2.3125 3.324219 2.320312 3.292969 2.324219 C 3.105469 2.363281 2.917969 2.460938 2.769531 2.601562 C 2.574219 2.785156 2.46875 3.011719 2.453125 3.277344 C 2.449219 3.359375 2.457031 3.527344 2.519531 4.523438 C 2.527344 4.609375 2.554688 5.121094 2.589844 5.65625 C 2.636719 6.433594 2.652344 6.652344 2.667969 6.71875 C 2.734375 7.035156 2.957031 7.296875 3.273438 7.4375 C 3.347656 7.472656 3.476562 7.511719 3.574219 7.53125 C 3.613281 7.539062 4.1875 7.542969 5.488281 7.542969 L 7.347656 7.546875 L 7.476562 7.761719 C 8.464844 9.402344 8.824219 9.992188 8.851562 10.023438 C 8.941406 10.128906 9.082031 10.210938 9.222656 10.242188 C 9.324219 10.265625 9.480469 10.257812 9.574219 10.226562 C 9.902344 10.117188 10.074219 9.769531 9.960938 9.445312 C 9.941406 9.382812 9.746094 9.058594 8.988281 7.808594 C 8.46875 6.949219 8.03125 6.226562 8.011719 6.195312 C 7.929688 6.082031 7.789062 5.988281 7.640625 5.945312 C 7.585938 5.929688 7.480469 5.929688 6.160156 5.925781 L 4.738281 5.925781 L 4.730469 5.761719 C 4.726562 5.675781 4.722656 5.496094 4.71875 5.363281 L 4.710938 5.128906 L 5.734375 5.128906 C 6.621094 5.128906 6.769531 5.125 6.820312 5.113281 C 7.078125 5.050781 7.246094 4.820312 7.207031 4.578125 C 7.179688 4.402344 7.0625 4.269531 6.878906 4.195312 C 6.828125 4.175781 6.828125 4.175781 5.738281 4.171875 L 4.652344 4.167969 L 4.644531 4.070312 C 4.609375 3.613281 4.574219 3.21875 4.566406 3.164062 C 4.546875 3.027344 4.476562 2.867188 4.390625 2.742188 C 4.292969 2.605469 4.097656 2.453125 3.9375 2.386719 C 3.792969 2.328125 3.714844 2.3125 3.542969 2.308594 C 3.457031 2.308594 3.378906 2.308594 3.367188 2.3125 Z M 3.367188 2.3125 "
              data-v-e185086c=""
              :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor(item) }">
            </path>
            <path
              d="M 1.84375 4.753906 C 1.328125 5.089844 0.90625 5.511719 0.585938 6.015625 C 0.03125 6.886719 -0.136719 7.957031 0.117188 8.96875 C 0.367188 9.945312 0.988281 10.789062 1.871094 11.347656 C 2.878906 11.984375 4.132812 12.164062 5.292969 11.84375 C 6.285156 11.570312 7.152344 10.929688 7.6875 10.074219 C 7.796875 9.90625 7.925781 9.65625 7.917969 9.640625 C 7.90625 9.609375 7.347656 8.691406 7.34375 8.691406 C 7.339844 8.691406 7.332031 8.71875 7.324219 8.75 C 7.304688 8.835938 7.242188 9.039062 7.191406 9.164062 C 6.839844 10.03125 6.109375 10.703125 5.195312 11 C 4.558594 11.210938 3.851562 11.222656 3.191406 11.035156 C 2.492188 10.832031 1.839844 10.371094 1.421875 9.777344 C 1.140625 9.371094 0.96875 8.941406 0.894531 8.4375 C 0.871094 8.269531 0.871094 7.796875 0.894531 7.636719 C 0.929688 7.40625 0.976562 7.21875 1.046875 7.03125 C 1.214844 6.5625 1.476562 6.167969 1.855469 5.8125 L 2.019531 5.65625 L 1.988281 5.1875 C 1.972656 4.929688 1.960938 4.710938 1.960938 4.703125 C 1.960938 4.695312 1.957031 4.6875 1.953125 4.6875 C 1.949219 4.6875 1.898438 4.71875 1.84375 4.753906 Z M 1.84375 4.753906 "
              data-v-e185086c=""
              :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor(item) }">
            </path>
          </g>
        </g>

        <circle v-if="showTag(item)" :fill="seatColor(item.category)"
          :cx="item.position.x" :cy="item.position.y + 7" :r="3" :stroke="'#000'"
          style="stroke-width: 1px">
        </circle>

        <text fill="black" :x="item.position.x" :y="item.position.y"
          text-anchor="middle" font-size="10px" font-family="sans-serif" dy=".3em"
          :transform="!area.rotate_label ? rectangleTableTransform(area, item, index) : ''">{{
            area.skip_letter ? item.skip_number : item.seat_number }}</text>
      </g>
    </g>

    <text v-if="area.shape === 'text' && area.text && area.text.text"
      :x="area.text.position.x" :y="area.text.position.y"
      :font-size="area.text.size || 16" text-anchor="middle"
      font-family="sans-serif" dy=".3em" :fill="area.text.color || '#888888'">{{
        area.text.text }}</text>
    <g v-if="isIndividuallySelected &&
      (area.shape === 'polygon' || area.shape === 'gaPolygon') &&
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
import { computed, ref } from "vue";


export default {
  name: "ZoneArea",
  props: {
    area: Object,
    zone: Object,
    ox: Number,
    oy: Number,
    selectionBoundary: Object,
    startDraggingPolygonPoint: Function
  },
  data() {
    return {
      ignoreNextMouseUp: false
    }
  },
  setup() {
    const store = useMainStore();
    const planStore = usePlanStore();
    const cursor = computed(() => store.cursor);
    const selection = computed(() => store.selection);
    const getCategoryByName = computed(() => planStore.getCategoryByName);
    const temp_ox = ref(0);
    const temp_oy = ref(0);
    const tool = computed(() => store.tool);
    return { cursor, selection, store, getCategoryByName, temp_ox, temp_oy, tool, planStore };
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
    makeTag(item) {
      const res = []
      if (item.tag_name) {
        if (item.tag_name.includes('Partial View')) res.push('P')
        if (item.tag_name.includes('Folding Chair')) res.push('F')
        return res.join(',')
      }
      return '';
    },
    showTag(item) {
      const tags = [
        "Wheelchair Companion",
        "Partial View",
        "Folding Chair"
      ]
      if (item.tag_name && !item.tag_name.includes('Standing Room Only')) {
        let res = false;
        tags.forEach(tag => {
          if (item.tag_name.includes(tag))
            res = true;
        })
        return res;
      }
      return false;
    },

    tagColor(item) {
      return item.category ? '#ffffff' : '#0064d0';
    },

    roundTableTransform(area, item, idx) {
      const theta = area.rotation * Math.PI / 180;
      const len = area.seats.length + area?.space;
      const dx = (area.radius + (10 || item.radius)) * Math.cos(theta + 2 * Math.PI / len * idx) - item.position.x
      const dy = (area.radius + (10 || item.radius)) * Math.sin(theta + 2 * Math.PI / len * idx) - item.position.y
      return `rotate(${-area.rotation}) translate(${dx}, ${dy})`
    },

    rectangleTableTransform(area, item, index) {
      const theta = area.rotation * Math.PI / 180;
      const centerX = area.position.x;
      const centerY = area.position.y;
      const newX = item.position.x * Math.cos(theta) - item.position.y * Math.sin(theta);
      const newY = item.position.x * Math.sin(theta) + item.position.y * Math.cos(theta);
      const dx = newX - item.position.x;
      const dy = newY - item.position.y;
      return `rotate(${-area.rotation}) translate(${dx}, ${dy})`
    },

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
      // const newPoint = {
      //   x: (this.area.polygon.points[pid].x + this.getNextPoint(pid).x) / 2,
      //   y: (this.area.polygon.points[pid].y + this.getNextPoint(pid).y) / 2,
      // };
      // this.$emit("insert-point", { point: newPoint, index: pid });
      if (event.ctrlKey || event.metaKey) {
        return false;
      }
      if (this.tool === 'select' || this.tool === 'polygon') {
        this.planStore.addPolygonPoint(this.area, pid, {
          x: (this.area.polygon.points[pid].x + this.area.polygon.points[pid ? pid - 1 : this.area.polygon.points.length - 1].x) / 2,
          y: (this.area.polygon.points[pid].y + this.area.polygon.points[pid ? pid - 1 : this.area.polygon.points.length - 1].y) / 2,
        })
        // this.area.polygon.points.splice(pid, 0, {
        //   x: (this.area.polygon.points[pid].x + this.area.polygon.points[pid ? pid - 1 : this.area.polygon.points.length - 1].x) / 2,
        //   y: (this.area.polygon.points[pid].y + this.area.polygon.points[pid ? pid - 1 : this.area.polygon.points.length - 1].y) / 2,
        // })
        this.ignoreNextMouseUp = true;
        event.stopPropagation();
        return true;
      }
      return false;
    },
    mousedownPolygonPoint(event, pid) {
      if (event.ctrlKey || event.metaKey) {
        return false;
      }

      if (this.tool === 'select' || this.tool === 'polygon' || this.tool === 'gaPolygon') {
        if (event.which === 2) {
          this.planStore.removePolygonPoint(this.area, pid);
          // this.area.polygon.points.splice(pid, 1);
          this.ignoreNextMouseUp = true;
        } else {
          this.startDraggingPolygonPoint(this.area.uuid, this.zone, event, pid)
          // this.$emit("startDraggingPolygonPoint", this.area.uuid, pid, this.zone, event);
          this.ignoreNextMouseUp = false;
        }
        event.stopPropagation();
        return true;
      }
      return false;
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
