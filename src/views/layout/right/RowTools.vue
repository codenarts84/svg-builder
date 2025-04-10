<template>
  <div>
    <RowSetting :rows="rows" />
    <v-divider></v-divider>
    <RotatePanel :rows="rows" :temp_Rotate="temp_Rotate" />
    <v-divider></v-divider>
    <RowLabeling :rows="rows" />
    <v-divider></v-divider>
    <SeatLabeling :rows="rows" />
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import RowSetting from "./Context/RowSetting.vue";
import RotatePanel from "./Context/RotatePanel.vue";
import RowLabeling from "./Context/RowLabeling.vue";
import SeatLabeling from "./Context/SeatLabeling.vue";

const props = defineProps({
  rows: Array,
  seats: Array,
  temp_Rotate: Function,
})
</script>