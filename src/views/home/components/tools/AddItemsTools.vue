<template>
  <div id="items-dropdown" style="width: 100%; height: 100%">
    <DrawSquareIcon width="20px" height="20px" />
  </div>
  <v-menu location="end" activator="#items-dropdown">
    <v-list style="left: 20px">
      <v-list-item @click="onAddTextField">
        <v-list-item-title>
          <v-icon color="black" icon="mdi-pen-plus" size="large"></v-icon>
        </v-list-item-title>
      </v-list-item>

      <v-list-item @click="onAddRectangle">
        <v-list-item-title>
          <v-icon
            color="black"
            icon="mdi-shape-rectangle-plus"
            size="large"
          ></v-icon>
        </v-list-item-title>
      </v-list-item>

      <v-list-item @click="onAddEllipse">
        <v-list-item-title>
          <v-icon
            color="black"
            icon="mdi-shape-circle-plus"
            size="large"
          ></v-icon>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { defineProps } from "vue";
import DrawSquareIcon from "@/assets/svgs/menuIcons/DrawSquareIcon.vue";

const props = defineProps({
  addRectangle: Function,
  addEllipse: Function,
  addTextField: Function,
  onImportClick: Function,
});
const onAddRectangle = () => props.addRectangle();
const onAddEllipse = () => props.addEllipse();
const onAddTextField = () => props.addTextField();
</script>
