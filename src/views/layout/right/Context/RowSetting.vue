<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Row</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Number of seats </v-col>
        <v-col cols="12" sm="6">
          <input class="custom-small-text-field v-custom-input" type="number"
            min="1" name="number_seats" :value="numberSeats"
            @input="setNumberSeats" />
          <!-- <v-btn @click="addSeat">Add Seat</v-btn> -->
        </v-col>
        <v-col cols="12" sm="6"> Curve </v-col>
        <v-col cols="12" sm="6">
          <!-- <v-text-field class="custom-small-text-field" variant="outlined"
            type="number" density="compact"></v-text-field> -->
          <input class="custom-small-text-field v-custom-input" type="number"
            name="row_spacing" @input="setCurve" min="-30" max="30" />
        </v-col>
        <v-col cols="12" sm="6"> Seats spacing </v-col>
        <v-col cols="12" sm="6">
          <input class="custom-small-text-field v-custom-input" type="number"
            min="1" name="row_spacing" :value="seatSpacing"
            @input="setSeatSpacing" />
        </v-col>

        <!-- <v-col cols="12" sm="6">
          <v-text-field class="custom-small-text-field" variant="outlined"
            type="number" density="compact" name="row_spacing"
            :value="seatSpacing" @input="setSeatSpacing"></v-text-field>
        </v-col> -->
      </v-row>
    </v-container>
  </div>
</template>

<style>
.v-custom-input {
  width: 100%;
  padding: 6px 10px;
  margin: 8px 0;
  box-sizing: border-box;
  border-radius: 5px;
  border: 1px solid light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
  border-radius: 5px;
}

.v-custom-input:focus {
  outline: 3px solid #bae0ff;
}

.v-col-sm-6 {
  padding: 5px;
}
</style>

<script>
import { defineComponent, computed, ref } from 'vue';
import { useSeatFormatStore } from '@/stores/seatFormat';
import { usePlanStore } from '@/stores/plan';
import { useMainStore } from '@/stores';
import { flatGroup } from 'd3';
// import NumberInput from '../../home/components/NumberInput.vue';
const round = (fl, places) => Number(fl.toFixed(places ? places : 0))

const shallowEqual = (object1, object2) => {
  if (object1 === null || object2 === null || typeof object1 !== "object" || typeof object2 !== "object") {
    return object1 === object2
  }
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false
    }
  }
  return true
}

const groupValue = (rows, mapper) => {
  let lastFound = undefined
  for (let row of rows) {
    let val = mapper(row)
    if (lastFound === undefined) {
      lastFound = val
    } else if (!shallowEqual(lastFound, val)) {
      return undefined
    }
  }
  return lastFound
}

export default defineComponent({
  data() {
    return {
      testInput: 20
    }
  },
  setup() {
    const seatStore = useSeatFormatStore();
    const nseat = computed(() => seatStore.nseat);
    const setNseat = seatStore.setNseat;
    const planStore = usePlanStore();
    const store = useMainStore();


    return {
      nseat,
      planStore,
      setNseat,
      store
    };
  },
  props: {
    rows: Array
  },
  methods: {
    onChange(e) {
      this.testInput = e.target.value;
    },

    setCurve(val) {
      const value = parseInt(val.target.value * 10);
      this.store.curveRows(value);
    },

    handle_seat_num_changed(e) {
      this.setNseat(e.target.value);
      // console.log('okay', this.rows[0].shape)
      this.planStore.renumberCircleSeats(this.rows.map(i => i.uuid), e.target.value);
    },
    setRowSpacing(e) {
      this.planStore.respaceRows(this.rows.map(r => r.uuid), e.target.value)
    },
    setSeatSpacing(e) {
      this.planStore.respaceSeats(this.rows.map(r => r.uuid), e.target.value)
    },
    setNumberSeats(e) {
      if (e.target.value > 0) {
        this.planStore.changeNumberSeats(this.rows.map(r => r.uuid), e.target.value)
      }
    },
    addSeat() {
      this.planStore.addSeat(this.rows.map(r => r.uuid));
    }
  },
  computed: {
    numberSeats() {
      return groupValue(this.rows, row => {
        return row.seats.length;
      })
    },
    seatSpacing() {
      return Math.floor(groupValue(this.rows, row => {
        let minSpace = null;
        for (let si = 1; si < row.seats.length; si++) {
          let space = round(Math.sqrt(
            Math.pow(row.seats[si].position.x - row.seats[si - 1].position.x, 2) +
            Math.pow(row.seats[si].position.y - row.seats[si - 1].position.y, 2)
          ), 2);
          if (minSpace === null || space < minSpace) {
            minSpace = space;
          }
        }
        return minSpace ? minSpace : 25;
      }));
    },

    rowSpacing() {
      let allSpace = null;
      for (let ri = 0; ri < this.rows.length - 1; ri++) {
        let row = this.rows[ri];
        if (!row.seats.length) continue;

        let rowNormal = [
          -row.seats[row.seats.length - 1].position.y - row.seats[0].position.y,
          row.seats[row.seats.length - 1].position.x + row.seats[0].position.x,
        ];
        rowNormal = [
          rowNormal[0] / Math.sqrt(Math.pow(rowNormal[0], 2) + Math.pow(rowNormal[1], 2)),
          rowNormal[1] / Math.sqrt(Math.pow(rowNormal[0], 2) + Math.pow(rowNormal[1], 2))
        ];

        let rowDist = [
          this.rows[ri + 1].position.x - row.position.x,
          this.rows[ri + 1].position.y - row.position.y,
        ];

        let rowDistProjectedOnRowNormal = [
          (rowNormal[0] * rowDist[0] + rowNormal[1] * rowDist[1]) * rowNormal[0],
          (rowNormal[0] * rowDist[0] + rowNormal[1] * rowDist[1]) * rowNormal[1],
        ];

        let space = round(Math.sqrt(
          Math.pow(rowDistProjectedOnRowNormal[0], 2) + Math.pow(rowDistProjectedOnRowNormal[1], 2)
        ), 2);

        if (allSpace === null) {
          allSpace = space;
        } else if (allSpace !== space) {
          allSpace = undefined;
        }
      }
      return allSpace;
    }

  }
});
</script>