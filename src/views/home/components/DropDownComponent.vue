<template>
  <div class="dropdown">
    <div @click="toggleDropdown" class="dropdown-toggle" id="dropdownMenuButton">
      <template v-if="selectedOption">
        <div class="color" :style="{ 'background-color': selectedOption?.color }">
        </div>
        <span class="name">{{ selectedOption?.name }}</span>
      </template>
      <template v-else>
        <div class="color-space"></div>
        <span>Select a Category</span>
      </template>
      <span class="arrow">&#9660;</span>
    </div>
    <div v-show="show" class="dropdown-menu">
      <div v-for="(option, index) in options" :key="index" class="dropdown-item"
        @click="handleItemClick(option)">
        <div class="color" :style="{ 'background-color': option?.color }"></div>
        <span class="name">{{ option?.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, defineProps } from 'vue';

const show = ref(false);
const selectedOption = ref(null);

const props = defineProps({
  options: Array,
  setCategory: Function
})

const toggleDropdown = () => {
  show.value = !show.value;
}

const handleItemClick = (option) => {
  selectedOption.value = option;
  show.value = false;
  props.setCategory(option.name);
}

</script>

<style>
.dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-toggle {
  padding: 10px 20px;
  border: 1px solid #ccc;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  min-width: 200px;
  cursor: pointer;
}

.dropdown-menu {
  display: block;
  position: absolute;
  background-color: #fff;
  border: 1px solid #ccc;
  min-width: 200px;
  width: 100%;
  z-index: 10000;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.dropdown-item {
  padding: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.arrow {
  margin-left: 5px;
}

.color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin: 0 10px;
}

.color-space {
  width: 20px;
  height: 20px;
}
</style>