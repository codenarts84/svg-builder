<template>
  <div style="padding: 15px 10px; text-align: left">
    <CategoryManage />
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="12">
          <DropDown :options="category" :setCategory="setCategory"
            :selectedOption="selectedCategory" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style>
.v-col-sm-6 {
  padding: 5px;
}
</style>

<script setup>
import { defineProps, computed, ref, withDirectives } from 'vue';
import { usePlanStore } from '@/stores/plan';
import CategoryManage from './CategoryManage.vue';
import DropDown from './DropDown.vue';

const planStore = usePlanStore();
const category = computed(() => planStore.categories);

const props = defineProps({
  setCategory: Function,
  selectedCategory: String
})

</script>
