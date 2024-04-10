<template>
  <v-toolbar
    flat
    style="position: fixed; opacity: 1; height: 50px; z-index: 999"
  >
    <FileTool
      :addTextField="addTextField"
      :addEllipse="addEllipse"
      :addRectangle="addRectangle"
      :onImportClick="onImportClick"
      :textR="textR"
      :textL="textL"
      :textC="textC"
    />
    <MainTools :removeItem="removeItem" />
    <!-- <v-spacer></v-spacer> -->

    <v-toolbar-title>{{ boardName }}</v-toolbar-title>

    <v-toolbar-items class="border-both">
      <MagnifierComponent />
    </v-toolbar-items>
    <v-toolbar-items class="border-both">
      <GridView />
    </v-toolbar-items>
    <v-toolbar-items class="border-both">
      <SettingModal />
      <CheckModal />
      <ExportModal :export="exportSVG" />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script setup>
import { computed, ref, defineProps } from "vue";
import MagnifierComponent from "./utils/MagnifierView.vue";
import { useBoardStore } from "../../../stores/svgStore";

import SettingModal from "./utils/SettingModal.vue";
import CheckModal from "./utils/CheckModal.vue";
import ExportModal from "./utils/ExportModal.vue";
import MainTools from "./tools/MainTools.vue";
import FileTool from "./tools/FileTool.vue";
import GridView from "./utils/GridView.vue";

const boardStore = useBoardStore();
const boardName = ref(computed(() => boardStore.board_name));

const exportSVG = () => props.downloadSVG();

const props = defineProps({
  downloadSVG: Function,
  removeItem: Function,
  addTextField: Function,
  addEllipse: Function,
  addRectangle: Function,
  onImportClick: Function,
  textR: Function,
  textL: Function,
  textC: Function,
});
</script>

<style>
.app-toolbar {
  background-color: #eee;
  padding: 10px;
  display: flex;
  gap: 10px;
}
.v-toolbar__content {
  height: 50px !important;
}
.border-both {
  border-right: 2px solid rgba(255, 255, 255, 0.5);
  border-left: 2px solid rgb(255, 255, 255, 0.5);
}
.border-left {
  border-left: 2px solid rgb(255, 255, 255, 0.5);
}
</style>
