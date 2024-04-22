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
          <select class="toolbox-input" @input="setRowNumbering">
            <option v-for="numbering in rowNumberings" :key="numbering"
              option-label="label" name="row_numbering"
              :value="numbering.id ? numbering.id : null">
              {{ numbering.label }}
            </option>
          </select>
        </v-col>
        <v-col cols="12" sm="6"> Start At </v-col>
        <v-col cols="12" sm="6">
          <input class="custom-small-text-field" type="number"
            name="row_numbering_start_at"
            :value="rowNumbering ? rowNumbering.startAt : null"
            @input="setRowNumberingStartAt" />
        </v-col>
        <v-col cols="12" sm="6"> Label Direction </v-col>
        <v-col cols="12" sm="6">
          <input type="checkbox"
            :value="rowNumbering ? rowNumbering.reversed : false"
            @change="setRowNumberingReversed" name="row_numbering_reversed" />
        </v-col>
        <!-- <v-col cols="12" sm="6"> Row Label Location </v-col>
        <v-col cols="12" sm="6"> -->
        <!-- <v-select :items="['Both', 'Right', 'Left']" density="compact">
          </v-select> -->

        <!-- <select class="toolbox-input" @input="rowLabelStatus">
            <option v-for="numbering in rowNumberings" :key="numbering"
              option-label="label" name="row_numbering"
              :value="numbering.id ? numbering.id : null">
              {{ numbering.label }}
            </option>
          </select>
        </v-col> -->
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
import { reverse, ROW_NUMBERINGS, SEAT_NUMBERINGS } from '@/lib/numbering';
import { useSeatFormatStore } from '@/stores/seatFormat';
import { usePlanStore } from '@/stores/plan';

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
      rowNumberings: ROW_NUMBERINGS
    }
  },
  props: {
    rows: Array
  },
  computed: {
    rowLabelStatus() {
      if (this.rowNumberPositionStart() && this.rowNumberPositionEnd()) return "Both";
      else if (this.rowNumberPositionStart()) return "Left";
      else if (this.rowNumberPositionEnd()) return "Right";
      return null;
    },
    rowNumbering() {
      for (let numbering of ROW_NUMBERINGS) {
        try {
          let guessedStartAt = numbering.findStartAt(this.rows[0].row_number)
          let guessedNumbers = numbering.compute(this.rows, guessedStartAt)
          if (this.rows.filter((r, idx) => r.row_number === guessedNumbers[idx]).length === this.rows.length) {
            return { scheme: numbering, reversed: false, startAt: guessedStartAt }
          }

          let rowsReversed = reverse(this.rows)
          let guessedStartAtRev = numbering.findStartAt(rowsReversed[0].row_number)
          let guessedNumbersRev = numbering.compute(rowsReversed, guessedStartAtRev)
          if (rowsReversed.filter((r, idx) => r.row_number === guessedNumbersRev[idx]).length === this.rows.length) {
            return { scheme: numbering, reversed: true, startAt: guessedStartAtRev }
          }
        } catch (e) {
          console.warn('Crash while trying to test row numbering schema', numbering, e)
        }
      }
      return undefined
    },
    rowNumberPositionStart() {
      return groupValue(this.rows, row => row.row_number_position === 'start' || row.row_number_position === 'both')
    },
    rowNumberPositionEnd() {
      return groupValue(this.rows, row => row.row_number_position === 'end' || row.row_number_position === 'both')
    },
  },
  methods: {
    handleChange(newValue) {
      // console.log(newValue)
    },
    setRowNumbering(val) {
      let numbering = ROW_NUMBERINGS.find(n => n.id === val.target.value);
      this.planstore.renumberRows(this.rows.map(r => r.uuid), numbering, 1, false)
    },
    setRowNumberingStartAt(e) {
      if (this.rowNumbering) {
        this.planstore.renumberRows(this.rows.map(r => r.uuid), this.rowNumbering.scheme, e.target.value, this.rowNumbering.reversed)
        // this.planstore.renumberRows(this.rows.map(r => r.uuid), this.rowNumbering.scheme, val, this.rowNumbering.reversed)
      }
    },
    setRowNumberingReversed(val) {
      console.log(val.target.value)
      if (this.seatNumbering) {
        this.planstore.renumberRows(this.rows.map(r => r.uuid), this.rowNumbering.scheme, this.rowNumbering.startAt, val.target.value)
      }
    },
  }
})
</script>