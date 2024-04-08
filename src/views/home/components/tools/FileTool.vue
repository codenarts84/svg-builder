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

        <v-list-item @click="() => console.log('Hi')">
          <v-list-item-title>
            <AddItemsTools
              :addTextField="addTextField"
              :addEllipse="addEllipse"
              :addRectangle="addRectangle"
            />
          </v-list-item-title>
        </v-list-item>

        <v-list-item @click="() => console.log('Hi')">
          <v-list-item-title>
            <AddAlignTools />
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
import AddItemsTools from "./AddItemsTools.vue";
import AddAlignTools from "./AddAlignTools.vue";
// import ImportIcon from "@/assets/svgs/menuIcons/ImportIcon.vue";

const props = defineProps({
  addRectangle: Function,
  addEllipse: Function,
  addTextField: Function,
  onImportClick: Function,
});

const onImport = () => props.onImportClick();
</script>
