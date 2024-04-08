<template>
  <div style="padding: 15px 10px; text-align: left">
    <SectionLabelModal :addTags="addTags" />
    <v-container>
      <v-chip-group selected-class="text-primary" multiple column>
        <v-chip v-for="tag in tags" :key="tag">
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SectionLabelModal from "./SectionLabelModal.vue";
const tags = ref(["Seat1", "Seat2", "Test (tes)", "WheelChair", "Round"]);
const addTags = (v) => {
  tags.value.push(v);
};
</script>

<style>
.v-input__details {
  display: none;
}
.v-col-sm-6 {
  padding: 5px;
}
</style>
