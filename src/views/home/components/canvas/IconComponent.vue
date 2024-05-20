<template>
  <g class="icons">
    <g v-for=" (icon, index) in icons" :key="index" class="svg-icon"
      :transform="icon.transform" @mousedown="selectIcon(icon)">
      <image :href="icon.path" />
    </g>
  </g>
</template>

<script setup>
import { ref } from "vue";
import { useIconStore } from "@/stores/icon";
const iconStore = useIconStore();
const selectedIcon = ref(iconStore.selectedIcon);
const icons = ref(iconStore.icons)

const placeIcon = event => {
  if (!selectedIcon.value) return;
  const { offsetX, offsetY } = event;
  iconStore.placeIcon({
    path: selectedIcon.value.path,
    transform: `translate(${offsetX}, ${offsetY})`,
    rotation: 0,
    scale: 1
  })
  iconStore.resetSelectedIcon();
  document.body.style.cursor = 'default';
}

const selectIcon = icon => {
  console.log('ahah')
}
</script>