<template>
  <v-list style="position: fixed; top: 55px; left: 5px; z-index: 999"
    id="hand-menu">
    <v-list-item @click="onSeatToggle">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Seat</v-tooltip>
        <div class="arrow-menu">
          <SeatBuilderIcon width="20px" height="20px" />
          <div>{{ ">" }}</div>
        </div>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="onItemToggle">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Shape</v-tooltip>
        <div class="arrow-menu">
          <DrawSquareIcon width="20px" height="20px" />
          <div>{{ ">" }}</div>
        </div>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="() => { }">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Alignment</v-tooltip>
        <AddAlignTools :textR="textR" :textL="textL" :textC="textC"
          :onItemToggle="onAlignToggle" />
      </v-list-item-title>
    </v-list-item>
  </v-list>
  <AddChairTools :opened="seatopened" />
  <AddItemsTools :addTextField="addTextField" :addEllipse="addEllipse"
    :addRectangle="addRectangle" :opened="itemopened" />
</template>

<script setup>
import { defineProps, ref } from "vue";

import AddChairTools from "./tools/AddChairTools.vue";
import AddItemsTools from "./tools/AddItemsTools.vue";
import AddAlignTools from "./tools/AddAlignTools.vue";

import SeatBuilderIcon from "@/assets/svgs/menuIcons/SeatBuilderIcon.vue";
import DrawSquareIcon from "@/assets/svgs/menuIcons/DrawSquareIcon.vue";

const seatopened = ref(false);
const itemopened = ref(false);

const onSeatToggle = () => {
  seatopened.value = !seatopened.value;
  itemopened.value = false;
};

const onItemToggle = () => {
  itemopened.value = !itemopened.value;
  seatopened.value = false;
};

const onAlignToggle = () => {
  itemopened.value = false;
  seatopened.value = false;
};

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
