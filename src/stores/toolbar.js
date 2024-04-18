import { defineStore } from 'pinia';

export const useToolbarStore = defineStore('toolbarstore', {
  state: () => ({
    bSnap2Grid: false
  }),
  actions: {
    changeSnap2Grid() {
      this.bSnap2Grid = !this.bSnap2Grid;
    }
  },
});
