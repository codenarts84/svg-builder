<template>
  <div style="padding: 15px 10px; text-align: left">
    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <h4>Tags</h4>
    </div>
    <v-container>
      <v-chip-group selected-class="text-primary" multiple column>
        <v-chip v-for="tag in tags" :key="tag" style="width: 100%">
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </v-container>
    <p style="font-size: 13px; text-align: center">
      Ctrl + Left click = pick multiple. To remove all tags click each selected
      with Ctrl.
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
const tags = ref([
  "Wheelchair",
  "Wheelchair Companion",
  "Partial View",
  "Folding Chair",
]);
</script>

<style>
.v-input__details {
  display: none;
}
.v-col-sm-6 {
  padding: 5px;
}
</style>
