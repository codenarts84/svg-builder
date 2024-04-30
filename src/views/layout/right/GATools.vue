<template>
  <div>
    <CategoryComponent :setCategory="setCategory" />
    <GAPanel :areas="areas" />
    <AreaPanel :areas="areas" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import { usePlanStore } from '@/stores/plan';
import GAPanel from './Context/GAPanel.vue';
import AreaPanel from './Context/AreaPanel.vue';
import CategoryComponent from '@/views/home/components/CategoryComponent.vue';

const planStore = usePlanStore();
const category = computed(() => planStore.categories);

const props = defineProps({
  areas: Array
})

const setCategory = (name) => {
  planStore.setGACategory(props.areas, name);
}

</script>