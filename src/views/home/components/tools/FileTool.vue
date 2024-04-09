<template>
  <v-toolbar-items class="border-both">
    <v-btn color="primary" style="margin-left: 10px"
      ><v-icon color="black" icon="mdi-file" size="large"></v-icon
    ></v-btn>
    <v-btn class="btn" @click="onImport">
      <v-icon color="black" icon="mdi-folder" size="large"></v-icon
    ></v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { defineProps } from "vue";
// import ImportIcon from "@/assets/svgs/menuIcons/ImportIcon.vue";

const props = defineProps({
  onImportClick: Function,
});

const onImport = () => props.onImportClick();
</script>
