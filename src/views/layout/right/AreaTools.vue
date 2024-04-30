<template>
  <div>
    <AreaPanel :areas="areas" />
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import AreaPanel from './Context/AreaPanel.vue';

const props = defineProps({
  areas: Array
})

</script>