<template>
  <v-navigation-drawer location="right"
    style="top: 51px; width: 300px; padding-bottom: 50px; bottom: 50px">

    <GAComponent v-if="selection.length && selectedGA().length"
      :areas="selectedGA()" />

    <AreaTool v-if="selection.length && selectedAreas().length"
      :areas="selectedAreas()" />
    <v-divider v-if="selection.length && selectedAreas().length"></v-divider>

    <TableToolsComponent v-if="selection.length && selectedTable().length"
      :areas="selectedTable()" />

    <CategoryComponent
      v-if="selection.length && (selectedRows().length || selectedSeats().length)"
      :seats="selectedSeats()" />
    <v-divider
      v-if="selection.length && (selectedRows().length || selectedSeats().length)"></v-divider>

    <CategoryTable v-if="selection.length && (selectedTable().length)"
      :areas="selectedTable()" />
    <v-divider v-if="selection.length && (selectedTable().length)"></v-divider>

    <RowComponent v-if="selection.length && selectedRows().length"
      :rows="selectedRows()" />
    <v-divider v-if="selection.length && selectedRows().length"></v-divider>

    <ShapeComponent v-if="selection.length && selectedRows().length"
      :rows="selectedRows()" :temp_Rotate="temp_Rotate" />
    <v-divider v-if="selection.length && selectedRows().length"></v-divider>

    <SectionLabel v-if="selection.length && selectedRows().length"
      :rows="selectedRows()" />
    <v-divider v-if="selection.length && selectedRows().length"></v-divider>

    <SectionTableLabel v-if="selection.length && selectedTable().length"
      :areas="selectedTable()" />
    <v-divider v-if="selection.length && selectedRows().length"></v-divider>

    <TagsComponent v-if="selection.length && selectedRows().length"
      :rows="selectedRows()" />
    <v-divider v-if="selection.length"></v-divider>

    <RowLabeling v-if="selection.length && selectedRows().length"
      :rows="selectedRows()" />
    <v-divider v-if="selection.length && selectedRows().length"></v-divider>

    <SeatLabeling v-if="selection.length && selectedSeats().length"
      :rows="selectedRows()" />
    <v-divider v-if="selection.length && selectedSeats().length"></v-divider>

  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue'
import RowComponent from "./RowComponent.vue";
import ShapeComponent from "./ShapeComponent.vue";
import SectionLabel from "./SectionLabel.vue";
import TagsComponent from "./TagsComponent.vue";
import RowLabeling from "./RowLabeling.vue";
import SeatLabeling from "./SeatLabeling.vue";
import CategoryComponent from './CategoryComponent.vue'
import GAComponent from './GAComponent.vue';
import AreaTool from './AreaTool.vue';
import TableToolsComponent from './TableToolsComponent';
import SectionTableLabel from './SectionTableLabel.vue';
import DropDown from '@/views/home/components/DropDown.vue';
import { useMainStore } from "@/stores";
import { usePlanStore } from '@/stores/plan';
import { area } from 'd3';
import CategoryTable from './CategoryTable.vue';

const store = useMainStore();
const planstore = usePlanStore();
const selection = ref(computed(() => store.selection));
const plan = ref(computed(() => planstore.plan));


const props = defineProps({
  temp_Rotate: Function,
});

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
  return r;
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
  return r;
}

const selectedAreas = () => {
  const r = []
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid) && a.shape !== 'roundTable' && a.shape !== 'rectangleTable')
          r.push(a)
      }
    }
  }
  return r
}

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

const selected = () => {
  const res = []
  // console.log('selected******')
  // console.log(selection, selection.value.length);
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const r of z.areas) {
        if (selection.value.includes(r.uuid)) {
          res.push(r);
        }
      }
    }
  }
  // console.log('sdh', res)
  return res;
}

</script>