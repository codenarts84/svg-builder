<template>
  <v-list v-if="props.opened" id="item-tools">
    <v-list-item @click="changeTool('text')"
      :class="tool == 'text' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Text</v-tooltip>
        <v-icon color="black" icon="mdi-pen-plus" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('rectangle')"
      :class="tool == 'rectangle' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Rectangle</v-tooltip>
        <v-icon color="black" icon="mdi-shape-rectangle-plus"
          size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('circle')"
      :class="tool == 'circle' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Circle</v-tooltip>

        <v-icon color="black" icon="mdi-shape-circle-plus" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('ellipse')"
      :class="tool == 'ellipse' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Ellipse</v-tooltip>

        <v-icon color="black" icon="mdi-ellipse-outline" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('polygon')"
      :class="tool == 'polygon' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Polygon</v-tooltip>

        <v-icon color="black" icon="mdi-shape-polygon-plus" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { defineProps, ref, computed } from "vue";
import { useMainStore } from "@/stores";
const props = defineProps({
  // addRectangle: Function,
  // addEllipse: Function,
  // addTextField: Function,
  // onImportClick: Function,
  opened: Boolean,
});
// const onAddRectangle = () => props.addRectangle();
// const onAddEllipse = () => props.addEllipse();
// const onAddTextField = () => props.addTextField();

const store = useMainStore();
const tool = ref(computed(() => store.tool));

const changeTool = (tool) => store.changeTool(tool);
</script>
<style>
#item-tools {
  position: absolute;
  width: 60px;
  left: 70px;
  top: 115px;
  border-radius: 10px;
  box-shadow: 0px 5px 5px -3px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
    0px 8px 10px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
    0px 3px 14px 2px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
  transition: all 1s;
  z-index: 99;
}
</style>
