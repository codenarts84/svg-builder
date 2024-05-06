<template>
  <div>
    <RowSetting :rows="rows" />
    <v-divider></v-divider>
    <RotatePanel :rows="rows" :temp_Rotate="temp_Rotate" />
    <v-divider></v-divider>
    <RowLabeling :rows="rows" />
    <v-divider></v-divider>
    <SeatLabeling :rows="rows" />
    <v-divider></v-divider>
    <CategoryComponent :setCategory="setCategory"
      :selectedCategory="selectedCategory" />
    <v-divider></v-divider>
    <SectionLabel :section="section()" :setSection="setSection" />
    <v-divider></v-divider>
    <TagsPanel v-if="show" :rows="rows" :selectedTag="selectedTag" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps, watch, onMounted } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { useMainStore } from "@/stores";
import CategoryComponent from '@/views/home/components/CategoryComponent.vue';
import RowSetting from './Context/RowSetting.vue';
import RotatePanel from './Context/RotatePanel.vue';
import SectionLabel from './Context/SectionLabel.vue';
import TagsPanel from './Context/TagsPanel.vue';
import RowLabeling from './Context/RowLabeling.vue';
import SeatLabeling from './Context/SeatLabeling.vue';

const planStore = usePlanStore();
const mainStore = useMainStore();
const category = computed(() => planStore.categories);

const props = defineProps({
  rows: Array,
  seats: Array,
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

const show = computed(() => {
  console.log(props.rows.length === 1)
  return props.rows.length === 1;
})

const tags = computed(() => mainStore.section_label);

const tag = () => {
  const section = groupValue(props.seats, seat => seat.section_label)
  const abv = groupValue(props.seats, seat => seat.section_abv)
  return { label: section, abv }
}

const section = () => {
  const section = groupValue(props.seats, seat => seat.section_label)
  const abv = groupValue(props.seats, seat => seat.section_abv)
  return section
}

const setSection = (label) => {
  const tag = tags.value.find(i => i.label === label);
  if (tag)
    planStore.addSectionLabel(props.rows.map(i => i.uuid), tag.label, tag.abv)
}

const selectedCategory = computed(() => {
  return groupValue(props.seats, seat => seat.category);
})

const selectedTag = computed(() => {
  const tg = groupValue(props.seats, seat => seat.tag_name);
  console.log(tg)
  return tg;
})

const setCategory = (name) => {
  planStore.modifySeats({ seatIds: props.seats.map(s => s.uuid), category: name })
}

const setTag = (id) => {
  const tag = tags.value.find(i => i.id === id);
  if (tag)
    planStore.addSectionLabel(props.rows.map(i => i.uuid), tag.label, tag.abv)
}

</script>