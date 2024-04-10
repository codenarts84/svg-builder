<template>
  <v-list v-if="props.opened" id="seat-tools">
    <v-list-item @click="onClick">
      <v-list-item-title>
        <RowSingleIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onClick">
      <v-list-item-title>
        <RowMultiIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onClick">
      <v-list-item-title>
        <RowStaggedIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onClick">
      <v-list-item-title>
        <GaSquareIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onClick">
      <v-list-item-title>
        <GaCircleIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onClick">
      <v-list-item-title>
        <TableRoundIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onClick">
      <v-list-item-title>
        <TableRectIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { defineProps } from "vue";

import RowSingleIcon from "@/assets/svgs/menuIcons/RowSingleIcon.vue";
import RowMultiIcon from "@/assets/svgs/menuIcons/RowMultiIcon.vue";
import RowStaggedIcon from "@/assets/svgs/menuIcons/RowStaggedIcon.vue";
import GaSquareIcon from "@/assets/svgs/menuIcons/GaSquareIcon.vue";
import TableRoundIcon from "@/assets/svgs/menuIcons/TableRoundIcon.vue";
import TableRectIcon from "@/assets/svgs/menuIcons/TableRectIcon.vue";
import GaCircleIcon from "@/assets/svgs/menuIcons/GaCircleIcon.vue";

const onClick = () => alert("Not set yet");

const props = defineProps({
  opened: Boolean,
});
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
  top: 10px;
  /* background-color: #f3f3f3; */
  border-radius: 10px;
  box-shadow: 0px 5px 5px -3px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
    0px 8px 10px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
    0px 3px 14px 2px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
  transition: all 1s;
}
</style>
