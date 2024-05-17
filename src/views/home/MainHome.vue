<template>
  <AppToolbar :selectionBoundary="selectionBoundary" />
  <v-layout class="main-container">
    <RightNav :temp_Rotate="temp_Rotate" />
    <div class="main-pan">
      <HandMenu :selectionBoundary="selectionBoundary"
        :selectionBoxes="selectionBoxes" />
      <!-- <MainZone style="padding: 100px"></MainZone> -->
      <!-- <Toolbar></Toolbar> -->
      <Plan ref="planref"></Plan>
      <StatusBar></StatusBar>
    </div>
  </v-layout>
</template>
<script setup>
import { ref, computed, onMounted, provide } from "vue";
import AppToolbar from "./components/AppToolbar.vue";
import RightNav from "../layout/right/RightNav.vue";
import HandMenu from "./components/HandMenu.vue";
import Plan from "./components/canvas/Plan.vue";
import StatusBar from "./components/StatusBar.vue";
import sampleplan from "@/sampleplan";

import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan.js"; // Assuming you've set up a Pinia store in this location

const store = useMainStore();
store.loadPlan(
  localStorage.getItem("frontrow2.editor.plan")
    ? JSON.parse(localStorage.getItem("frontrow2.editor.plan"))
    : sampleplan.sampleplan
);

const WELCOME_VERSION = "1";

// Data properties as refs
const showCreateZonePrompt = ref(false);
const showWelcomePrompt = ref(
  window.localStorage.getItem("frontrow2.welcome.seen") !== WELCOME_VERSION
);
const cmdOtherwiseCtrl = ref(
  window.navigator.platform.toLowerCase().startsWith("mac") ? "CMD" : "CTRL"
);

const planStore = usePlanStore();
const plan = computed(() => planStore.plan);

// const planref = ref(null)
// const temp_Rotate = ref(null)

// onMounted(() => {
//   if (planref.value && planref.value.temp_Rotate) {
//     temp_Rotate.value = planref.value.temp_Rotate;
//   }
// })
// const planref = ref(null)
// const temp_Rotate = (v) => planref.value.temp_Rotate(v);
// const selectionBoundary = () => planref.value.selectionBoundary;
const planref = ref(null);
// Dynamically assign functions if ref is available
const temp_Rotate = (v) => planref.value ? planref.value.temp_Rotate(v) : undefined;
const selectionBoundary = () => planref.value ? planref.value.selectionBoundary : undefined;
const selectionBoxes = () => planref.value ? planref.value.selectionBoxes : undefined;

provide('planRef', planref);
// const selectionBoundary = () => planref.value ? planref.value.selectionBoundary : null;

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
  height: calc(100vh - 41px);
  width: calc(100% - 300px);
}
</style>
