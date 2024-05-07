<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Seat Labeling</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Seat label </v-col>
        <v-col cols="12" sm="6">
          <select class="v-custom-input" @input="setSeatNumbering"
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
          <input class="v-custom-input" name="seat_numbering_start_at"
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
        <v-col cols="12" sm="6"> Skip Function </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="skip" :value="skip"
            @input="setSkip" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import { letterCounter, reverse, ROW_NUMBERINGS, SEAT_NUMBERINGS } from '@/lib/numbering';
import { useSeatFormatStore } from '@/stores/seatFormat';
import { usePlanStore } from '@/stores/plan';
import { useMainStore } from '@/stores/index';

const plan = usePlanStore();

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

const props = defineProps({
  areas: Array
})

const labelDirection = [{
  text: 'Clockwise', value: false
}, {
  text: 'Counter Clockwise', value: true
}]

const seatNumberings = SEAT_NUMBERINGS;

const seatNumbering = computed(() => {
  return groupValue(props.areas, area => {
    for (let numbering of SEAT_NUMBERINGS) {
      try {
        let guessedStartAt = numbering.findStartAt(area.seats[0].seat_number)
        let guessedNumbers = numbering.compute(area.seats, guessedStartAt)
        if (area.seats.filter((s, idx) => s.seat_number === guessedNumbers[idx]).length === area.seats.length) {
          let start = ''
          if (numbering.id === 'alpha') start = letterCounter(guessedStartAt, 'A')
          else if (numbering.id === 'alphalower') start = letterCounter(guessedStartAt, 'a')
          else if (numbering.id === 'odd') start = guessedStartAt * 2;
          else start = guessedStartAt

          return { scheme: numbering, reversed: false, startAt: guessedStartAt, start }
        }

        let seatsReversed = reverse(area.seats)
        let guessedStartAtRev = numbering.findStartAt(seatsReversed[0].seat_number)
        let guessedNumbersRev = numbering.compute(seatsReversed, guessedStartAtRev)
        if (seatsReversed.filter((s, idx) => s.seat_number === guessedNumbersRev[idx]).length === area.seats.length) {
          let start = ''
          if (numbering.id === 'alpha') start = letterCounter(guessedStartAt, 'A')
          else if (numbering.id === 'alphalower') start = letterCounter(guessedStartAt, 'a')
          else if (numbering.id === 'odd') start = guessedStartAt * 2;
          else start = guessedStartAt
          return { scheme: numbering, reversed: true, startAt: guessedStartAtRev, start }
        }
      } catch (e) {
        console.warn('Crash while trying to test seat numbering schema', numbering, e)
      }
    }
    return undefined
  })
})

const setSeatNumberingStartAt = (e) => {
  if (seatNumbering.value) {
    const le = seatNumbering.value.scheme.findStartAt(e.target.value)
    plan.renumberTableSeats(props.areas.map(a => a.uuid), seatNumbering.value.scheme, le, seatNumbering.value.reversed)
    plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), skip_letter: '' });
  }
}

const setSeatNumbering = e => {
  let numbering = SEAT_NUMBERINGS.find(n => n.id === e.target.value)
  plan.renumberTableSeats(props.areas.map(a => a.uuid), numbering, 1, false)
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), skip_letter: '' });
}

const setSeatNumberingReversed = e => {
  const value = e.target.value === 'true';
  if (seatNumbering.value) {
    plan.renumberTableSeats(props.areas.map(r => r.uuid), seatNumbering.value.scheme, seatNumbering.value.startAt, value)
    plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), skip_letter: '' });
  }
}

const skip = computed(() => {
  return groupValue(props.areas, area => area?.skip_letter)
})

const setSkip = e => {
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), skip_letter: e.target.value });
  if (seatNumbering.value) {
    plan.skipLetterTableSeats(props.areas.map(a => a.uuid), seatNumbering.value.scheme, seatNumbering.value.startAt, seatNumbering.value.reversed, e.target.value)
  }
}

</script>
