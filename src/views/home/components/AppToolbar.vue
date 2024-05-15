<template>
  <v-toolbar flat class="app-toolbar-container">
    <FileTool :importSVG="importSVG" />
    <MainTools :selectionBoundary="selectionBoundary" />
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
import axios from 'axios';

import SettingModal from "./utils/SettingModal.vue";
import CheckModal from "./utils/CheckModal.vue";
import ExportModal from "./utils/ExportModal.vue";
import MainTools from "./tools/MainTools.vue";
import FileTool from "./tools/FileTool.vue";
import GridView from "./utils/GridView.vue";
import sampleplan from "@/sampleplan";
import { usePlanStore } from "@/stores/plan";
import { useMainStore } from "@/stores";
import { v4 as uuid } from "uuid";
import emailjs from 'emailjs-com';
import { useToast } from "vue-toastification";
import Plunk from "@plunk/node"

const planStore = usePlanStore();
const boardStore = useBoardStore();
const boardName = ref(computed(() => planStore.plan.name));
const plan = ref(computed(() => planStore.plan))
const store = useMainStore();

const props = defineProps({
  selectionBoundary: Function
})

const toast = useToast();

const getTags = (tags) => {
  if (!tags) return [];
  const descriptionMap = {
    W: 'Wheelchair',
    C: 'Wheelchair Companion',
    P: 'Partial View',
    F: 'Folding Chair',
    S: 'Standing Room Only'
  };

  const codes = tags.split(',');
  const descriptions = codes.map(code => descriptionMap[code.trim()]);
  return descriptions;
}


const importSVG = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.svg'
  input.onchange = (e) => {
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.onload = function (e) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(e.target.result, "image/svg+xml");
      const planData = doc.querySelector('svg').getAttribute('data-json');
      console.log(JSON.parse(planData))
      store.loadPlan(JSON.parse(planData))
      planStore.persistPlan();
    };
    reader.readAsText(file);
  }
  input.click()
}

const removeComments = rootElement => {
  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_COMMENT,
    {
      acceptNode: function (node) {
        return NodeFilter.FILTER_ACCEPT;
      }
    },
    false
  );

  const comments = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    comments.push(currentNode);
    currentNode = walker.nextNode();
  }

  // Remove all collected comment nodes
  comments.forEach(comment => {
    comment.parentNode.removeChild(comment);
  });
  return rootElement;
}

const exportSVG = (emailAddress) => {
  let svgElement = document.getElementsByClassName('zone')[0];
  let metadata = document.getElementsByTagName('metadata');
  let newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  newSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  newSvg.setAttribute("version", "1.1");
  newSvg.setAttribute("width", "900");  // Set as per your requirement
  newSvg.setAttribute("height", "900"); // Set as per your requirement
  newSvg.setAttribute("data-json", JSON.stringify(plan.value));
  for (let i = 0; i < metadata.length; i++) {
    newSvg.appendChild(metadata[i].cloneNode(true));
  }
  newSvg.appendChild(svgElement.cloneNode(true));
  newSvg = removeComments(newSvg)
  const filename = `booktix_name_of_chart_${Date.now()}.svg`
  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(newSvg);
  var blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename || 'booktix_name_of_chart_.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // const serviceID = 'service_jv2oiml';
  // const templateID = 'template_60b0p0p';
  // const publicKey = 'yAHgq8gPUad2EXNq2';

  // const reader = new FileReader();
  // reader.readAsDataURL(blob);
  // reader.onloadend = () => {
  //   const publicKey = "sk_a32804368b8622a5160fdf9b40dc276784a299440246a2c5"
  //   const plunk = new Plunk(publicKey)
  //   const base64data = reader.result.split(',')[1];

  //   console.log(base64data)

  //   const options = {
  //     to: emailAddress,
  //     subject: "SVG Map",
  //     body: "Here is your SVG file",
  //     attachments: [
  //       {
  //         content: base64data,
  //         filename: 'file.svg',
  //         type: 'image/svg+xml',
  //         // disposition: 'attachment'
  //       }
  //     ]
  //   }

  //   plunk.emails.send(options)
  //     .then(response => {
  //       toast.success("Success!");
  //     }).catch(err => {
  //       toast.error("Failed");
  //     })
  // }
}

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
