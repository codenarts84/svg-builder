<template>
  <div>
    <DropDown :options="options" :selectedOption="selectedOption" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DropDown from '@/views/home/components/DropDown.vue';
const options = ref([{
  name: 'categoryA', color: '#ff0000'
}, {
  name: 'categoryB', color: '#ffff00'
}, {
  name: 'categoryC', color: '#ff00ff'
}])

const selectedOption = ref({ name: 'categoryV', color: '#ff0000' })

</script>