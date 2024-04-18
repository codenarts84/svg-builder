

<template>
  <div class="toolbox-row">
    <label>Numbering</label>
    <select class="toolbox-input" @input="setSeatNumbering($event)">
      <option v-for="numbering in seatNumberings" :key="numbering"
        option-label="label" name="seat_numbering"
        :value="numbering.id ? numbering.id : null">
        {{ numbering.label }}
      </option>
    </select>
  </div>
</template>

<script>
import { SEAT_NUMBERINGS } from '@/lib/numbering';
import { usePlanStore } from '@/stores/plan';


export default {
  setup() {
    const planstore = usePlanStore();
    return { planstore }
  },
  props: {
    rows: Array
  },
  data() {
    return {
      seatNumberings: SEAT_NUMBERINGS,
    }
  },
  methods: {
    setSeatNumbering(val) {
      let numbering = SEAT_NUMBERINGS.find(n => n.id === val.target.value);
      this.planstore.renumberSeats(this.rows.map(r => r.uuid), numbering, 1, false)
    }
  }
}
</script>