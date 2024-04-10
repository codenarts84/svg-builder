<template>
  <v-btn class="btn" @click="increaseZoom">
    <v-tooltip activator="parent" location="bottom">Zoom Out</v-tooltip>
    <v-icon color="black" icon="mdi-minus" size="large"></v-icon>
  </v-btn>
  <v-btn @click="initzoom">{{ zoomPercent }}%</v-btn>
  <v-btn class="btn" @click="decreaseZoom">
    <v-tooltip activator="parent" location="bottom">Zoom In</v-tooltip>
    <v-icon color="black" icon="mdi-plus" size="large"></v-icon>
  </v-btn>
</template>

<script setup>
import { computed } from "vue";
import { useSvgStore } from "../../../../stores/svgStore";

const svgStore = useSvgStore();

const zoomPercent = computed(() => {
  return Math.round(svgStore.magnifier_init * 100);
});

function increaseZoom() {
  if (svgStore.magnifier_init > 0.1) {
    svgStore.zoom_in(); // Increase zoom by 10%
  }
}

function decreaseZoom() {
  svgStore.zoom_up(); // Decrease zoom by 10%
}

const initzoom = () => svgStore.init_zoom();
</script>
