<template>
  <div>
    <CategoryComponent :setCategory="setCategory"
      :selectedCategory="selectedCategory()" />
    <SectionLabel :setTag="setTag" />
    <GAPanel :areas="areas" />
    <AreaPanel :areas="areas" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { useMainStore } from '@/stores';
import GAPanel from './Context/GAPanel.vue';
import AreaPanel from './Context/AreaPanel.vue';
import SectionLabel from './Context/SectionLabel.vue';
import CategoryComponent from '@/views/home/components/CategoryComponent.vue';

const planStore = usePlanStore();
const mainStore = useMainStore();
const category = planStore.categories;

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
  planStore.setGACategory(props.areas, name);
}

const selectedCategory = () => {
  return groupValue(props.areas, area => area.category);
}

const tags = computed(() => mainStore.section_label);

const setTag = (id) => {
  const tag = tags.value.find(i => i.id === id);
  if (tag) {
    planStore.addGASectionLabel(props.areas.map(i => i.uuid), tag.label, tag.abv);
  }
}
</script>