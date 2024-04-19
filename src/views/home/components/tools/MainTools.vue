<template>
  <v-toolbar-items class="border-left">
    <v-btn @click="changeTool('select')"
      :class="tool == 'select' ? 'current-tool' : ''">
      <v-tooltip activator="parent" location="bottom">Select</v-tooltip>
      <SelectionArrowIcon width="20px" height="20px" />
    </v-btn>
    <v-btn @click="changeTool('seatselect')"
      :class="tool == 'seatselect' ? 'current-tool' : ''">
      <v-tooltip activator="parent" location="bottom">Direct Select</v-tooltip>
      <DirectSelectionArrowIcon width="20px" height="20px" />
    </v-btn>
    <v-btn @click="changeTool('clip')"
      :class="tool == 'clip' ? 'current-tool' : ''">
      <v-tooltip activator="parent" location="bottom">Clip</v-tooltip>
      <CloneIcon width="20px" height="20px" />
    </v-btn>
    <v-btn @click="changeTool('redo')"
      :class="tool == 'redo' ? 'current-tool' : ''">
      <v-tooltip activator="parent" location="bottom">Undo</v-tooltip>
      <UndoIcon width="20px" height="20px" />
    </v-btn>
    <v-btn @click="changeTool('hand')"
      :class="tool == 'hand' ? 'current-tool' : ''">
      <v-tooltip activator="parent" location="bottom">Hand</v-tooltip>
      <HandIcon width="20px" height="20px" />
    </v-btn>
    <v-btn class="btn" @click.prevent="deleteObjects">
      <v-tooltip activator="parent" location="bottom">Delete</v-tooltip>
      <TrashIcon width="20px" height="20px" />
    </v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { defineProps, ref, computed, onMounted, onUnmounted } from "vue";
import CloneIcon from "@/assets/svgs/menuIcons/CloneIcon.vue";
import DirectSelectionArrowIcon from "@/assets/svgs/menuIcons/DirectSelectionArrowIcon.vue";
import UndoIcon from "@/assets/svgs/menuIcons/UndoIcon.vue";
import TrashIcon from "@/assets/svgs/menuIcons/TrashIcon.vue";
import SelectionArrowIcon from "@/assets/svgs/menuIcons/SelectionArrowIcon.vue";
import HandIcon from "@/assets/svgs/menuIcons/HandIcon.vue";

import { useMainStore } from "@/stores";

const store = useMainStore();
const tool = ref(computed(() => store.tool));
const changeTool = (tool) => store.changeTool(tool);

import { useBoardStore } from "@/stores/svgStore";
import { usePlanStore } from "@/stores/plan";

const boardstore = useBoardStore();
const hand_selected = ref(computed(() => boardstore.hand_selected));
const select_selected = ref(computed(() => boardstore.select_selected));
const dselect_selected = ref(computed(() => boardstore.dselect_selected));

const props = defineProps({
  removeItem: Function,
});

const onDelete = () => props.removeItem();
const selection = computed(() => store.selection());

const deleteObjects = () => usePlanStore().deleteObjects(selection);
const set_all_false = () => {
  boardstore.select_toggle(false);
  boardstore.dselect_toggle(false);
  boardstore.set_hand_false();
};
const onHand = () => {
  set_all_false();
  boardstore.set_hand();
};
const onSelect = () => {
  set_all_false();
  boardstore.select_toggle(true);
};

const onDselect = () => {
  set_all_false();
  boardstore.dselect_toggle(true);
};

const item_selected = {
  background: "#d5d5d5b0",
};

function onEscPress(event) {
  if (event.key === "Escape") {
    set_all_false();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onEscPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onEscPress);
});
</script>

<style></style>
