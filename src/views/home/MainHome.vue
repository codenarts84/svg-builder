<template>
  <AppToolbar
    :importSVG="importSVG"
    :zoomIn="zoomIn"
    :zoomOut="zoomOut"
    :zoomTo="zoomTo"
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
      /* top: 50px; */
      /* position: absolute; */
      width: calc(100% - 300px);
    "
  >
    <RightNav />
    <div class="main-pan">
      <HandMenu
        :addTextField="addTextField"
        :addEllipse="addEllipse"
        :addRectangle="addRectangle"
        :textR="textR"
        :textL="textL"
        :textC="textC"
      />
      <!-- <MainZone style="padding: 100px"></MainZone> -->
      <!-- <Toolbar></Toolbar> -->
      <Plan ref="planref"></Plan>
      <StatusBar></StatusBar>
      <!-- <TestEditor ref="TestEdt" /> -->
    </div>
  </v-layout>
</template>
<script setup>
import * as d3 from "d3";
import { ref, computed } from "vue";
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

const planref = ref(null);
const TestEdt = ref(null);

// const zoomIn = () => {
//   TestEdt.value.zoomIn();
// };

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
// const zoomOut = () => TestEdt.value.zoomOut();
const onImportClick = () => TestEdt.value.onImportClick();
const handleDownloadSVG = () => {
  if (TestEdt.value) {
    console.log(TestEdt.value);
    TestEdt.value.downloadSVG();
  } else {
    console.error("TestEdt component is not yet mounted or available.");
  }
};

import { usePlanStore } from "@/stores/plan.js"; // Assuming you've set up a Pinia store in this location
import Toolbar from "./components/Toolbar.vue";
import Plan from "./components/canvas/Plan.vue";
import StatusBar from "./components/StatusBar.vue";

const WELCOME_VERSION = "1";

// Using Pinia store
const planStore = usePlanStore();

// Data properties as refs
const showCreateZonePrompt = ref(false);
const showWelcomePrompt = ref(
  window.localStorage.getItem("frontrow2.welcome.seen") !== WELCOME_VERSION
);
const cmdOtherwiseCtrl = ref(
  window.navigator.platform.toLowerCase().startsWith("mac") ? "CMD" : "CTRL"
);

const plan = computed(() => planStore.plan);

const zoomIn = () => {
  planref.value.scaleBy(planref.value, 1.1);
};
const zoomOut = () => {
  // planref.value.scaleTo(planref.value, 1);
  planref.value.scaleBy(planref.value, 0.9);
};

const zoomTo = (v) => planref.value.scaleTo(planref.value, v);

// Methods
const hideWelcomePrompt = () => {
  showWelcomePrompt.value = false;
  window.localStorage.setItem("frontrow2.welcome.seen", WELCOME_VERSION);
};
</script>

<style>
.main-pan {
  width: 100%;
  background-color: rgb(151, 162, 182);
  /* display: flex; */
  /* align-items: center; */
  /* justify-content: center; */
}
</style>
