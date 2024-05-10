<template>
  <v-toolbar flat class="app-toolbar-container">
    <FileTool />
    <MainTools />
    <v-toolbar-title :style="toolbarTitleStyle">{{
      boardName
    }}</v-toolbar-title>
    <v-toolbar-items class="border-left">
      <MagnifierComponent />
    </v-toolbar-items>
    <v-toolbar-items class="border-left">
      <GridView />
    </v-toolbar-items>
    <v-toolbar-items class="border-left">
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
// import nodemailer from 'nodemailer'

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'homeoffer25@gmail.com',
//     pass: 'ejvkwyfausdkfej!'
//   }
// })

// const sendEmail = async () => {
//   try {
//     const infor = await transporter.sendMail({
//       from: 'homeoffer25@gmail.com',
//       to: 'leedevlab@gmail.com',
//       subject: 'SVG map',
//       text: 'This is a test'
//     })
//     console.log(info.response);
//   }
//   catch (err) {
//     console.log(err)
//   }
// }

import { usePlanStore } from "@/stores/plan";
const planStore = usePlanStore();
const boardStore = useBoardStore();
const boardName = ref(computed(() => planStore.plan.name));

const exportSVG = () => {
  // if (this.validationErrors === undefined || this.validationErrors.length === 0 || confirm('Your plan contains validation errors. Do you still want to download it?')) {
  // const url = URL.createObjectURL(new Blob([JSON.stringify(planStore.plan, undefined, 2)]))
  // const a = document.createElement('a')
  // a.style.display = 'none'
  // a.href = url
  // a.download = planStore.plan.name + '.json'
  // document.body.appendChild(a)
  // a.click()
  // URL.revokeObjectURL(url)

  const plan = planStore.plan;
  console.log(typeof plan, plan)

  // sendEmail();
  // } else {
  //   this.showValidationResult = true
  // }

  // const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
  //                     <rect width="100%" height="100%" fill="lightgray"/>
  //                     <circle cx="200" cy="100" r="80" fill="orange"/>
  //                     <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="white">SVG Export Example</text>
  //                   </svg>`;

  // let svgContent = document.getElementById('svg').innerHTML
  // const blob = new Blob([svgContent], { type: 'image/svg+xml' });

  // const url = URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // a.style.display = 'none';
  // a.href = url;
  // a.download = 'exported_svg.svg';
  // document.body.appendChild(a);
  // a.click();
  // URL.revokeObjectURL(url);
}

const props = defineProps({

});

const toolbarTitleStyle = computed(() => {
  return {
    fontSize: "16px",
    fontWeight: "bold",
    lineHeight: "1.2",
    height: boardName.value.length < 50 ? "20px" : "38.4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    whiteSpace: "normal",
  };
});
</script>

<style>
.app-toolbar-container {
  position: fixed;
  opacity: 1;
  height: 50px;
  z-index: 999;
}

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

.v-toolbar-title__placeholder {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
  height: 38.4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}
</style>
