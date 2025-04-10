<template>
  <div>
    <TablePanel v-if="show" :areas="areas" />
    <v-divider></v-divider>
    <TableLabeling v-if="show" :areas="areas" />
    <v-divider></v-divider>
    <TableSeatLabeling v-if="show" :areas="areas" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import TablePanel from './Context/TablePanel.vue';
import TableLabeling from './Context/TableLabeling.vue';
import TableSeatLabeling from './Context/TableSeatLabeling.vue';

const props = defineProps({
  areas: Array,
  seats: Array
})

const show = computed(() => {
  if (props.areas) {
    const shape = props.areas[0].shape;
    const filtered = props.areas.filter(a => a.shape === shape);
    return filtered.length === props.areas.length;
  }
  return false;
})
</script>