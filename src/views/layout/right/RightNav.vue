<template>
  <v-navigation-drawer location="right"
    style="top: 51px; width: 300px; padding-bottom: 50px; bottom: 50px">

    <ValidationPanel v-if="bvalid" />

    <template v-if="!selection.length">
      <ChartGeneralOption />
      <ChartCategoryOption />
      <ChartSectionOption />
      <ChartUploadBackgroundOption />
    </template>

    <RowTools v-if="isSelectedRowsOnly" :rows="selectedRows()"
      :seats="selectedSeats()" :temp_Rotate="temp_Rotate" />

    <GATools v-if="isSelectedGAOnly" :areas="selectedGA()"
      :temp_Rotate="temp_Rotate" />

    <TableTools v-if="isSelectedTablesOnly" :areas="selectedTables()"
      :seats="selectedTableSeats()" />

    <TableSeatTools v-if="isSelectedTableSeatsOnly"
      :seats="selectedTableSeats()" />

    <AreaTools v-if="isSelectedShapesOnly" :areas="selectedAreas()"
      :temp_Rotate="temp_Rotate" />

    <template v-if="selection.length">
      <CategoryComponent :set-category="setCategory"
        :selected-category="selectedCategory" />
      <v-divider></v-divider>
      <SectionLabel :section="section" :set-section="setSection" />
      <v-divider></v-divider>
      <TagsPanel :set-tag="setTag" :selected-tag="selectedTag" />
    </template>

  </v-navigation-drawer>
</template>

<script setup>
import {
  computed,
  ref,
  defineProps,
  inject,
  provide
} from "vue"
import { groupValue } from "@/lib/utils";

import {
  useMainStore
} from "@/stores";
import {
  usePlanStore
} from "@/stores/plan";

import RowTools from "./RowTools.vue";
import SeatTools from "./SeatTools.vue";
import GATools from "./GATools.vue";
import TableTools from "./TableTools.vue";
import AreaTools from "./AreaTools.vue";
import TableSeatTools from "./TableSeatTools.vue";
import ValidationPanel from "./Context/ValidationPanel.vue";

import ChartCategoryOption from "./Context/ChartCategoryOption.vue";
import ChartGeneralOption from "./Context/ChartGeneralOption.vue";
import ChartSectionOption from "./Context/ChartSectionOption.vue";
import ChartUploadBackgroundOption from "./Context/ChartUploadBackgroundOption.vue";

import TestSelection from "./TestSelection.vue";
import CategoryComponent from "@/views/home/components/CategoryComponent.vue";
import SectionLabel from "./Context/SectionLabel.vue";
import TagsPanel from "./Context/TagsPanel.vue";
import { lab } from "d3";


const store = useMainStore();
const planstore = usePlanStore();
const selection = ref(computed(() => store.selection));
const plan = ref(computed(() => planstore.plan));
const bvalid = computed(() => useMainStore().bvalid);
const planRef = inject("planRef");
provide("planRef", planRef)

const props = defineProps({
  temp_Rotate: Function,
});

const isSelectedRowsOnly = computed(() => {
  if (selectedRows().length && selection.value.length)
    return selectedRows().length === selection.value.length;
  return false;
})

const isSelectedSeatsOnly = computed(() => {
  if (selectedSeats().length && selection.value.length)
    return selectedSeats().length === selection.value.length;
  return false;
})

const isSelectedTablesOnly = computed(() => {
  if (selectedTables().length && selection.value.length)
    return selectedTables().length === selection.value.length;
  return false;
})

const isSelectedTableSeatsOnly = computed(() => {
  if (selectedTableSeats().length && selection.value.length)
    return selectedTableSeats().length === selection.value.length;
  return false;
})

const isSelectedGAOnly = computed(() => {
  if (selectedGA().length && selection.value.length)
    return selectedGA().length === selection.value.length;
  return false;
})

const isSelectedShapesOnly = computed(() => {
  if (selectedAreas().length && selection.value.length)
    return selectedAreas().length === selection.value.length;
  return false;
})

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
  return res;
}

const selectedTableSeats = () => {
  const r = [];
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const a of z.areas) {
        if (a.shape === "roundTable" || a.shape === "rectangleTable") {
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

const selectedTables = () => {
  const r = [];
  if (selection.value.length) {
    for (const z of plan.value.zones) {
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid) && (a.shape === "roundTable" || a.shape === "rectangleTable"))
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
        if (selection.value.includes(a.uuid) && (a.shape === "gaCircle" || a.shape === "gaSquare" || a.shape === "gaPolygon"))
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
        if (selection.value.includes(a.uuid) && (a.shape === "text" || a.shape === "rectangle" || a.shape === "ellipse" || a.shape === "circle" || a.shape === "polygon"))
          r.push(a)
      }
    }
  }
  return r;
}

const setCategory = (name) => {
  if (selectedSeats().length)
    planstore.modifySeats({ seatIds: selectedSeats().map(s => s.uuid), category: name })
  if (selectedGA().length)
    planstore.modifyAreas({ areaIds: selectedGA().map(a => a.uuid), category: name })
  if (selectedTables().length)
    planstore.setTableCategory(selectedTables(), name);
  if (selectedTableSeats().length)
    planstore.setTableSeatCategory(selectedTableSeats(), name);
}

const selectedCategory = computed(() => {
  const cats = [
    ...selectedSeats().map(seat => seat.category),
    ...selectedTableSeats().map(seat => seat.category),
    ...selectedGA().map(area => area.category)
  ]
  return groupValue(cats, c => c);
})

const section = computed(() => {
  const section_labels = [
    ...selectedSeats().map(seat => seat.section_label),
    ...selectedTableSeats().map(seat => seat.section_label),
    ...selectedGA().map(area => area.section_label),
  ]

  const section_abvs = [
    ...selectedSeats().map(seat => seat.section_abv),
    ...selectedTableSeats().map(seat => seat.section_abv),
    ...selectedGA().map(area => area.section_abv),
  ]

  const label = groupValue(section_labels, label => label);
  const abv = groupValue(section_abvs, abv => abv);

  if (label && abv) return `${label}(${abv})`;
  return '';
})

const setSection = (label, abv) => {
  if (selectedRows().length)
    planstore.addSectionLabel(selectedRows().map(i => i.uuid), label, abv);
  if (selectedSeats().length)
    planstore.addSectionLabel(selectedSeats().map(i => i.uuid), label, abv);
  if (selectedGA().length)
    planstore.addGASectionLabel(selectedGA().map(i => i.uuid), label, abv);
  if (selectedTables().length)
    planstore.addTableSectionLabel(selectedTables().map(i => i.uuid), label, abv);
  if (selectedTableSeats().length)
    planstore.addTableSectionLabel(selectedTableSeats().map(i => i.uuid), label, abv);
}

const selectedTag = computed(() => {
  const tgs = [
    ...selectedSeats().map(seat => seat.tag_name),
    ...selectedGA().map(area => area.tag_name),
    ...selectedTableSeats().map(seat => seat.tag_name),
  ]
  return groupValue(tgs, tg => tg);
})

const setTag = (tag) => {
  if (selectedSeats().length)
    planstore.setTag(selectedSeats().map(seat => seat.uuid), tag);
  if (selectedGA().length)
    planstore.setTag(selectedGA().map(area => area.uuid), tag);
  if (selectedTableSeats().length)
    planstore.setTag(selectedTableSeats().map(seat => seat.uuid), tag);
}

</script>