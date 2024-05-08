<template>
  <AppToolbar />
  <v-layout class="main-container">
    <RightNav :temp_Rotate="temp_Rotate" />
    <div class="main-pan">
      <HandMenu :selectionBoundary="selectionBoundary" />
      <!-- <MainZone style="padding: 100px"></MainZone> -->
      <!-- <Toolbar></Toolbar> -->
      <Plan ref="planref"></Plan>
      <StatusBar></StatusBar>
    </div>
  </v-layout>
</template>
<script setup>
import * as d3 from "d3";
import { ref, computed } from "vue";
import AppToolbar from "./components/AppToolbar.vue";
// import TestEditor from "./components/TestEditor.vue";
// import RightNav from "../layout/rightnav/RightNav.vue";
import RightNav from "../layout/right/RightNav.vue";
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

import { usePlanStore } from "@/stores/plan.js"; // Assuming you've set up a Pinia store in this location
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

const temp_Rotate = (v) => planref.value.temp_Rotate(v);

const selectionBoundary = () => planref.value.selectionBoundary;

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

.main-container {
  height: calc(100vh - 50px);
  width: calc(100% - 300px);
}
</style>
