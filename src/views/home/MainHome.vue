<template>
  <v-layout>
    <RightNav />
    <v-main style="padding-right: 300px">
      <AppToolbar
        :importSVG="importSVG"
        @zoomIn="zoomIn"
        @zoomOut="zoomOut"
        @textL="textL"
        @textR="textR"
        @textC="textC"
        :addTextField="addTextField"
        :addRectangle="addRectangle"
        :addEllipse="addEllipse"
        :removeItem="removeItem"
        :downloadSVG="handleDownloadSVG"
        :initscale="initscale"
        :onImportClick="onImportClick"
      />
      <TestEditor ref="TestEdt" :initscale="initscale" />
    </v-main>
  </v-layout>
</template>
<script setup>
import { ref } from "vue";
import AppToolbar from "./components/AppToolbar.vue";
import TestEditor from "./components/TestEditor.vue";
import RightNav from "../layout/rightnav/RightNav.vue";

const TestEdt = ref(null);
const initscale = ref(1);

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
