<template>
  <div>
    <AreaPanel :areas="areas" :temp_Rotate="temp_Rotate" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import AreaPanel from './Context/AreaPanel.vue';

const props = defineProps({
  areas: Array,
  temp_Rotate: Function
})

</script>