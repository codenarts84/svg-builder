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
          <select class="toolbox-input v-custom-input"
            @input="setSeatNumbering($event)"
            :value="seatNumbering ? seatNumbering.scheme.id : null">
            <option v-for="numbering in seatNumberings" :key="numbering"
              option-label="label" name="seat_numbering"
              :value="numbering.id ? numbering.id : null">
              {{ numbering.label }}
            </option>
          </select>
        </v-col>
        <v-col cols="12" sm="6"> Start At </v-col>
        <v-col cols="12" sm="6">
          <input class="custom-small-text-field v-custom-input"
            name="row_numbering_start_at"
            :value="seatNumbering ? seatNumbering.start : null"
            @input="setSeatNumberingStartAt" />
        </v-col>

        <v-col cols="12" sm="6"> Label Direction </v-col>
        <v-col cols="12" sm="6">
          <select class="v-custom-input" @input="setSeatNumberingReversed"
            :value="seatNumbering ? seatNumbering.reversed : false">
            <option v-for="label in labelDirection" :value="label.value"
              :key="label">
              {{ label.text }}
            </option>
          </select>
        </v-col>

        <v-col cols="12" sm="6"> Skip Labels </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" :value="skip" @input="setSkip" />
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
import { SEAT_NUMBERINGS, reverse, letterCounter } from '@/lib/numbering';
import { tickStep } from 'd3';

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
    const planStore = usePlanStore();
    return {
      seatsLabel: seatStore.seatsLabel,
      changeSeat: seatStore.changeSeat,
      planStore,
    }
  },
  data() {
    const labelDirection = [{
      text: 'Ascending', value: false
    }, {
      text: 'Descending', value: true
    }]
    const labelDisplay = [{
      text: 'None', value: 0, left: false, right: false,
    }, {
      text: 'Left', value: 1, left: true, right: false,
    }, {
      text: 'Right', value: 2, left: false, right: true,
    }, {
      text: 'Both', value: 3, left: true, right: true,
    }]
    return {
      // cur: null
      seatNumberings: SEAT_NUMBERINGS,
      labelDirection,
      labelDisplay
    }
  },

  props: {
    rows: Array
  },

  computed: {
    skip() {
      return groupValue(this.rows, row => row.skip_letter)
    },
    seatNumbering() {
      return groupValue(this.rows, row => {
        for (let numbering of SEAT_NUMBERINGS) {
          try {
            let guessedStartAt = numbering.findStartAt(row.seats[0].seat_number)
            let guessedNumbers = numbering.compute(row.seats, guessedStartAt)
            if (row.seats.filter((s, idx) => s.seat_number === guessedNumbers[idx]).length === row.seats.length) {
              let start = ''
              if (numbering.id === 'alpha') start = letterCounter(guessedStartAt, 'A')
              else if (numbering.id === 'alphalower') start = letterCounter(guessedStartAt, 'a')
              else if (numbering.id === 'odd') start = (guessedStartAt - 1) * 2;
              else if (numbering.id === 'even') start = (guessedStartAt - 1) * 2;
              else start = guessedStartAt

              return { scheme: numbering, reversed: false, startAt: guessedStartAt, start }
            }

            let seatsReversed = reverse(row.seats)
            let guessedStartAtRev = numbering.findStartAt(seatsReversed[0].seat_number)
            let guessedNumbersRev = numbering.compute(seatsReversed, guessedStartAtRev)
            if (seatsReversed.filter((s, idx) => s.seat_number === guessedNumbersRev[idx]).length === row.seats.length) {
              let start = ''
              if (numbering.id === 'alpha') start = letterCounter(guessedStartAt, 'A')
              else if (numbering.id === 'alphalower') start = letterCounter(guessedStartAt, 'a')
              else if (numbering.id === 'odd') start = (guessedStartAt - 1) * 2;
              else if (numbering.id === 'even') start = (guessedStartAt - 1) * 2;
              else start = guessedStartAt

              return { scheme: numbering, reversed: true, startAt: guessedStartAtRev, start }
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
    setSeatNumberingStartAt(e) {
      const id = this.seatNumbering.scheme.id;
      const input = e.target;
      const value = input.value;
      const validLetters = /^[a-zA-Z]+$/;
      const validNumbers = /^[0-9]+$/;

      if ((id === 'alpha' || id === 'alphalower') && !validLetters.test(e.target.value)) {
        input.value = value.replace(/[^a-zA-Z]/g, '');
      } else if ((id === 'natural' || id === 'even' || id === 'odd') && !validNumbers.test(e.target.value)) {
        input.value = value.replace(/[^0-9]/g, '');
      } else {
        const le = this.seatNumbering.scheme.findStartAt(input.value)
        this.planStore.renumberSeats(this.rows.map(r => r.uuid), this.seatNumbering.scheme, le, this.seatNumbering.reversed)
        this.planStore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip_letter: '' })
      }
    },
    setSeatNumberingReversed(val) {
      const value = val.target.value === 'true';
      if (this.seatNumbering) {
        this.planStore.renumberSeats(this.rows.map(r => r.uuid), this.seatNumbering.scheme, this.seatNumbering.startAt, value)
        this.planStore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip_letter: '' })
      }
    },
    setSeatNumbering(val) {
      // let numbering = SEAT_NUMBERINGS.find(n => n.id === val.target.value);
      // this.planStore.modifyRows(this.rows.map(r => r.uuid), numbering, 1, false);
      let numbering = SEAT_NUMBERINGS.find(n => n.id === val.target.value)
      this.planStore.renumberSeats(this.rows.map(r => r.uuid), numbering, 1, false);
      this.planStore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip_letter: '' })
    },
    setSkip(val) {
      if (this.seatNumbering) {
        this.planStore.modifyRows({ rowIds: this.rows.map(r => r.uuid), skip_letter: val.target.value })
        this.planStore.skipLetterSeats(this.rows.map(r => r.uuid), this.seatNumbering.scheme, this.seatNumbering.startAt, this.seatNumbering.reversed, val.target.value);
      }
    }
  }
})
</script>