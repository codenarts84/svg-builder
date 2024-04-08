<template>
  <v-toolbar-items class="border-both">
    <v-btn id="menu-activator" color="primary" style="margin-left: 10px"
      ><v-icon color="black" icon="mdi-file" size="large"></v-icon
    ></v-btn>

    <v-menu activator="#menu-activator">
      <v-list>
        <v-list-item @click="() => console.log('Hi')">
          <v-list-item-title>
            <AddChairTools />
          </v-list-item-title>
        </v-list-item>

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
    <v-btn class="btn" @click="onImport">
      <v-icon color="black" icon="mdi-folder" size="large"></v-icon
    ></v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { defineProps } from "vue";
import AddChairTools from "./AddChairTools.vue";
// import ImportIcon from "@/assets/svgs/menuIcons/ImportIcon.vue";

const props = defineProps({
  addRectangle: Function,
  addEllipse: Function,
  addTextField: Function,
  onImportClick: Function,
});

const onAddRectangle = () => props.addRectangle();
const onAddEllipse = () => props.addEllipse();
const onAddTextField = () => props.addTextField();
const onImport = () => props.onImportClick();
</script>
