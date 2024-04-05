<template>
  <div>
    <input type="file" @change="importSVG" accept=".svg" />
    <div>
      <svg
        ref="svgBoard"
        :width="boardWidth + 'px'"
        :height="boardHeight + 'px'"
        :viewBox="viewBox"
        style="border: 1px solid black"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @mousedown="startDrag"
        @mousemove="drag"
      >
        <circle
          v-for="(circle, index) in circles"
          :key="circle.id"
          :data-id="circle.id"
          :cx="circle.x"
          :cy="circle.y"
          :r="circle.radius"
          :fill="circle.color"
          @mousedown.prevent="selectCircle(index, $event)"
        />
      </svg>
    </div>

    <div>
      <input type="text" v-model="boardName" placeholder="Board Name" />
      <input type="number" v-model.number="boardWidth" placeholder="Width" />
      <input type="number" v-model.number="boardHeight" placeholder="Height" />
      <button @click="applyBoardChanges">Save Board Changes</button>
      <div v-if="activeCircleIndex !== -1">
        <input
          type="text"
          v-model="circles[activeCircleIndex].name"
          placeholder="Circle Name"
        />
        <input type="color" v-model="circles[activeCircleIndex].color" />
        <input
          type="number"
          v-model.number="circles[activeCircleIndex].radius"
          min="1"
          placeholder="Radius"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineExpose } from "vue";
import { saveAs } from "file-saver";

const svgBoard = ref(null);
const circles = ref([]);
let offsetX = 0;
let offsetY = 0;

const activeCircleIndex = ref(-1);
const scale = ref(1);
const boardName = ref("My SVG Board");
const boardWidth = ref(800);
const boardHeight = ref(500);
const viewBox = ref(`0 0 ${boardWidth.value} ${boardHeight.value}`);

watch(
  [boardWidth, boardHeight],
  () => {
    viewBox.value = `0 0 ${boardWidth.value} ${boardHeight.value}`;
  },
  { immediate: true }
);

function zoomIn() {
  scale.value *= 0.9;
  updateViewBox();
}

function zoomOut() {
  scale.value *= 1.1;
  updateViewBox();
}

function updateViewBox() {
  const newWidth = boardWidth.value * scale.value;
  const newHeight = boardHeight.value * scale.value;
  const newX = (boardWidth.value - newWidth) / 2;
  const newY = (boardHeight.value - newHeight) / 2;
  viewBox.value = `${newX} ${newY} ${newWidth} ${newHeight}`;
}

function addCircle() {
  const newId = circles.value.length + 1;
  circles.value.push({
    id: newId,
    name: `Circle ${newId}`,
    color: "blue",
    radius: 30,
    x: Math.random() * (boardWidth.value - 60) + 30,
    y: Math.random() * (boardHeight.value - 60) + 30,
  });
}

function selectCircle(index, event) {
  activeCircleIndex.value = index;
  // Capture the initial mouse position for dragging
  offsetX = event.clientX;
  offsetY = event.clientY;
  // Add listeners for dragging, ensuring movement is tracked only after selection
  window.addEventListener("mousemove", drag);
  window.addEventListener("mouseup", endDrag);
}

function startDrag(event) {
  if (event.target.tagName === "circle") {
    const circleId = parseInt(event.target.dataset.id);
    const circleIndex = circles.value.findIndex(
      (circle) => circle.id === circleId
    );
    if (circleIndex !== -1) {
      activeCircleIndex.value = circleIndex;
      const circle = circles.value[circleIndex];
      offsetX = event.clientX - circle.x;
      offsetY = event.clientY - circle.y;
      // window.addEventListener("mousemove", drag);
      // window.addEventListener("mouseup", endDrag);
    }
  }
}

function drag(event) {
  if (activeCircleIndex.value !== -1) {
    const circle = circles.value[activeCircleIndex.value];
    const newX = event.clientX - offsetX;
    const newY = event.clientY - offsetY;
    circle.x = newX;
    circle.y = newY;
  }
}

function endDrag() {
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", endDrag);
  // Optionally reset activeCircleIndex to -1 if you want to deselect the circle after dragging
  activeCircleIndex.value = -1;
}

function downloadSVG() {
  if (svgBoard.value) {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgBoard.value);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    saveAs(blob, `${boardName.value}.svg`);
  } else {
    console.error("SVG board is not available.");
  }
}

function importSVG(event) {
  const file = event.target.files[0];
  if (file && file.type === "image/svg+xml") {
    const reader = new FileReader();
    reader.onload = (e) => {
      svgBoard.value.innerHTML = e.target.result;
      scale.value = 1;
      viewBox.value = `0 0 ${boardWidth.value} ${boardHeight.value}`;
    };
    reader.readAsText(file);
  } else {
    alert("Please select a valid SVG file.");
  }
}

function applyBoardChanges() {
  boardWidth.value = Math.max(100, boardWidth.value);
  boardHeight.value = Math.max(100, boardHeight.value);
  viewBox.value = `0 0 ${boardWidth.value} ${boardHeight.value}`;
}

defineExpose({
  zoomIn,
  zoomOut,
  addCircle,
  downloadSVG,
});
</script>
