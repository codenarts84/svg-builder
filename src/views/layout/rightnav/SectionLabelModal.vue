<template>
  <div
    style="display: flex; justify-content: space-between; align-items: center"
  >
    <h4>Section Labeling</h4>
    <v-btn
      class="btn"
      @click="dialog = true"
      size="small"
      variant="standard"
      style="padding: 0px"
      ><v-icon color="black" icon="mdi-plus" size="large"></v-icon>
    </v-btn>
  </div>

  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <v-card prepend-icon="mdi-label" title="Add Section Label">
        <v-card-text>
          <v-text-field
            type="text"
            label="New label"
            v-model="newLabel"
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
          <v-spacer></v-spacer>
          <v-btn
            text="Add"
            variant="standard"
            @click="onAdd"
            color="primary"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, defineProps } from "vue";
const dialog = ref(false);
const newLabel = ref("");
const props = defineProps({
  addTags: Function,
});

const onAdd = () => {
  props.addTags(newLabel.value);
  dialog.value = false;
};
</script>
