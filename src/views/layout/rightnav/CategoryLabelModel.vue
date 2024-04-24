<template>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <h4>Categories</h4>
    <v-btn class="btn" @click="handle_close" size="small" variant="standard"
      style="padding: 0px"><v-icon color="black" icon="mdi-plus"
        size="large"></v-icon>
    </v-btn>
  </div>

  <div class="text-center">
    <h4>Categories can have pricing assigned when rendering the chart for a
      specific event, thus defining the pricing for objects assigned to each
      category</h4>
  </div>

  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <v-card prepend-icon="mdi-label" title="Add Section Label">
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

const handle_close = () => {

}
</script>
