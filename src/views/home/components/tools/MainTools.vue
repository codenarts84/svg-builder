<template>
  <v-toolbar-items class="border-left">
    <v-btn class="btn" @click="$emit('addTextField')">
      <v-icon color="black" icon="mdi-cursor-default" size="large"></v-icon
    ></v-btn>
    <v-btn class="btn" @click="$emit('addTextField')">
      <v-icon
        color="black"
        icon="mdi-cursor-default-outline"
        size="large"
      ></v-icon
    ></v-btn>
    <v-btn class="btn" @click="$emit('addRectangle')"
      ><v-icon color="black" icon="mdi-clipboard-multiple" size="large"></v-icon
    ></v-btn>
    <v-btn class="btn" @click="$emit('addRectangle')"
      ><v-icon color="black" icon="mdi-restore" size="large"></v-icon
    ></v-btn>

    <v-btn class="btn" @click="$emit('addEllipse')"
      ><v-icon
        color="black"
        icon="mdi-hand-back-right"
        size="large"
      ></v-icon></v-btn
    ><v-btn class="btn" @click="onDelete"
      ><v-icon color="black" icon="mdi-delete" size="large"></v-icon
    ></v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { defineProps } from "vue";

const props = defineProps({
  removeItem: Function,
});

const onDelete = () => props.removeItem();
</script>
