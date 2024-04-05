import { defineStore } from 'pinia';

export const useSvgStore = defineStore('svgStore', {
  state: () => ({
    svgContent: '<svg></svg>', // Default SVG content
  }),
  actions: {
    updateSvgContent(newContent) {
      this.svgContent = newContent;
    },
  },
});
