import { defineStore } from 'pinia';

export const useSeatFormatStore = defineStore('seatformat', {
  state: () => ({
    rowsLabel: ['1, 2, 3, …', 'A, B, C, …', 'a, b, c, …'],
    rowCur: 1,
    seatsLabel: ['1, 2, 3, …', 'A, B, C, …', 'a, b, c, …'],
    seatCur: 0,
    nseat: 6,
  }),
  actions: {
    changeRow(cur) {
      this.rowCur = cur;
    },
    changeSeat(cur) {
      this.seatCur = cur;
    },
    setNseat(seat) {
      this.nseat = seat;
    }
  },
});