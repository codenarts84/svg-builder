<template>
  <v-btn @click="toggleGrid">
    <v-tooltip activator="parent" location="bottom">Grid</v-tooltip>
    <v-icon v-if="grid == true" color="black" icon="mdi-grid"
      size="large"></v-icon>
    <v-icon v-if="grid == false" color="black" icon="mdi-grid-off"
      size="large"></v-icon>
  </v-btn>
  <v-btn @click="btn_snap_2_grid_clicked">
    <v-tooltip activator="parent" location="bottom">Snap to Grid</v-tooltip>
    <SnapToGridIcon width="20" height="20" />
  </v-btn>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBoardStore } from "../../../../stores/svgStore";
import SnapToGridIcon from "../../../../assets/svgs/menuIcons/SnapToGridIcon.vue";
import { useMainStore } from "@/stores";
import { useToolbarStore } from "@/stores/toolbar";

const boardStore = useBoardStore();
// const grid = ref(computed(() => boardStore.grid));
const grid = ref(computed(() => store.grid));

// const toggleGrid = () => boardStore.grid_toggle();
const store = useMainStore();
const toolbarStore = useToolbarStore();
const toggleGrid = () => store.toggleGrid();
const btn_snap_2_grid_clicked = () => toolbarStore.changeSnap2Grid();
</script>
