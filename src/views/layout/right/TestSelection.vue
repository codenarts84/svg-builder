<template>
  <div>
    <v-btn @click="onClick">
      Check
    </v-btn>
  </div>
</template>

<script setup>
import { letterCounter, reverse, ROW_NUMBERINGS } from '@/lib/numbering';
const onClick = () => {
  const rows = Array(30).fill(0);
}
</script>