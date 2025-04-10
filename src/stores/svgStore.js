import { defineStore } from "pinia";
import { ref } from "vue";

export const useSvgStore = defineStore("svgStore", () => {
  const magnifier_init = ref(1);
  const zoom_up = () => {
    magnifier_init.value += 0.1;
  };
  function zoom_in() {
    magnifier_init.value -= 0.1;
  }

  const init_zoom = () => (magnifier_init.value = 1);
  const set_zoom = (v) => (magnifier_init.value = v);

  return { magnifier_init, zoom_up, zoom_in, init_zoom, set_zoom };
});

export const useBoardStore = defineStore("myboard", () => {
  const board_name = ref("My Charting Board");
  const width = ref(800);
  const height = ref(550);
  const hand_selected = ref(false);
  const select_selected = ref(false);
  const dselect_selected = ref(true);
  const grid = ref(false);

  const set_name = (new_name) => (board_name.value = new_name);
  const set_width = (v) => (width.value = v);
  const set_height = (v) => (height.value = v);
  const set_hand = () => (hand_selected.value = !hand_selected.value);
  const set_hand_false = () => (hand_selected.value = false);
  const grid_toggle = () => (grid.value = !grid.value);
  const select_toggle = (v) => (select_selected.value = v);
  const dselect_toggle = (v) => (dselect_selected.value = v);

  return {
    board_name,
    width,
    height,
    set_name,
    set_height,
    set_width,
    hand_selected,
    set_hand,
    set_hand_false,
    grid,
    grid_toggle,
    select_selected,
    dselect_selected,
    select_toggle,
    dselect_toggle,
  };
});
