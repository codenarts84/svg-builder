<template>
  <div>
    <GAPanel v-if="show()" :areas="areas" />
    <v-divider></v-divider>
    <AreaPanel v-if="show()" :areas="areas" :temp_Rotate="temp_Rotate" />
    <v-divider></v-divider>
    <CategoryComponent :setCategory="setCategory"
      :selectedCategory="selectedCategory()" />
    <v-divider></v-divider>
    <SectionLabel :section="section()" :setSection="setSection" />
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
  areas: Array,
  temp_Rotate: Function,
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

const show = () => {
  if (props.areas) {
    const shape = props.areas[0].shape;
    const filtered = props.areas.filter(a => a.shape === shape);
    return filtered.length === props.areas.length;
  }
}

const section = () => {
  const label = groupValue(props.areas, area => area.section_label)
  const abv = groupValue(props.areas, area => area.section_abv)
  if (label && abv) return `${label}(${abv})`;
  return '';
  // const abv = groupValue(props.areas, area => area.abbreviation)
}

const setSection = (label, abv) => {
  // const tag = tags.value.find(i => i.label === label && i.abv === abv);
  // if (tag) {
  planStore.addGASectionLabel(props.areas.map(i => i.uuid), label, abv);
  // }
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
    console.log(tag)
    planStore.addGASectionLabel(props.areas.map(i => i.uuid), tag.label, tag.abv);
  }
}

const tag = computed(() => {
  const label = groupValue(props.areas, a => a.section);
  const abv = groupValue(props.areas, a => a.abbreviation);
  return { label, abv };
})
</script>