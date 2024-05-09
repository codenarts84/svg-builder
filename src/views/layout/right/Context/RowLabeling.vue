<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Row Labeling</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Row label </v-col>
        <v-col cols="12" sm="6">
          <select class="toolbox-input v-custom-input" @input="setRowNumbering"
            :value="rowNumbering ? rowNumbering.scheme.id : null">
            <option v-for="numbering in rowNumberings" :key="numbering"
              option-label="label" name="row_numbering"
              :value="numbering.id ? numbering.id : null">
              {{ numbering.label }}
            </option>
          </select>
        </v-col>
        <v-col cols="12" sm="6"> Start At </v-col>
        <v-col cols="12" sm="6">
          <input class="custom-small-text-field v-custom-input"
            name="row_numbering_start_at"
            :value="rowNumbering ? rowNumbering.start : null"
            @input="setRowNumberingStartAt" />
        </v-col>
        <v-col cols="12" sm="6"> Label Direction </v-col>
        <v-col cols="12" sm="6">
          <!-- <select class="v-custom-input" @input="setRowNumberingReversed"
            :value="rowNumbering ? rowNumbering.reversed : false">
            <option v-for="label in labelDirection" :value="label.value"
              :key="label">
              {{ label.text }}
            </option>
          </select> -->
          <select class="v-custom-input" @input="setRowNumberingReversed"
            :value="rowNumbering ? rowNumbering.reversed : false">
            <option v-for="label in labelDirection" :value="label.value"
              :key="label">
              {{ label.text }}
            </option>
          </select>
        </v-col>

        <v-col cols="12" sm="6"> Row Label Location </v-col>
        <v-col cols="12" sm="6">
          <select class="toolbox-input v-custom-input"
            @input="handleLabelLocation" :value="labelLocation">
            <option v-for="op in labelDisplay" :key="op" :value="op.value">
              {{ op.text }}
            </option>
          </select>
        </v-col>

        <v-col cols="12" sm="6"> Skip Rows </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" :value="skip" @input="setSkip" />
        </v-col>

        <v-col cols="12" sm="6"> Rotate Label with Element </v-col>
        <v-col cols="12" sm="6">
          <input type="checkbox" :checked="rotate" @change="handle_rotate" />
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
import { ref, computed } from 'vue'
import { letterCounter, reverse, ROW_NUMBERINGS, SEAT_NUMBERINGS } from '@/lib/numbering';
import { useSeatFormatStore } from '@/stores/seatFormat';
import { usePlanStore } from '@/stores/plan';
import { useMainStore } from '@/stores/index';

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
    const mainStore = useMainStore();
    return {
      // rowsLabel: seatStore.rowsLabel,
      // changeRow: seatStore.changeRow,
      planstore,
      mainStore,
    }
  },
  data() {
    const labelDirection = [{
      text: 'Ascending', value: false
    }, {
      text: 'Descending', value: true
    }];
    const labelDisplay = [{
      text: 'None', value: 0, left: false, right: false,
    }, {
      text: 'Left', value: 1, left: true, right: false,
    }, {
      text: 'Right', value: 2, left: false, right: true,
    }, {
      text: 'Both', value: 3, left: true, right: true,
    }];
    return {
      // selectedItem: this.rowsLabel[0]
      rowNumberings: ROW_NUMBERINGS,
      labelDirection,
      labelDisplay,
    }
  },
  props: {
    rows: Array
  },
  computed: {
    skip() {
      return groupValue(this.rows, row => row.skip)
    },
    rotate() {
      return groupValue(this.rows, row => row.rotate_label);
    },
    labelLocation() {
      if (this.rowNumberPositionStart && this.rowNumberPositionEnd) return 3;
      else if (this.rowNumberPositionStart) return 1;
      else if (this.rowNumberPositionEnd) return 2;
      else return 0;
    },
    rowLabel() {
      return groupValue(this.rows, row => (row.row_label || ''))
    },
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
          console.log(guessedNumbers)
          if (this.rows.filter((r, idx) => r.row_number === guessedNumbers[idx]).length === this.rows.length) {
            let start = ''
            if (numbering.id === 'alpha') start = letterCounter(guessedStartAt, 'A')
            else if (numbering.id === 'alphalower') start = letterCounter(guessedStartAt, 'a')
            else if (numbering.id === 'odd') start = (guessedStartAt - 1) * 2;
            else if (numbering.id === 'even') start = (guessedNumbers - 1) * 2;
            else start = guessedStartAt
            return { scheme: numbering, reversed: false, startAt: guessedStartAt, start }
          }

          let rowsReversed = reverse(this.rows)
          let guessedStartAtRev = numbering.findStartAt(rowsReversed[0].row_number)
          let guessedNumbersRev = numbering.compute(rowsReversed, guessedStartAtRev)
          if (rowsReversed.filter((r, idx) => r.row_number === guessedNumbersRev[idx]).length === this.rows.length) {
            let start = ''
            if (numbering.id === 'alpha') start = letterCounter(guessedStartAt, 'A')
            else if (numbering.id === 'alphalower') start = letterCounter(guessedStartAt, 'a')
            else if (numbering.id === 'odd') start = (guessedStartAt - 1) * 2;
            else if (numbering.id === 'even') start = (guessedStartAt - 1) * 2;
            else start = guessedStartAt
            return { scheme: numbering, reversed: true, startAt: guessedStartAtRev, start }
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
    seatNumbering() {
      return groupValue(this.rows, row => {
        for (let numbering of SEAT_NUMBERINGS) {
          try {
            let guessedStartAt = numbering.findStartAt(row.seats[0].seat_number)
            let guessedNumbers = numbering.compute(row.seats, guessedStartAt)
            if (row.seats.filter((s, idx) => s.seat_number === guessedNumbers[idx]).length === row.seats.length) {
              return { scheme: numbering, reversed: false, startAt: guessedStartAt }
            }
            let seatsReversed = reverse(row.seats)
            let guessedStartAtRev = numbering.findStartAt(seatsReversed[0].seat_number)
            let guessedNumbersRev = numbering.compute(seatsReversed, guessedStartAtRev)
            if (seatsReversed.filter((s, idx) => s.seat_number === guessedNumbersRev[idx]).length === row.seats.length) {
              return { scheme: numbering, reversed: true, startAt: guessedStartAtRev }
            }
          } catch (e) {
            console.warn('Crash while trying to test seat numbering schema', numbering, e)
          }
        }
        return undefined
      })
      // skip ?
    },
  },
  methods: {
    handle_rotate(e) {
      this.planstore.setRotateLabel(this.rows.map(i => i.uuid), e.target.checked);
    },
    setSkip(val) {
      if (this.rowNumbering) {
        this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip: val.target.value })
        this.planstore.skipLetterRows(this.rows.map(r => r.uuid), this.rowNumbering.scheme, this.rowNumbering.startAt, this.rowNumbering.reversed, val.target.value);
      }
    },
    handleChange(newValue) {
      // console.log(newValue)
    },
    handleLabelLocation(e) {

      const val = this.labelDisplay.filter(i => i.value == e.target.value)[0];
      this.setRowNumberPositionStart(val.left);
      this.setRowNumberPositionEnd(val.right);

    },
    setLabelDirection(e) {

    },
    setRowNumbering(val) {
      let numbering = ROW_NUMBERINGS.find(n => n.id === val.target.value);
      this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip: '' })
      this.planstore.renumberRows(this.rows.map(r => r.uuid), numbering, 1, false)
    },
    setRowNumberingStartAt(e) {
      const id = this.rowNumbering.scheme.id;
      const input = e.target;
      const value = input.value;
      const validLetters = /^[a-zA-Z]+$/;
      const validNumbers = /^[0-9]+$/;

      if ((id === 'alpha' || id === 'alphalower') && !validLetters.test(e.target.value)) {
        input.value = value.replace(/[^a-zA-Z]/g, '');
      } else if ((id === 'natural' || id === 'even' || id === 'odd') && !validNumbers.test(e.target.value)) {
        input.value = value.replace(/[^0-9]/g, '');
      } else {
        const le = this.rowNumbering.scheme.findStartAt(input.value)
        this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip: '' })
        this.planstore.renumberRows(this.rows.map(r => r.uuid), this.rowNumbering.scheme, le, this.rowNumbering.reversed)
      }
    },
    setRowNumberingReversed(val) {
      const value = val.target.value === 'true';
      if (this.rowNumbering) {
        this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip: '' })
        this.planstore.renumberRows(this.rows.map(r => r.uuid), this.rowNumbering.scheme, this.rowNumbering.startAt, value)
      }
    },
    setRowNumberPositionStart(val) {
      if (this.rowNumberPositionEnd)
        this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), row_number_position: val ? 'both' : 'end' })
      else
        this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), row_number_position: val ? 'start' : null })
    },
    setRowNumberPositionEnd(val) {
      if (this.rowNumberPositionStart)
        this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), row_number_position: val ? 'both' : 'start' })
      else
        this.planstore.modifyRows({ rowIds: this.rows.map(r => r.uuid), row_number_position: val ? 'end' : null })
    },
  }
})
</script>
