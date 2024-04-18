<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Row Labeling</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Row label </v-col>
        <v-col cols="12" sm="6">
          <!-- <v-combobox v-model="selectedItem" :items="rowsLabel" label="Select..."
            @change="handleChange">
          </v-combobox> -->
          <!-- <v-btn @click="changeRow(0)">{{ rowsLabel[0] }}</v-btn>
          <v-btn @click="changeRow(1)">{{ rowsLabel[1] }}</v-btn>
          <v-btn @click="changeRow(2)">{{ rowsLabel[2] }}</v-btn> -->
          <select class="toolbox-input" @input="setSeatNumbering($event)">
            <option v-for="numbering in seatNumberings" :key="numbering"
              option-label="label" name="seat_numbering"
              :value="numbering.id ? numbering.id : null">
              {{ numbering.label }}
            </option>
          </select>
        </v-col>
        <v-col cols="12" sm="6"> Row Label Location </v-col>
        <v-col cols="12" sm="6">
          <v-select :items="['Both', 'Right', 'Left']" density="compact">
          </v-select>
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
import { SEAT_NUMBERINGS } from '@/lib/numbering';
import { useSeatFormatStore } from '@/stores/seatFormat';
import { usePlanStore } from '@/stores/plan';

export default ({
  setup() {
    const seatStore = useSeatFormatStore();
    const planstore = usePlanStore();
    return {
      // rowsLabel: seatStore.rowsLabel,
      // changeRow: seatStore.changeRow,
      planstore
    }
  },
  data() {
    return {
      // selectedItem: this.rowsLabel[0]
      seatNumberings: SEAT_NUMBERINGS
    }
  },
  props: {
    rows: Array
  },
  methods: {
    handleChange(newValue) {
      console.log(newValue)
    },
    setSeatNumbering(val) {
      let numbering = SEAT_NUMBERINGS.find(n => n.id === val.target.value);
      this.planstore.renumberSeats(this.rows.map(r => r.uuid), numbering, 1, false)
    }
  }
})
</script>