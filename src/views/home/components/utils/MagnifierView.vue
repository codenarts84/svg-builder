<template>
  <v-btn class="btn" @click="increaseZoom">
    <v-icon color="black" icon="mdi-minus" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Zoom out</v-tooltip>
  </v-btn>

  <v-text-field
    append-inner-icon="mdi-percent-outline"
    v-model="zoomValue"
    class="custom-input-1"
    dense
    @change="onChange"
    type="number"
    variant="plane"
  />

  <v-btn class="btn" @click="decreaseZoom">
    <v-icon color="black" icon="mdi-plus" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Zoom In</v-tooltip>
  </v-btn>
</template>

<script setup>
import { computed } from "vue";
import { useSvgStore } from "../../../../stores/svgStore";

const svgStore = useSvgStore();

// Create a computed property with a getter and a setter
const zoomValue = computed({
  // Getter returns a string representation of the zoom level
  get: () => `${Math.round(svgStore.magnifier_init * 100)}`,
  // Setter parses the input value to a float and updates the store
  set: (value) => {
    const numericValue = parseFloat(value) / 100; // Convert back to a fraction
    svgStore.set_zoom(numericValue);
  },
});

const increaseZoom = () => svgStore.zoom_in();
const decreaseZoom = () => svgStore.zoom_up();
</script>

<style lang="scss">
.custom-input-1 {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  font-size: 12px !important;
}
</style>

<style>
.v-field--appended {
  padding-inline-end: 0px;
  font-size: 14px;
}
</style>

<style>
/* Target the input inside v-text-field */
.v-text-field input[type="number"]::-webkit-inner-spin-button,
.v-text-field input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For global style, you can remove scoped and use deep selectors if necessary */
</style>
