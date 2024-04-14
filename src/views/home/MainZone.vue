<template>
  <div>
    <!-- <h1>TEST</h1> -->
    <!-- <div class="app-navbar"> -->
    <Toolbar />
    <!-- </div> -->
    <!-- <div class="app-main"> -->
    <!-- <div class="app-canvas-area"> -->
    <!-- <div class="app-canvas"> -->
    <Plan ref="plan"></Plan>
    <!-- </div> -->
    <!-- </div> -->
    <!-- </div> -->
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { usePlanStore } from "@/stores/plan.js"; // Assuming you've set up a Pinia store in this location
import Toolbar from "./components/Toolbar.vue";
import Plan from "./components/canvas/Plan.vue";

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

// Methods
const hideWelcomePrompt = () => {
  showWelcomePrompt.value = false;
  window.localStorage.setItem("frontrow2.welcome.seen", WELCOME_VERSION);
};
</script>

<!-- <style>
#app {
  display: flex;
  flex-direction: column;
  background: #efefef;
  height: 100vh;
}

#app .app-navbar {
  height: 50px;
  min-height: 50px;
  background: white;
  padding: 5px;
  flex: 0;
  z-index: 200;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);
}

#app .app-main {
  background: red;
  flex: 1;
  display: flex;
  flex-direction: row;
  height: calc(100vh - 48px);
  max-height: calc(100vh - 48px);
}

#app .app-main .app-properties {
  min-width: 350px;
  width: 350px;
  flex: 0;
  background: #efefef;
  box-shadow: -3px 3px 5px rgba(0, 0, 0, 0.2);
}

#app .app-main .app-properties .mdi-help-circle {
  color: #999;
}

#app .app-main .app-canvas-area {
  display: flex;
  flex-direction: column;
  flex: auto 1 1;
  background: #333;
}

#app .app-main .app-canvas-area .app-canvas {
  flex: auto 1 1;
  height: calc(100% - 24px);
}

#app .app-main .app-canvas-area .app-status-bar {
  overflow: hidden;
  width: 100%;
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 24px;
  height: 24px;
  background: #fff;
  border-top: 1px solid #ddd;
  color: #888;
  padding: 4px;
}

.buffer {
  flex: auto;
}

.group-title {
  flex: none;
  color: #333;
  margin: 16px 8px 0 16px;
  height: 28px;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-title .bunt-icon-button {
  margin: -4px 0;
}

@media print {
  #app .app-navbar,
  #app .app-properties,
  #app .app-status-bar {
    display: none;
  }
</style>
} -->
