<template>
  <v-btn class="btn" @click="setTransform((zoomValue - 10) / 100)">
    <v-icon color="black" icon="mdi-minus" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Zoom out</v-tooltip>
  </v-btn>

  <v-text-field append-inner-icon="mdi-percent-outline" v-model="zoomValue"
    class="custom-input-1" dense @change="onChange" type="number"
    variant="plane" />

  <v-btn class="btn" @click="setTransform((zoomValue + 10) / 100)">
    <v-icon color="black" icon="mdi-plus" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Zoom In</v-tooltip>
  </v-btn>
</template>

<script setup>
import { computed, defineProps, ref, watch } from "vue";
import { useSvgStore } from "../../../../stores/svgStore";
import { useMainStore } from "@/stores";
const store = useMainStore();
const zoomTransform = computed(() => store.zoomTransform);

const zoomValue = ref(computed(() => Math.round(store.zoomTransform.k * 100)));

const onChange = (e) => {
  zoomTransform.value.k = (e.target.value / 100);
};

const setTransform = val => {
  zoomTransform.value.k = val;
}

</script>

<style>
.custom-input-1 {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  font-size: 12px !important;
}

.v-field--appended {
  padding-inline-end: 0px;
  font-size: 14px;
}

.v-text-field input[type="number"]::-webkit-inner-spin-button,
.v-text-field input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For global style, you can remove scoped and use deep selectors if necessary */
</style>
