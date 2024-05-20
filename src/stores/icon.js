import { defineStore } from "pinia";
import { ref } from "vue";

export const useIconStore = defineStore("iconStore", () => {
  const selectedIcon = ref(null);
  const icons = ref([]);

  const selectIcon = (icon) => {
    selectedIcon.value = icon;
  };

  const placeIcon = (icon) => {
    icons.value.push(icon);
    persistIcon();
  };

  const resetSelectedIcon = () => {
    selectedIcon.value = null;
  };

  const persistIcon = (skipHistory = false) => {
    const ics = JSON.stringify(icons.value);
    localStorage.setItem("frontrow2.editor.icon", ics);
  };

  const loadIcon = (ic) => {
    icons.value = ic;
    persistIcon();
  };

  return {
    selectedIcon,
    icons,
    selectIcon,
    placeIcon,
    resetSelectedIcon,
    persistIcon,
    loadIcon,
  };
});
