<template>
  <v-list
    style="position: fixed; top: 55px; left: 5px; z-index: 999"
    id="hand-menu"
  >
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
        <AddAlignTools :textR="textR" :textL="textL" :textC="textC" />
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { defineProps } from "vue";

import AddChairTools from "./tools/AddChairTools.vue";
import AddItemsTools from "./tools/AddItemsTools.vue";
import AddAlignTools from "./tools/AddAlignTools.vue";

// import ImportIcon from "@/assets/svgs/menuIcons/ImportIcon.vue";

const props = defineProps({
  addRectangle: Function,
  addEllipse: Function,
  addTextField: Function,
  onImportClick: Function,
  textR: Function,
  textL: Function,
  textC: Function,
});

console.log(props);
</script>

<style>
#hand-menu {
  background-color: #eeeeee;
  border-radius: 10px;
}
</style>
