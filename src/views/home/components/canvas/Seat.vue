<template>
  <g @mousedown="mousedown" @mouseup="mouseup" class="seat_group"
    data-object-type="seat_group">

    <circle class="seat_circle" :id="seat.guid" :fill="seatColor"
      :cx="seat.position.x" :cy="seat.position.y" :r="radius" stroke="#000"
      style="stroke-width: 1px" :data-seat-label="seat.seat_number"
      :data-row-label="row_number" :data-section-label="seat.section_label"
      :data-section-abv="seat.section_abv" :data-category-name="seat.category"
      :data-tags="makeTag">
    </circle>

    <text class="seat_label" :fill="textColor ? 'black' : 'black'"
      :x="seat.position.x" :y="seat.position.y" text-anchor="middle"
      font-size="10px" font-family="sans-serif" dy=".35em">
      {{ textContent }}
    </text>


    <g v-if="seat.tag_name && seat.tag_name.includes('Wheelchair')"
      :transform="`matrix(1, 0, 0, 1, ${seat.position.x - 5}, ${seat.position.y - 6})`"
      data-object-type="seat-icon" x="-5" y="-6" data-seat-id="element-1-1"
      data-seat-icon="wheelchair" data-v-e185086c="">
      <g data-v-e185086c="">
        <path
          d="M 3.261719 0.015625 C 2.613281 0.117188 2.195312 0.742188 2.378906 1.347656 C 2.476562 1.675781 2.761719 1.957031 3.097656 2.058594 C 3.386719 2.144531 3.660156 2.125 3.925781 1.996094 C 4.148438 1.890625 4.3125 1.734375 4.421875 1.523438 C 4.503906 1.367188 4.53125 1.265625 4.535156 1.085938 C 4.539062 0.972656 4.539062 0.9375 4.519531 0.851562 C 4.429688 0.429688 4.101562 0.113281 3.660156 0.0234375 C 3.554688 0 3.371094 -0.00390625 3.261719 0.015625 Z M 3.261719 0.015625 "
          data-v-e185086c=""
          :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor }">
        </path>
        <path
          d="M 3.367188 2.3125 C 3.355469 2.3125 3.324219 2.320312 3.292969 2.324219 C 3.105469 2.363281 2.917969 2.460938 2.769531 2.601562 C 2.574219 2.785156 2.46875 3.011719 2.453125 3.277344 C 2.449219 3.359375 2.457031 3.527344 2.519531 4.523438 C 2.527344 4.609375 2.554688 5.121094 2.589844 5.65625 C 2.636719 6.433594 2.652344 6.652344 2.667969 6.71875 C 2.734375 7.035156 2.957031 7.296875 3.273438 7.4375 C 3.347656 7.472656 3.476562 7.511719 3.574219 7.53125 C 3.613281 7.539062 4.1875 7.542969 5.488281 7.542969 L 7.347656 7.546875 L 7.476562 7.761719 C 8.464844 9.402344 8.824219 9.992188 8.851562 10.023438 C 8.941406 10.128906 9.082031 10.210938 9.222656 10.242188 C 9.324219 10.265625 9.480469 10.257812 9.574219 10.226562 C 9.902344 10.117188 10.074219 9.769531 9.960938 9.445312 C 9.941406 9.382812 9.746094 9.058594 8.988281 7.808594 C 8.46875 6.949219 8.03125 6.226562 8.011719 6.195312 C 7.929688 6.082031 7.789062 5.988281 7.640625 5.945312 C 7.585938 5.929688 7.480469 5.929688 6.160156 5.925781 L 4.738281 5.925781 L 4.730469 5.761719 C 4.726562 5.675781 4.722656 5.496094 4.71875 5.363281 L 4.710938 5.128906 L 5.734375 5.128906 C 6.621094 5.128906 6.769531 5.125 6.820312 5.113281 C 7.078125 5.050781 7.246094 4.820312 7.207031 4.578125 C 7.179688 4.402344 7.0625 4.269531 6.878906 4.195312 C 6.828125 4.175781 6.828125 4.175781 5.738281 4.171875 L 4.652344 4.167969 L 4.644531 4.070312 C 4.609375 3.613281 4.574219 3.21875 4.566406 3.164062 C 4.546875 3.027344 4.476562 2.867188 4.390625 2.742188 C 4.292969 2.605469 4.097656 2.453125 3.9375 2.386719 C 3.792969 2.328125 3.714844 2.3125 3.542969 2.308594 C 3.457031 2.308594 3.378906 2.308594 3.367188 2.3125 Z M 3.367188 2.3125 "
          data-v-e185086c=""
          :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor }">
        </path>
        <path
          d="M 1.84375 4.753906 C 1.328125 5.089844 0.90625 5.511719 0.585938 6.015625 C 0.03125 6.886719 -0.136719 7.957031 0.117188 8.96875 C 0.367188 9.945312 0.988281 10.789062 1.871094 11.347656 C 2.878906 11.984375 4.132812 12.164062 5.292969 11.84375 C 6.285156 11.570312 7.152344 10.929688 7.6875 10.074219 C 7.796875 9.90625 7.925781 9.65625 7.917969 9.640625 C 7.90625 9.609375 7.347656 8.691406 7.34375 8.691406 C 7.339844 8.691406 7.332031 8.71875 7.324219 8.75 C 7.304688 8.835938 7.242188 9.039062 7.191406 9.164062 C 6.839844 10.03125 6.109375 10.703125 5.195312 11 C 4.558594 11.210938 3.851562 11.222656 3.191406 11.035156 C 2.492188 10.832031 1.839844 10.371094 1.421875 9.777344 C 1.140625 9.371094 0.96875 8.941406 0.894531 8.4375 C 0.871094 8.269531 0.871094 7.796875 0.894531 7.636719 C 0.929688 7.40625 0.976562 7.21875 1.046875 7.03125 C 1.214844 6.5625 1.476562 6.167969 1.855469 5.8125 L 2.019531 5.65625 L 1.988281 5.1875 C 1.972656 4.929688 1.960938 4.710938 1.960938 4.703125 C 1.960938 4.695312 1.957031 4.6875 1.953125 4.6875 C 1.949219 4.6875 1.898438 4.71875 1.84375 4.753906 Z M 1.84375 4.753906 "
          data-v-e185086c=""
          :style="{ 'stroke': none, 'fill-rule': nonzero, 'fill-opacity': 1, fill: tagColor }">
        </path>
      </g>
    </g>

    <circle v-if="showTag" fill="#fff" :cx="seat.position.x"
      :cy="seat.position.y + 7" :r="3">
    </circle>

  </g>
</template>

<script>
import { contrast, hex2rgb } from "@/lib/colors";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
import { computed } from "vue";

export default {
  name: "SeatComp",
  props: {
    seat: Object,
    row: Object,
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
    makeTag() {
      const res = []
      if (this.seat.tag_name) {
        if (this.seat.tag_name.includes('Wheelchair')) res.push('W')
        if (this.seat.tag_name.includes('Wheelchair Companion')) res.push('C')
        if (this.seat.tag_name.includes('Partial View')) res.push('P')
        if (this.seat.tag_name.includes('Folding Chair')) res.push('F')
        if (this.seat.tag_name.includes('Standing Room Only')) res.push('S')
        return res.join(',')
      }
      return '';
    },
    showTag() {
      const tags = [
        "Wheelchair Companion",
        "Partial View",
        "Folding Chair",
        "Standing Room Only"
      ]
      if (this.seat.tag_name) {
        let res = false;
        tags.forEach(tag => {
          if (this.seat.tag_name.includes(tag))
            res = true;
        })
        return res;
      }
      return false;
    },
    tagColor() {
      return this.seat.category ? '#ffffff' : '#0064d0';
    },
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
      return this.row.skip_letter ? this.seat.skip_number : this.seat.seat_number;
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
      if (this.seat.valid) {
        if (this.category) {
          return this.category.color;
        } else {
          return "#fff";
        }
      }
      return "#ffcf37";
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
.movable .selected * {
  cursor: move;
}
</style>
