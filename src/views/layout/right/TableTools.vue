<template>
  <div>
    <CategoryComponent :setCategory="setCategory"
      :selectedCategory="selectedCategory" />
    <v-divider></v-divider>
    <SectionLabel :setTag="setTag" :select="tag" />
    <v-divider></v-divider>
    <TablePanel :areas="areas" />
    <v-divider></v-divider>
    <TableLabeling :areas="areas" />
    <v-divider></v-divider>
    <TableSeatLabeling :areas="areas" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import { usePlanStore } from '@/stores/plan';
import TablePanel from './Context/TablePanel.vue';
import CategoryComponent from '@/views/home/components/CategoryComponent.vue';
import SectionLabel from './Context/SectionLabel.vue';
import { useMainStore } from '@/stores';
import TableLabeling from './Context/TableLabeling.vue';
import TableSeatLabeling from './Context/TableSeatLabeling.vue';

const planStore = usePlanStore();
const mainStore = useMainStore();
const props = defineProps({
  areas: Array
})

const groupValue = (rows, mapper) => {
  let lastFound = undefined
  for (let row of rows) {
    let val = mapper(row)
    if (lastFound === undefined) {
      lastFound = val
    } else if (!shallowEqual(lastFound, val)) {
      return undefined
    }
  }
  return lastFound
}

const shallowEqual = (object1, object2) => {
  if (object1 === null || object2 === null || typeof object1 !== "object" || typeof object2 !== "object") {
    return object1 === object2
  }
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false
    }
  }
  return true
}

const setCategory = (name) => {
  planStore.setTableCategory(props.areas, name);
}

const tags = computed(() => mainStore.section_label);

const setTag = (id) => {
  const tag = tags.value.find(i => i.id === id);
  if (tag) {
    planStore.addTableSectionLabel(props.areas.map(i => i.uuid), tag.label, tag.abv);
  }
}

const tag = computed(() => {
  const label = groupValue(props.areas, a => a.seats.map(s => s.section_label))[0];
  const abv = groupValue(props.areas, a => a.seats.map(s => s.section_abv))[0];
  return { label, abv };
})

const selectedCategory = computed(() => {
  return groupValue(props.areas, area => area.seats.map(s => s.category)[0]);
})

</script>