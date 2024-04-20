<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Seat Labeling</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Seat label </v-col>
        <v-col cols="12" sm="6">
          <!-- <v-text-field
            class="custom-small-text-field"
            variant="outlined"
            type="text"
            density="compact"
          ></v-text-field> -->
          <!-- <v-select v-model="curRow" @change="changeRow"
            :items="rowsLabel"></v-select> -->
          <!-- <v-btn @click="changeSeat(0)">{{ seatsLabel[0] }}</v-btn>
          <v-btn @click="changeSeat(1)">{{ seatsLabel[1] }}</v-btn>
          <v-btn @click="changeSeat(2)">{{ seatsLabel[2] }}</v-btn> -->
          <select class="toolbox-input" @input="setSeatNumbering($event)">
            <option v-for="numbering in seatNumberings" :key="numbering"
              option-label="label" name="seat_numbering"
              :value="numbering.id ? numbering.id : null">
              {{ numbering.label }}
            </option>
          </select>
        </v-col>
        <v-col cols="12" sm="6"> Seat Label Location </v-col>
        <v-col cols="12" sm="6">
          <v-select :items="['Both', 'Right', 'Left']"
            density="compact"></v-select>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style>
.v-input__details {
  display: none;
}

.v-col-sm-6 {
  padding: 5px;
}
</style>

<script>
import { useSeatFormatStore } from '@/stores/seatFormat';
import { usePlanStore } from '@/stores/plan';
import { SEAT_NUMBERINGS } from '@/lib/numbering';
import { tickStep } from 'd3';

export default ({
  setup() {
    const seatStore = useSeatFormatStore();
    const planStore = usePlanStore();
    return {
      seatsLabel: seatStore.seatsLabel,
      changeSeat: seatStore.changeSeat,
      planStore,
    }
  },
  data() {
    return {
      // cur: null
      seatNumberings: SEAT_NUMBERINGS
    }
  },

  props: {
    rows: Array
  },

  methods: {
    setSeatNumbering(val) {
      // let numbering = SEAT_NUMBERINGS.find(n => n.id === val.target.value);
      // this.planStore.modifyRows(this.rows.map(r => r.uuid), numbering, 1, false);

      let numbering = SEAT_NUMBERINGS.find(n => n.id === val.target.value)
      this.planStore.renumberSeats(this.rows.map(r => r.uuid), numbering, 1, false);
    }
  }
})
</script>