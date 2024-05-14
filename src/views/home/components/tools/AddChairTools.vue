<template>
  <v-list v-if="props.opened" id="seat-tools">
    <v-list-item @click="changeTool('row')"
      :class="tool == 'row' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">One Row</v-tooltip>
        <RowSingleIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('rows')"
      :class="tool == 'rows' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Multi Rows</v-tooltip>
        <RowMultiIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="changeTool('stgrows')"
      :class="tool == 'stgrows' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Multi Staggered
          Rows</v-tooltip>
        <RowStaggedIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="changeTool('gaSquare')"
      :class="tool == 'gaSquare' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">GA Square</v-tooltip>
        <GaSquareIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="changeTool('gaCircle')"
      :class="tool == 'gaCircle' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">GA Circle</v-tooltip>
        <GaCircleIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="changeTool('gaPolygon')"
      :class="tool == 'gaPolygon' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">GA Polygon</v-tooltip>
        <GaPolyIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="changeTool('roundTable')"
      :class="tool == 'roundTable' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Round Table</v-tooltip>
        <TableRoundIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="changeTool('rectangleTable')"
      :class="tool == 'rectangleTable' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Rectangle Table</v-tooltip>
        <TableRectIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="changeTool('focusPoint')"
      :class="tool == 'focusPoint' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Focus point</v-tooltip>
        <FocusPointIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>

  </v-list>
</template>

<script setup>
import { defineProps, computed, ref } from "vue";

import RowSingleIcon from "@/assets/svgs/menuIcons/RowSingleIcon.vue";
import RowMultiIcon from "@/assets/svgs/menuIcons/RowMultiIcon.vue";
import RowStaggedIcon from "@/assets/svgs/menuIcons/RowStaggedIcon.vue";
import GaSquareIcon from "@/assets/svgs/menuIcons/GaSquareIcon.vue";
import TableRoundIcon from "@/assets/svgs/menuIcons/TableRoundIcon.vue";
import TableRectIcon from "@/assets/svgs/menuIcons/TableRectIcon.vue";
import GaCircleIcon from "@/assets/svgs/menuIcons/GaCircleIcon.vue";
import GaPolyIcon from "@/assets/svgs/menuIcons/GaPolyIcon.vue";
import FocusPointIcon from "@/assets/svgs/menuIcons/FocusPointIcon.vue";

import { useMainStore } from "@/stores";
const store = useMainStore();
const onClick = () => alert("Not set yet");

const props = defineProps({
  opened: Boolean,
});

const tool = ref(computed(() => store.tool));

const changeTool = (tool) => store.changeTool(tool);
</script>

<style>
.arrow-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#seat-tools {
  position: absolute;
  width: 60px;
  left: 70px;
  top: 60px;
  /* background-color: #f3f3f3; */
  border-radius: 10px;
  box-shadow: 0px 5px 5px -3px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
    0px 8px 10px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
    0px 3px 14px 2px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
  transition: all 1s;
  z-index: 99;
}

.current-tool {
  background-color: #c5cede;
}
</style>
