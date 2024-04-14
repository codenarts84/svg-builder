<template>
  <AppToolbar
    :importSVG="importSVG"
    @zoomIn="zoomIn"
    @zoomOut="zoomOut"
    :textL="textL"
    :textR="textR"
    :textC="textC"
    :addTextField="addTextField"
    :addRectangle="addRectangle"
    :addEllipse="addEllipse"
    :removeItem="removeItem"
    :downloadSVG="handleDownloadSVG"
    :onImportClick="onImportClick"
  />
  <v-layout
    style="
      height: calc(100vh - 50px);
      top: 50px;
      position: absolute;
      width: calc(100% - 300px);
    "
  >
    <RightNav />
    <div style="width: 100%">
      <HandMenu
        :addTextField="addTextField"
        :addEllipse="addEllipse"
        :addRectangle="addRectangle"
        :textR="textR"
        :textL="textL"
        :textC="textC"
      />
      <MainZone style="padding: 100px"></MainZone>
      <!-- <TestEditor ref="TestEdt" /> -->
    </div>
  </v-layout>
</template>
<script setup>
import { ref } from "vue";
import AppToolbar from "./components/AppToolbar.vue";
// import TestEditor from "./components/TestEditor.vue";
import RightNav from "../layout/rightnav/RightNav.vue";
import HandMenu from "./components/HandMenu.vue";
import MainZone from "./MainZone.vue";

import { useMainStore } from "@/stores";
import sampleplan from "@/sampleplan";

const store = useMainStore();
store.loadPlan(
  localStorage.getItem("frontrow2.editor.plan")
    ? JSON.parse(localStorage.getItem("frontrow2.editor.plan"))
    : sampleplan.sampleplan
);

const TestEdt = ref(null);

const zoomIn = () => {
  TestEdt.value.zoomIn();
};

const removeItem = () => {
  TestEdt.value.deleteItem();
};

const textL = () => TestEdt.value.textAlign("start");
const textC = () => TestEdt.value.textAlign("middle");
const textR = () => TestEdt.value.textAlign("end");
const importSVG = () => TestEdt.value.importSVG();
const addEllipse = () => TestEdt.value.addEllipse();
const addRectangle = () => TestEdt.value.addRectangle();
const addTextField = () => TestEdt.value.addTextField();
const zoomOut = () => TestEdt.value.zoomOut();
const onImportClick = () => TestEdt.value.onImportClick();
const handleDownloadSVG = () => {
  if (TestEdt.value) {
    console.log(TestEdt.value);
    TestEdt.value.downloadSVG();
  } else {
    console.error("TestEdt component is not yet mounted or available.");
  }
};
</script>
