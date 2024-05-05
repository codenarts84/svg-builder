<template>
  <v-btn @click="onClick">Generate</v-btn>
</template>

<script setup>
import { ref } from 'vue';
import { v4 as uuid } from 'uuid';

const onClick = () => {
  console.log(Date.now().toString(10))
}

</script>