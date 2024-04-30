<template>
  <div>
    <CategoryComponent :setCategory="setCategory" />
    <RowSetting :rows="rows" />
    <v-divider></v-divider>
    <RotatePanel :rows="rows" :temp_Rotate="temp_Rotate" />
    <v-divider></v-divider>
    <SectionLabel :rows="rows" :setTag="setTag" />
    <v-divider></v-divider>
    <TagsPanel :rows="rows" />
    <v-divider></v-divider>
    <RowLabeling :rows="rows" />
    <v-divider></v-divider>
    <SeatLabeling :rows="rows" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
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

const tags = computed(() => mainStore.section_label);

const setCategory = (name) => {
  planStore.modifySeats({ seatIds: props.seats.map(s => s.uuid), category: name })
}

const setTag = (id) => {
  const tag = tags.value.find(i => i.id === id);
  if (tag)
    planStore.addSectionLabel(props.rows.map(i => i.uuid), tag.label, tag.abv)
}

</script>