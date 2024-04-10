<template>
  <v-btn @click="toggleGrid">
    <v-tooltip activator="parent" location="bottom">Grid</v-tooltip>
    <v-icon
      v-if="grid == true"
      color="black"
      icon="mdi-grid"
      size="large"
    ></v-icon>
    <v-icon
      v-if="grid == false"
      color="black"
      icon="mdi-grid-off"
      size="large"
    ></v-icon>
  </v-btn>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBoardStore } from "../../../../stores/svgStore";

const boardStore = useBoardStore();
const grid = ref(computed(() => boardStore.gird));
const toggleGrid = () => boardStore.gird_toggle();
</script>
