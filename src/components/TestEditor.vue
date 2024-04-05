<template>
  <div class="demo-container">
    <div class="colorpicker" v-show="showcolors">
      <Sketch v-model="colors" @change-color="onChange" />
    </div>

    <v-file-input
      label="Upload your svg file"
      prepend-icon="mdi-svg"
      variant="filled"
      type="file"
      accept=".svg"
      @change="importSVG"
      style="width: 300px; padding: 20px"
    ></v-file-input>
    <!-- <input type="file" @change="$emit('importSVG')" accept=".svg" /> -->
    <div class="canvas">
      <svg
        ref="svgBoard"
        :width="boardWidth"
        :height="boardHeight"
        :viewBox="viewBox"
        @mousemove="onMouseMove($event)"
        @mouseup="onMouseUp($event)"
        @click="onClickItem($event, {})"
      >
        <g
          v-for="item in items"
          :transform="'translate(' + item.x + ', ' + item.y + ')'"
          :key="item"
        >
          <!-- item -->

          <text
            v-if="item.type == 'text'"
            :x="getTextXPos(item)"
            :y="item.height * 0.9"
            :_width="item.width"
            :_height="item.height"
            :font-size="item.height"
            :font-family="item.font"
            :fill="item.color"
            :text-anchor="item.textAnchor"
            @click="onClickItem($event, item)"
          >
            {{ item.text }}
          </text>

          <rect
            v-if="item.type == 'rect'"
            :x="0"
            :y="0"
            :width="item.width"
            :height="item.height"
            :fill="item.color"
            @click="onClickItem($event, item)"
          ></rect>

          <ellipse
            v-if="item.type == 'ellipse'"
            :cx="item.width / 2"
            :cy="item.height / 2"
            :rx="item.width / 2"
            :ry="item.height / 2"
            :fill="item.color"
            @click="onClickItem($event, item)"
          ></ellipse>

          <!-- controls 
        <g v-for="item in items"
          :transform="'translate('+item.x+', '+item.y+')'"
          v-if="item.active"
        >-->
          <g v-if="item.active">
            <rect
              :x="0"
              :y="0"
              :width="item.width"
              :height="item.height"
              class="ctrl-bounds"
              @click="onClickItem($event, item)"
              @_mouseout="onMouseUpRegion($event, item)"
              @mousedown="onMouseDownRegion($event, item)"
            />
            <g @mousedown="onMouseDownHandles($event, item)">
              <rect
                class="ctrl-rect"
                :width="tools.squaresize"
                :height="tools.squaresize"
                data-handleid="1"
                :x="0 - tools.squaresize / 2"
                :y="0 - tools.squaresize / 2"
              />
              <rect
                class="ctrl-rect"
                :width="tools.squaresize"
                :height="tools.squaresize"
                data-handleid="3"
                :x="item.width - tools.squaresize / 2"
                :y="0 - tools.squaresize / 2"
              />
              <rect
                class="ctrl-rect"
                :width="tools.squaresize"
                :height="tools.squaresize"
                data-handleid="7"
                :x="0 - tools.squaresize / 2"
                :y="item.height - tools.squaresize / 2"
              />
              <rect
                class="ctrl-rect"
                :width="tools.squaresize"
                :height="tools.squaresize"
                data-handleid="9"
                :x="item.width - tools.squaresize / 2"
                :y="item.height - tools.squaresize / 2"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>

    <div>
      <input type="text" v-model="boardName" placeholder="Board Name" />
      <input type="number" v-model.number="boardWidth" placeholder="Width" />
      <input type="number" v-model.number="boardHeight" placeholder="Height" />
      <button @click="applyBoardChanges">Save Board Changes</button>
      <div v-if="activeItem !== -1">
        <input
          type="text"
          v-model="items[activeItem].name"
          placeholder="Circle Name"
        />
        <input
          type="number"
          v-model.number="items[activeItem].id"
          min="1"
          placeholder="Radius"
        />
        <input type="color" v-model="items[activeItem].color" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  watch,
  defineExpose,
} from "vue";
import { saveAs } from "file-saver";

const svgBoard = ref(null);
const boardName = ref("My SVG Board");
const boardWidth = ref(800);
const boardHeight = ref(500);
const activeItem = ref(-1);

// import Sketch from "vue-color/src/components/Sketch.vue";

let items = ref([]);
let colors = reactive({ hex: "#999999", a: 1 });
const showColors = ref(false);
// let onChangeColorListener = ref(() => {});
// console.log(onChangeColorListener());
var defaultProps = {
  hex: "#aaa",
  a: 1,
};

const tools = {
  squaresize: 8,
  min_height: 10,
};

// var swapArrayElements = function (arr, indexA, indexB) {
//   var temp = arr[indexA];
//   arr[indexA] = arr[indexB];
//   arr[indexB] = temp;
// };

// const tools = reactive({ squaresize: 8, min_height: 10 });
let movetarget = ref(null);
let activeItemIndex = ref(null);
const scale = ref(1);

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

const addTextField = () => {
  const newID = items.value.length + 1;
  items.value.push({
    type: "text",
    textAnchor: "left",
    active: false,
    x: 20,
    y: items.value.length * 60 + 20,
    text: "ENTER TEXT",
    width: 200,
    height: 30,
    font: "Arial",
    color: colors.hex,
    id: newID,
    name: newID + " - ENTER TEXT",
  });
};

const addRectangle = () => {
  const newID = items.value.length + 1;
  items.value.push({
    type: "rect",
    active: false,
    x: 20,
    y: items.value.length * 60 + 60,
    width: 200,
    height: 40,
    color: colors.hex,
    id: newID,
    name: newID + " - Rect",
  });
};

const addEllipse = () => {
  const newID = items.value.length + 1;
  items.value.push({
    type: "ellipse",
    active: false,
    x: 240,
    y: items.value.length * 60 + 60,
    width: 100,
    height: 100,
    color: colors.hex,
    id: newID,
    name: newID + " - Ellipse",
  });
};

const toggleColor = () => {
  showColors.value = !showColors.value;
};

function onClickItem(event, item) {
  event.stopPropagation(); //prevent parent from firing

  if (item.active) {
    return;
  }

  if (item.id) {
    activeItem.value = item.id - 1;
    console.log(
      item.id - 1,
      items.value[item.id - 1],
      "+++",
      items.value[item.id - 1].color
    );
  }
  // select item if not selected
  deactivateItems();
  item.active = true;
  // onChangeColorListener = function () {
  //   item.color = colors.hex;
  // };
  colors = defaultProps;
  colors.hex = item.color;
  activeItemIndex.value = items.value.indexOf(item);
}

// function moveUp() {
//   if (
//     activeItemIndex.value >= 0 &&
//     activeItemIndex.value < items.value.length
//   ) {
//     // var i = items[activeItemIndex];
//     swapArrayElements(
//       items.value,
//       activeItemIndex.value,
//       activeItemIndex.value + 1
//     );
//     activeItemIndex.value += 1;
//   }
// }

// function moveDown() {
//   if (activeItemIndex.value >= 0 && activeItemIndex.value >= 0) {
//     // var i = items[activeItemIndex];
//     swapArrayElements(
//       items.value,
//       activeItemIndex.value,
//       activeItemIndex.value - 1
//     );
//     activeItemIndex.value -= 1;
//   }
// }

function deactivateItems() {
  items.value.map(function (i) {
    if (i) i.active = false;
  });
}

function removeActiveItem() {
  items.value = items.value.filter((i) => i.active === false);
}
console.log(removeActiveItem);

function onMouseDownRegion(event, item) {
  if (item.active) {
    item.drag = {
      type: "MOVE",
      x: item.x,
      y: item.y,
      mx: event.x,
      my: event.y,
    };
  }
  movetarget.value = item;
}

function onMouseUp(event, element) {
  console.log(event, element);
  movetarget.value = null;
}

function onMouseMove(event) {
  if (movetarget.value == null) return;
  var item = movetarget.value;
  var t = tools;
  // console.log("MouseMove", item);
  if (item.active && item.drag != undefined) {
    if (item.drag.type == "MOVE") {
      item.x = event.x - item.drag.mx + item.drag.x;
      item.y = event.y - item.drag.my + item.drag.y;
    }
    if (item.drag.type == "SCALE") {
      if (item.drag.handleID == "1") {
        // TL resize handler
        item.x = Math.min(
          event.x - item.drag.mx + item.drag.x,
          item.drag.x + (item.drag.w - t.min_height)
        );
        item.y = Math.min(
          event.y - item.drag.my + item.drag.y,
          item.drag.y + (item.drag.h - t.min_height)
        ); // with y constraint
        item.width = Math.max(
          item.drag.w - event.x + item.drag.mx,
          t.min_height
        );
        item.height = Math.max(
          item.drag.h - event.y + item.drag.my,
          t.min_height
        );
      }
      if (item.drag.handleID == "3") {
        // TR resize handler
        item.y = Math.min(
          event.y - item.drag.my + item.drag.y,
          item.drag.y + (item.drag.h - t.min_height)
        ); // with y constraint
        item.width = Math.max(
          item.drag.w + event.x - item.drag.mx,
          t.min_height
        );
        item.height = Math.max(
          item.drag.h - event.y + item.drag.my,
          t.min_height
        );
      }
      if (item.drag.handleID == "7") {
        // BL
        item.x = Math.min(
          event.x - item.drag.mx + item.drag.x,
          item.drag.x + (item.drag.w - t.min_height)
        );
        item.width = Math.max(
          item.drag.w - event.x + item.drag.mx,
          t.min_height
        );
        item.height = Math.max(
          item.drag.h + event.y - item.drag.my,
          t.min_height
        );
      }
      if (item.drag.handleID == "9") {
        // BR
        item.width = Math.max(
          item.drag.w + event.x - item.drag.mx,
          t.min_height
        );
        item.height = Math.max(
          item.drag.h + event.y - item.drag.my,
          t.min_height
        );
      }
    }
  }
}

const onChange = (val) => {
  if (activeItemIndex.value !== null) {
    items.value[activeItemIndex.value].color = val;
  }
};

function textAlign(val) {
  var i = items.value[activeItemIndex.value];
  if (i && i.type == "text") {
    i.textAnchor = val;
  }
}

function getTextXPos(item) {
  if (item.textAnchor == "middle") return item.width / 2;
  if (item.textAnchor == "end") return item.width;
  return 0;
}
function onMouseDownHandles(event, item) {
  var handleID = event.target.getAttribute("data-handleid");

  item.drag = {
    x: item.x,
    y: item.y,
    mx: event.x,
    my: event.y,
    w: item.width,
    h: item.height,
    type: "SCALE",
    handleID: handleID,
  };

  movetarget.value = item;
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

// Implement mouse and key event handlers as needed

onMounted(() => {
  document.addEventListener("keyup", onKeyUp);
});

onUnmounted(() => {
  document.removeEventListener("keyup", onKeyUp);
});

const deleteItem = () => {
  if (activeItemIndex.value !== null) {
    console.log("Delete", activeItemIndex.value);
    activeItem.value = -1;
    items.value.splice(activeItemIndex.value, 1);
    activeItemIndex.value = null;
  } else {
    return;
  }
};

const onKeyUp = (event) => {
  if (event.key === "Delete") {
    deleteItem();
  }
};

function applyBoardChanges() {
  boardWidth.value = Math.max(100, boardWidth.value);
  boardHeight.value = Math.max(100, boardHeight.value);
  viewBox.value = `0 0 ${boardWidth.value} ${boardHeight.value}`;
}

defineExpose({
  importSVG,
  downloadSVG,
  zoomIn,
  zoomOut,
  addTextField,
  addRectangle,
  addEllipse,
  toggleColor,
  textAlign,
  deleteItem,
});
</script>

<style>
html {
  font: 100%/1.5 Lato, Helvetica Neue, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  background-image: linear-gradient(#c5c7cb, #f8f9fa);
  min-height: 100%;
  text-align: center;
}

.colorpicker {
  top: 100px;
  position: absolute;
}

svg text {
  cursor: default;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

svg text::selection {
  background: none;
}

svg .ctrl-rect {
  fill: #ffffff;
  stroke: #222222;
  stroke-width: 1;
}

svg .ctrl-bounds {
  fill-opacity: 0;
  stroke: #222222;
  stroke-width: 1;
  stroke-linecap: round;
  stroke-dasharray: 2, 4;
}

.canvas svg {
  background: #fff;
}
</style>
