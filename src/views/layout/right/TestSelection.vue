<template>
  <v-select v-model="tag" :items="tags" label="Tags" chips multiple
    @input="onChange">
  </v-select>
</template>

<script setup>
import { ref, watch } from 'vue';
import { v4 as uuid } from 'uuid';

const tags = ref([
  "Wheelchair",
  "Wheelchair Companion",
  "Partial View",
  "Folding Chair",
  "Standing Room Only"
]);

const tag = ref([])

watch(tag, async (newValue, oldValue) => {
  console.log('I found it', newValue)
})
</script>