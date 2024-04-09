<template>
  <v-toolbar-items class="border-left">
    <v-btn>
      <SelectionArrowIcon width="20px" height="20px" />
    </v-btn>
    <v-btn>
      <DirectSelectionArrowIcon width="20px" height="20px" />
    </v-btn>
    <v-btn>
      <CloneIcon width="20px" height="20px" />
    </v-btn>
    <v-btn>
      <UndoIcon width="20px" height="20px" />
    </v-btn>
    <v-btn @click="onHand">
      <HandRockIcon v-if="hand_selected == true" width="20px" height="20px" />
      <HandIcon v-if="hand_selected == false" width="20px" height="20px" />
    </v-btn>
    <v-btn class="btn" @click="onDelete">
      <TrashIcon width="20px" height="20px"
    /></v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { defineProps, ref, computed } from "vue";
import CloneIcon from "@/assets/svgs/menuIcons/CloneIcon.vue";
import DirectSelectionArrowIcon from "@/assets/svgs/menuIcons/DirectSelectionArrowIcon.vue";
import HandRockIcon from "@/assets/svgs/menuIcons/HandRockIcon.vue";
import UndoIcon from "@/assets/svgs/menuIcons/UndoIcon.vue";
import TrashIcon from "@/assets/svgs/menuIcons/TrashIcon.vue";
import SelectionArrowIcon from "@/assets/svgs/menuIcons/SelectionArrowIcon.vue";
import HandIcon from "@/assets/svgs/menuIcons/HandIcon.vue";

import { useBoardStore } from "@/stores/svgStore";

const boardstore = useBoardStore();
const hand_selected = ref(computed(() => boardstore.hand_selected));

const props = defineProps({
  removeItem: Function,
});

const onDelete = () => props.removeItem();
const onHand = () => boardstore.set_hand();
</script>
