<template>
  <v-btn class="btn" @click="increaseZoom">
    <v-icon color="black" icon="mdi-magnify-minus" size="large"></v-icon>
  </v-btn>
  <v-btn>{{ zoomPercent }}%</v-btn>
  <v-btn class="btn" @click="decreaseZoom">
    <v-icon color="black" icon="mdi-magnify-plus" size="large"></v-icon>
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
  // Prevent zooming out too much
  svgStore.zoom_up(); // Decrease zoom by 10%
}
</script>
