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
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
import * as d3 from "d3";
const store = useMainStore();
const planStore = usePlanStore();
const plan = computed(() => planStore.plan)
const zoomTransform = computed(() => store.zoomTransform);

const zoomValue = ref(computed(() => Math.round(store.zoomTransform.k * 100)));

const onChange = (e) => {
  if (e.target.value > 999) return;
  zoomTransform.value.k = (e.target.value / 100);
};

const setTransform = val => {
  if (val < 0.05) val = 0.05;
  zoomTransform.value.k = val;
}

const fitScreen = () => {
  const svg = document.getElementById('svg');
  const viewportHeight = svg.clientHeight;
  const viewportWidth = svg.clientWidth;
  const panPadding = viewportHeight * -10;
  const defaultScale = plan.value.size.height
    ? Math.min(
      (viewportWidth - 130) / plan.value.size.width,
      (viewportHeight - 130) / plan.value.size.height
    ) : 1;
  const initTransform = d3.zoomIdentity
    .scale(defaultScale)
    .translate(
      (viewportWidth / defaultScale - plan.value.size.width) / 2,
      (viewportHeight / defaultScale - plan.value.size.height) / 2
    );
  zoomTransform.value.x = initTransform.x;
  zoomTransform.value.y = initTransform.y;
  zoomTransform.value.k = initTransform.k;
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
  width: 30px;
  min-width: 30px;
}

.v-text-field input[type="number"]::-webkit-inner-spin-button,
.v-text-field input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For global style, you can remove scoped and use deep selectors if necessary */
</style>
