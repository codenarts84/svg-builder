<template>
  <g class="zone" :transform="transform" :opacity="opacity" :pointer-events="lockedZones.includes(zone.uuid) ? 'none' : 'visiblePainted'
    ">
    <ZoneArea v-for="a in zone.areas" :key="a.uuid" :area="a" :zone="zone"
      :selectionBoundary="selectionBoundary" :ox="ox" :oy="oy"
      @startDragging="startDragging"
      :startDraggingPolygonPoint="startDraggingPolygonPoint"></ZoneArea>
    <Row v-for="r in zone.rows" :key="r.uuid" :row="r" :zone="zone" :ox="ox"
      :selectionBoundary="selectionBoundary" :oy="oy"
      @startDragging="startDragging"></Row>
  </g>
</template>

<script setup>
import { useMainStore } from "@/stores";
import { computed, emit, defineProps } from "vue";
import Row from "./Row.vue";
import ZoneArea from "./ZoneArea.vue";

// Receive props via defineProps
const props = defineProps({
  zone: Object,
  startDragging: Function,
  startDraggingPolygonPoint: Function,
  ox: Number,
  oy: Number,
  selectionBoundary: Object
});

const store = useMainStore();

// console.log("Zone", props.zone);


// Computed properties
const lockedZones = computed(() => store.lockedZones);
const transform = computed(
  () => `translate(${props.zone.position.x}, ${props.zone.position.y})`
);
const opacity = computed(() =>
  props.zone.uuid === store.selectedZone ? 1 : 0.7
);

const startDragging = (uuid, zone, event) => {
  props.startDragging(uuid, zone, event);
};
const startDraggingPolygonPoint = (uuid, zone, event, pid) => {
  props.startDraggingPolygonPoint(uuid, pid, zone, event);
};
</script>
