<template>
  <div>
    <CategoryComponent :setCategory="setCategory" />
    <TablePanel :areas="areas" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import { usePlanStore } from '@/stores/plan';
import TablePanel from './Context/TablePanel.vue';
import CategoryComponent from '@/views/home/components/CategoryComponent.vue';

const planStore = usePlanStore();
const props = defineProps({
  areas: Array
})

const setCategory = (name) => {
  planStore.setTableCategory(props.areas, name);
}
</script>