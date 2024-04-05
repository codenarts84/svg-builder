<template>
  <div id="app">
    <v-layout>
      <v-navigation-drawer location="right" permanent>
        <template v-slot:prepend>
          <v-list-item
            lines="two"
            prepend-avatar="https://randomuser.me/api/portraits/women/81.jpg"
            subtitle="Logged in"
            title="Jane Smith"
          ></v-list-item>
        </template>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-home-city"
            title="Home"
            value="home"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-account"
            title="My Account"
            value="account"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-account-group-outline"
            title="Users"
            value="users"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 250px">
        <AppToolbar
          @importSVG="importSVG"
          @downloadSVG="handleDownloadSVG"
          @zoomIn="zoomIn"
          @zoomOut="zoomOut"
          @addTextField="addTextField"
          @addRectangle="addRectangle"
          @addEllipse="addEllipse"
          @textL="textL"
          @textR="textR"
          @textC="textC"
          @removeItem="removeItem"
        />
        <TestEditor ref="TestEdt" />
      </v-main>
    </v-layout>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AppToolbar from "./components/AppToolbar.vue";
import TestEditor from "./components/TestEditor.vue";

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
const handleDownloadSVG = () => {
  if (TestEdt.value) {
    console.log(TestEdt.value);
    TestEdt.value.downloadSVG();
  } else {
    console.error("TestEdt component is not yet mounted or available.");
  }
};
</script>
