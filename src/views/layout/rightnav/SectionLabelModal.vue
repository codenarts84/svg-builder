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
          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
          <v-spacer></v-spacer>
          <v-btn text="Add" variant="standard" @click="onAdd"
            color="primary"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, defineProps } from "vue";
import { v4 as uuid } from "uuid";
const dialog = ref(false);
const newLabel = ref("");
const newAbr = ref("");
const props = defineProps({
  addTags: Function,
});

const onAdd = () => {
  if (newLabel.value && newAbr.value) {
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