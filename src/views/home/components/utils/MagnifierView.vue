<template>
  <v-btn class="zoom-btn" @click="setTransform((zoomValue - 10) / 100)">
    <v-icon color="black" icon="mdi-minus" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Zoom out</v-tooltip>
  </v-btn>

  <v-text-field append-inner-icon="mdi-percent-outline" v-model="zoomValue"
    class="custom-input-1" @change="onChange" type="number" variant="plane" />

  <v-btn class="zoom-btn" @click="setTransform((zoomValue + 10) / 100)">
    <v-icon color="black" icon="mdi-plus" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Zoom In</v-tooltip>
  </v-btn>

  <v-btn @click="fitScreen">
    <v-icon color="black" icon="mdi-fullscreen" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Fit Screen</v-tooltip>
  </v-btn>
</template>

<script setup>
import { computed, defineProps, ref, watch } from "vue";
import { useSvgStore } from "../../../../stores/svgStore";
import * as d3 from "d3";
import { useMainStore } from "@/stores";
const store = useMainStore();
const zoomTransform = computed(() => store.zoomTransform);

const zoomValue = ref(computed(() => Math.round(store.zoomTransform.k * 100)));

const onChange = (e) => {
  if (e.target.value > 999) return;
  zoomTransform.value.k = (e.target.value / 100);
};

const setTransform = val => {
  if (val < 0.05) return;
  zoomTransform.value.k = val;
}

const fitScreen = () => {
  alert('not yet')
}

</script>

<style>
.custom-input-1 {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 85px;
  font-size: 12px !important;
}

.v-field--appended {
  font-size: 14px;
}

.zoom-btn {
  width: 50px;
  min-width: 50px;
}

.v-text-field input[type="number"]::-webkit-inner-spin-button,
.v-text-field input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For global style, you can remove scoped and use deep selectors if necessary */
</style>
