<template>
  <div class="dropdown">
    <div @click="toggleDropdown" class="dropdown-toggle" id="dropdownMenuButton">
      <template v-if="selected.length">
        <div class="color-space"></div>
        <span class="name">{{ selected }}</span>
      </template>
      <template v-else>
        <div class="color-space"></div>
        <span>Select a Section</span>
      </template>
      <span class="arrow">&#9660;</span>
    </div>
    <div v-show="show" class="dropdown-menu">
      <div v-for="(option, index) in options" :key="index" class="dropdown-item"
        @click="handleItemClick(option)">
        <div class="color-space"></div>
        <span class="name">{{ option.label }}({{ option.abv }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, defineProps, computed } from 'vue';
import { usePlanStore } from '@/stores/plan';
const planStore = usePlanStore();
const category = computed(() => planStore.categories);
const show = ref(false);

const props = defineProps({
  options: Array,
  setSection: Function,
  section: String
})

const toggleDropdown = () => {
  show.value = !show.value;
}

const selected = ref(computed(() => props.section));

const handleItemClick = (option) => {
  selected.value = `${option.label}(${option.abv})`;
  show.value = false;
  props.setSection(option.label);
}

</script>
