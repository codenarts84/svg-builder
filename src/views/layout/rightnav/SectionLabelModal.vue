<template>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <button type="button" class="add-button" id="addRow" @click="dialog = true">+
      Create new</button>
  </div>

  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <v-card prepend-icon="mdi-label" title="Add Section Label">
        <v-card-text>
          <v-text-field type="text" label="Section label"
            v-model="newLabel"></v-text-field>
        </v-card-text>
        <v-card-text>
          <v-text-field type="text" label="Section Abbreviation"
            v-model="newAbr"></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn text="Close" @click="dialog = false"></v-btn>
          <v-spacer></v-spacer>
          <v-btn text="Add" @click="onAdd" color="primary"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from "vue";
import { v4 as uuid } from "uuid";
import { useMainStore } from "@/stores";
const store = useMainStore();
const sections = computed(() => store.section_label)
const dialog = ref(false);
const newLabel = ref("");
const newAbr = ref("");
const props = defineProps({
  addTags: Function,
});

const onAdd = () => {
  if (newLabel.value && newAbr.value) {
    const abvPattern = /^[a-zA-Z0-9-]+$/
    if (newAbr.value.length > 6 || !abvPattern.test(newAbr.value)) {
      alert('Abbreviation must be limit to 6 or letters, numbers and hyphen(-)')
      return;
    }

    const findLabel = sections.value.find(s => s.label === newLabel.value)
    const findAbv = sections.value.find(s => s.abv === newAbr.value)
    if (findLabel || findAbv) {
      alert('This label or abbreviation already exists. Please use a different one')
      return
    }

    const id = uuid();
    props.addTags({ id, label: newLabel.value, abv: newAbr.value });
    dialog.value = false;
    newLabel.value = ''
    newAbr.value = ''
  } else {
    alert('Data Input Error');
  }
};
</script>

<style>
.add-button {
  background-color: transparent;
  color: #3d9ffb;
  border: none;
  font-size: 18px;
  font-weight: bold;
}
</style>