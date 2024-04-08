<template>
  <v-toolbar-items class="border-left">
    <v-btn class="btn" @click="$emit('addTextField')">
      <v-icon color="black" icon="mdi-cursor-default" size="large"></v-icon
    ></v-btn>
    <v-btn>
      <DirectSelectionArrowIcon width="20px" height="20px" />
    </v-btn>

    <v-btn>
      <CloneIcon width="20px" height="20px" />
    </v-btn>
    <v-btn class="btn" @click="$emit('addRectangle')"
      ><v-icon color="black" icon="mdi-restore" size="large"></v-icon
    ></v-btn>

    <v-btn>
      <HandRockIcon width="20px" height="20px" />
    </v-btn>
    <v-btn class="btn" @click="onDelete"
      ><v-icon color="black" icon="mdi-delete" size="large"></v-icon
    ></v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { defineProps } from "vue";
import CloneIcon from "@/assets/svgs/menuIcons/CloneIcon.vue";
import DirectSelectionArrowIcon from "@/assets/svgs/menuIcons/DirectSelectionArrowIcon.vue";
import HandRockIcon from "@/assets/svgs/menuIcons/HandRockIcon.vue";

const props = defineProps({
  removeItem: Function,
});

const onDelete = () => props.removeItem();
</script>
