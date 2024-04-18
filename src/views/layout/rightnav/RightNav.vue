<template>
  <v-navigation-drawer location="right"
    style="top: 51px; width: 300px; padding-bottom: 50px; bottom: 50px">
    <v-divider></v-divider>
    <RowComponent />
    <v-divider></v-divider>
    <ShapeComponent />
    <v-divider></v-divider>
    <SectionLabel />
    <v-divider></v-divider>
    <TagsComponent />
    <v-divider></v-divider>
    <RowLabeling :rows="selectedRows()" />
    <v-divider></v-divider>
    <SeatLabeling />
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'
import RowComponent from "./RowComponent.vue";
import ShapeComponent from "./ShapeComponent.vue";
import SectionLabel from "./SectionLabel.vue";
import TagsComponent from "./TagsComponent.vue";
import RowLabeling from "./RowLabeling.vue";
import SeatLabeling from "./SeatLabeling.vue";
import TestComponent from './TestComponent.vue'
import { useMainStore } from "@/stores";
import { usePlanStore } from '@/stores/plan';

const store = useMainStore();
const planstore = usePlanStore();
const selection = ref(computed(() => store.selection));
const plan = ref(computed(() => planstore.plan));

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

</script>
