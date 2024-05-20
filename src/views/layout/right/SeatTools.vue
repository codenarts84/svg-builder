<template>
  <div>
    <SeatLabel v-if="show" :seats="seats" />
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import SeatLabel from './Context/SeatLabel.vue';

const props = defineProps({
  rows: Array,
  seats: Array,
})

const show = computed(() => props.seats.length === 1)

</script>