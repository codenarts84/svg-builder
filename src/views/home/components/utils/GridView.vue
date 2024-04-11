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
  <v-btn>
    <v-tooltip activator="parent" location="bottom">Snap to Grid</v-tooltip>
    <SnapToGridIcon width="20" height="20" />
  </v-btn>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBoardStore } from "../../../../stores/svgStore";
import SnapToGridIcon from "../../../../assets/svgs/menuIcons/SnapToGridIcon.vue";

const boardStore = useBoardStore();
const grid = ref(computed(() => boardStore.grid));
const toggleGrid = () => boardStore.grid_toggle();
</script>
