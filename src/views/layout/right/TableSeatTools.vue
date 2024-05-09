<template>
  <div>
    <div style="padding: 15px 10px; text-align: left" v-if="seats.length === 1">
      <h4>Seat Label</h4>
      <v-container>
        <v-row
          style="display: flex; justify-content: center; align-items: center">
          <v-col cols="12" sm="6"> Seat Label </v-col>
          <v-col cols="12" sm="6">
            <input class="v-custom-input" name="seat_label" :value="seat"
              @input="setSeat" />
          </v-col>
        </v-row>
      </v-container>
    </div>
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

const planStore = usePlanStore();
const mainStore = useMainStore();

const props = defineProps({
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

const tags = computed(() => mainStore.section_label);

const seat = computed(() => {
  return groupValue(props.seats, seat => seat.seat_number);
})

const setSeat = (e) => {
  if (e.target.value) {
    console.log(e.target.value)
    planStore.modifyTableSeatLabel(props.seats[0].uuid, e.target.value)
  }
}

const selectedCategory = computed(() => {
  return groupValue(props.seats, seat => seat.category);
})

const selectedTag = () => {
  const tg = groupValue(props.seats, seat => seat.tag_name);
  return tg;
}

const setCategory = (name) => {
  console.log(props.seats)
  planStore.setTableSeatCategory(props.seats, name);
}

const setTag = (id) => {
  const tag = tags.value.find(i => i.id === id);
  if (tag)
    planStore.addSectionLabel(props.rows.map(i => i.uuid), tag.label, tag.abv)
}

</script>