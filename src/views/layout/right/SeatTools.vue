<template>
  <div>
    <SeatLabel v-if="show" :seats="seats" />
    <CategoryComponent :setCategory="setCategory"
      :selectedCategory="selectedCategory" />
    <TagsPanel :rows="seats" :selectedTag="selectedTag()" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps, watch, onMounted } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { useMainStore } from "@/stores";
import CategoryComponent from '@/views/home/components/CategoryComponent.vue';
import TagsPanel from './Context/TagsPanel.vue';
import SeatLabel from './Context/SeatLabel.vue';

const planStore = usePlanStore();
const mainStore = useMainStore();
const category = computed(() => planStore.categories);

const props = defineProps({
  rows: Array,
  seats: Array,
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

const show = computed(() => props.seats.length === 1)

const tags = computed(() => mainStore.section_label);


const selectedCategory = computed(() => {
  return groupValue(props.seats, seat => seat.category);
})

const selectedTag = () => {
  const tg = groupValue(props.seats, seat => seat.tag_name);
  return tg;
}

const setCategory = (name) => {
  planStore.modifySeats({ seatIds: props.seats.map(s => s.uuid), category: name })
}

const setTag = (id) => {
  const tag = tags.value.find(i => i.id === id);
  if (tag)
    planStore.addSectionLabel(props.rows.map(i => i.uuid), tag.label, tag.abv)
}

</script>