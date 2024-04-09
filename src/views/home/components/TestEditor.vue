<template>
  <div class="demo-container">
    <!-- <div class="colorpicker" v-show="showcolors">
      <Sketch v-model="colors" @change-color="onChange" />
    </div> -->

    <v-file-input
      id="custom-file-input"
      label="Upload your svg file"
      prepend-icon="mdi-svg"
      variant="filled"
      type="file"
      accept=".svg"
      @change="importSVG"
      style="display: none"
    ></v-file-input>
    <div class="canvas" @mouseup="onHandUp">
      <svg style="width: 100%; height: 100%" ref="svgBoard" id="mysvg">
        <g
          @mousemove="onMouseMove($event)"
          @mouseup="onMouseUp($event)"
          @mousedown="onMouseDown($event)"
          @click="onClickItem($event, {})"
          :width="boardWidth"
          :height="boardHeight"
          :viewBox="viewBox"
          :transform="newTransform"
        >
          <rect :width="boardWidth" :height="boardHeight" fill="white"></rect>
          <g
            v-for="item in items"
            :transform="'translate(' + item.x + ', ' + item.y + ')'"
            :key="item"
          >
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
        </g>
      </svg>
    </div>

    <div style="position: fixed; bottom: 0">
      <div
        v-if="activeItem !== -1"
        style="display: flex; justify-content: center"
      >
        <v-text-field
          label="Name"
          type="text"
          v-model="items[activeItem].name"
          placeholder="Circle Name"
          density="compact"
          style="width: 200px"
        />
        <v-text-field
          label="Id"
          type="text"
          v-model.number="items[activeItem].id"
          placeholder="Radius"
          density="compact"
          style="width: 200px"
        />
        <v-text-field
          label="Color"
          type="color"
          v-model="items[activeItem].color"
          density="compact"
          style="width: 100px"
        />
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
  computed,
} from "vue";
import { saveAs } from "file-saver";
import { useSvgStore, useBoardStore } from "../../../stores/svgStore";
const svgStore = useSvgStore();
const boardStore = useBoardStore();

const svgBoard = ref(null);
const boardName = ref("My SVG Board");
const scale = ref(computed(() => svgStore.magnifier_init));
const hand_selected = ref(computed(() => boardStore.hand_selected));
const boardWidth = ref(computed(() => boardStore.width));
const boardHeight = ref(computed(() => boardStore.height));
const activeItem = ref(-1);
const newTransform = ref("scale(" + svgStore.magnifier_init + ")");
const PaddingTop = ref(
  (window.innerWidth - 300 - 17 - boardWidth.value * scale.value) / 2
);
const PaddingLeft = ref(
  (window.innerHeight - 50 - boardHeight.value * scale.value) / 2
);
const handposition = ref({
  x: 0,
  y: 0,
  sx: PaddingTop.value,
  sy: PaddingLeft.value,
  active: false,
});
const handdx = ref(0);
const handdy = ref(0);
// const onHand = () => boardStore.set_hand_false();

// import Sketch from "vue-color/src/components/Sketch.vue";

let items = ref([]);
let colors = reactive({ hex: "#999999", a: 1 });
// const showColors = ref(false);
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

const viewBox = ref(`0 0 ${boardWidth.value} ${boardHeight.value}`);

watch(
  [boardWidth, boardHeight],
  () => {
    viewBox.value = `0 0 ${boardWidth.value} ${boardHeight.value}`;
    const Fullwidth = window.innerWidth - 300 - 17;
    const FullHeight = window.innerHeight - 50;
    PaddingTop.value = (FullHeight - boardHeight.value * scale.value) / 2;
    PaddingLeft.value = (Fullwidth - boardWidth.value * scale.value) / 2;
    newTransform.value =
      "translate(" +
      PaddingTop.value +
      ", " +
      PaddingLeft.value +
      ") scale(" +
      scale.value +
      ")";
    updateViewBox();
  },
  { immediate: true }
);

watch(
  [scale],
  () => {
    console.log("before", PaddingLeft.value, PaddingTop.value);
    PaddingLeft.value = PaddingLeft.value / scale.value;
    PaddingTop.value = PaddingTop.value / scale.value;
    newTransform.value =
      "translate(" +
      PaddingTop.value +
      ", " +
      PaddingLeft.value +
      ") scale(" +
      scale.value +
      ")";
    console.log(
      "after",
      newTransform.value,
      PaddingLeft.value,
      PaddingTop.value
    );
  },
  { immediate: true }
);

watch(
  [handdx, handdy],
  () => {
    PaddingLeft.value = handposition.value.sy + handdy.value;
    PaddingTop.value = handposition.value.sx + handdx.value;
    newTransform.value =
      "translate(" +
      PaddingTop.value +
      ", " +
      PaddingLeft.value +
      ") scale(" +
      scale.value +
      ")";
    console.log("HERE", PaddingLeft.value, PaddingTop.value);
  },
  { immediate: true }
);

function updateViewBox() {
  const newWidth = boardWidth.value * scale.value;
  const newHeight = boardHeight.value * scale.value;
  // console.log("HERE", scale.value, newWidth, newHeight);
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

const onImportClick = () => {
  const temp = document.getElementById("custom-file-input");
  temp.click();
  console.log(temp);
};

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

// const toggleColor = () => {
//   showColors.value = !showColors.value;
// };

const onMouseDown = (event) => {
  if (hand_selected.value) {
    handposition.value = {
      x: event.clientX,
      y: event.clientY,
      sx: PaddingTop.value,
      sy: PaddingLeft.value,
      active: true,
    };
    console.log("UAK", event, handposition.value);
  }
};

function onClickItem(event, item) {
  event.stopPropagation(); //prevent parent from firing

  if (item.active) {
    return;
  }

  if (item.id) {
    activeItem.value = item.id - 1;
    //   console.log(
    //     item.id - 1,
    //     items.value[item.id - 1],
    //     "+++",
    //     items.value[item.id - 1].color
    //   );
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
    console.log(event, item);
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
  console.log("Up", event, element, handposition.value);
  // onHand();
  movetarget.value = null;
  console.log("MU", PaddingLeft.value, PaddingTop.value);
}

function onHandUp() {
  console.log("!!!!!");
  handposition.value = {
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
    active: false,
  };
  console.log("MU2", PaddingLeft.value, PaddingTop.value);
}

function onMouseMove(event) {
  if (hand_selected.value && handposition.value.active) {
    const tempX = event.clientX;
    const tempY = event.clientY;
    handdx.value = tempX - handposition.value.x;
    handdy.value = tempY - handposition.value.y;
    console.log("MOVE", handdx.value, handdy.value);
  } else {
    if (movetarget.value == null) return;

    var item = movetarget.value;
    var t = tools;
    // console.log("MouseMove", item);
    if (item.active && item.drag != undefined) {
      if (item.drag.type == "MOVE") {
        item.x = (event.x - item.drag.mx) / scale.value + item.drag.x;
        item.y = (event.y - item.drag.my) / scale.value + item.drag.y;
      }
      if (item.drag.type == "SCALE") {
        if (item.drag.handleID == "1") {
          // TL resize handler
          item.x = Math.min(
            (event.x - item.drag.mx) / scale.value + item.drag.x,
            item.drag.x + (item.drag.w - t.min_height)
          );
          item.y = Math.min(
            (event.y - item.drag.my) / scale.value + item.drag.y,
            item.drag.y + (item.drag.h - t.min_height)
          ); // with y constraint
          item.width = Math.max(
            item.drag.w + (item.drag.mx - event.x) / scale.value,
            t.min_height
          );
          item.height = Math.max(
            item.drag.h + (item.drag.my - event.y) / scale.value,
            t.min_height
          );
        }
        if (item.drag.handleID == "3") {
          // TR resize handler
          item.y = Math.min(
            (event.y - item.drag.my) / scale.value + item.drag.y,
            item.drag.y + (item.drag.h - t.min_height)
          ); // with y constraint
          item.width = Math.max(
            item.drag.w + (event.x - item.drag.mx) / scale.value,
            t.min_height
          );
          item.height = Math.max(
            item.drag.h + (item.drag.my - event.y) / scale.value,
            t.min_height
          );
        }
        if (item.drag.handleID == "7") {
          // BL
          item.x = Math.min(
            (event.x - item.drag.mx) / scale.value + item.drag.x,
            item.drag.x + (item.drag.w - t.min_height)
          );
          item.width = Math.max(
            item.drag.w + (item.drag.mx - event.x) / scale.value,
            t.min_height
          );
          item.height = Math.max(
            item.drag.h + (event.y - item.drag.my) / scale.value,
            t.min_height
          );
        }
        if (item.drag.handleID == "9") {
          // BR
          item.width = Math.max(
            item.drag.w + (event.x - item.drag.mx) / scale.value,
            t.min_height
          );
          item.height = Math.max(
            item.drag.h + (event.y - item.drag.my) / scale.value,
            t.min_height
          );
        }
      }
    }
  }
}

// const onChange = (val) => {
//   if (activeItemIndex.value !== null) {
//     items.value[activeItemIndex.value].color = val;
//   }
// };

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

defineExpose({
  importSVG,
  downloadSVG,
  addTextField,
  addRectangle,
  addEllipse,
  // toggleColor,
  textAlign,
  deleteItem,
  onImportClick,
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

.canvas {
  width: 100%;
  height: 99%;
  align-content: center;
}

.canvas svg {
  background: #f8f9fa;
}

.demo-container {
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  align-content: center;
}
</style>
