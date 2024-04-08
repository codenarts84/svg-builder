import { defineStore } from "pinia";
import { ref } from "vue";

export const useSvgStore = defineStore("svgStore", () => {
  const magnifier_init = ref(1);
  const zoom_up = () => {
    console.log("zoom_up");
    magnifier_init.value += 0.1;
  };
  function zoom_in() {
    console.log(magnifier_init.value);
    magnifier_init.value -= 0.1;
  }

  return { magnifier_init, zoom_up, zoom_in };
});

export const useBoardStore = defineStore("myboard", () => {
  const board_name = ref("My Board");
  const width = ref(800);
  const height = ref(550);

  const set_name = (new_name) => (board_name.value = new_name);
  const set_width = (v) => (width.value = v);
  const set_height = (v) => (height.value = v);

  return { board_name, width, height, set_name, set_height, set_width };
});
