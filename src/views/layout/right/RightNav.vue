<template>
  <v-navigation-drawer location="right"
    style="top: 51px; width: 300px; padding-bottom: 50px; bottom: 50px">

    <RowTools v-if="selectedRows().length" :rows="selectedRows()"
      :seats="selectedSeats()" :temp_Rotate="temp_Rotate" />

    <SeatTools v-if="selectedSeats().length && !selectedRows().length"
      :seats="selectedSeats()" />

    <GATools v-if="selectedGA().length" :areas="selectedGA()"
      :temp_Rotate="temp_Rotate" />

    <TableTools v-if="selectedTable().length" :areas="selectedTable()"
      :seats="selectedTableSeat()" />

    <TableSeatTools v-if="selectedTableSeat().length && !selectedTable().length"
      :seats="selectedTableSeat()" />

    <AreaTools v-if="selectedAreas().length" :areas="selectedAreas()"
      :temp_Rotate="temp_Rotate" />

  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue'
import RowTools from './RowTools.vue';
import SeatTools from './SeatTools.vue';
import GATools from "./GATools.vue";
import TableTools from './TableTools.vue';
import AreaTools from './AreaTools.vue';
import TableSeatTools from './TableSeatTools.vue';
import TestSelection from './TestSelection.vue';

import { useMainStore } from '@/stores';
import { usePlanStore } from '@/stores/plan';
import ColorPicker from '@/views/home/components/ColorPicker.vue';
const store = useMainStore();
const planstore = usePlanStore();
const selection = ref(computed(() => store.selection));
const plan = ref(computed(() => planstore.plan));

const props = defineProps({
  temp_Rotate: Function,
});

const selectedRows = () => {
  const res = []
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const r of z.rows) {
        if (selection.value.includes(r.uuid)) {
          res.push(r);
        }
      }
    }
  }
  return res;
}

const selectedSeats = () => {
  const res = []
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const r of z.rows) {
        for (const s of r.seats) {
          if (selection.value.includes(r.uuid) || selection.value.includes(s.uuid)) {
            res.push(s)
          }
        }
      }
    }
  }
  return res
}

const selectedTableSeat = () => {
  const r = [];
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const a of z.areas) {
        if (a.shape === 'roundTable' || a.shape === 'rectangleTable') {
          for (const s of a.seats) {
            if (selection.value.includes(a.uuid) || selection.value.includes(s.uuid))
              r.push(s)
          }
        }
      }
    }
  }
  return r;
}

const selectedTable = () => {
  const r = [];
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid) && (a.shape === 'roundTable' || a.shape === 'rectangleTable'))
          r.push(a)
      }
    }
  }
  if (r.length === selection.value.length)
    return r;
  return [];
}

const selectedGA = () => {
  const r = [];
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid) && (a.shape === 'gaCircle' || a.shape === 'gaSquare' || a.shape === 'gaPolygon'))
          r.push(a)
      }
    }
  }
  if (r.length === selection.value.length)
    return r;
  return [];
}

const selectedAreas = () => {
  const r = []
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid) && (a.shape === 'text' || a.shape === 'rectangle' || a.shape === 'ellipse' || a.shape === 'circle' || a.shape === 'polygon'))
          r.push(a)
      }
    }
  }
  if (r.length === selection.value.length)
    return r;
  return [];
}

</script>