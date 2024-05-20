<template>
  <div>
    <GAPanel v-if="show()" :areas="areas" />
    <v-divider></v-divider>
    <AreaPanel v-if="show()" :areas="areas" :temp_Rotate="temp_Rotate" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from "vue";
import GAPanel from "./Context/GAPanel.vue";
import AreaPanel from "./Context/AreaPanel.vue";

const props = defineProps({
  areas: Array,
  temp_Rotate: Function,
})

const show = () => {
  if (props.areas) {
    const shape = props.areas[0].shape;
    const filtered = props.areas.filter(a => a.shape === shape);
    return filtered.length === props.areas.length;
  }
}
</script>