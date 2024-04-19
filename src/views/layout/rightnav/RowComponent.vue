<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Row</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Number of seats </v-col>
        <v-col cols="12" sm="6">
          <v-text-field class="custom-small-text-field" variant="outlined"
            type="number" density="compact"
            @input="handle_seat_num_changed"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6"> Curve </v-col>
        <v-col cols="12" sm="6">
          <v-text-field class="custom-small-text-field" variant="outlined"
            type="number" density="compact"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6"> Seats spacing </v-col>
        <v-col cols="12" sm="6">
          <v-text-field class="custom-small-text-field" variant="outlined"
            type="number" density="compact"></v-text-field>
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
import { defineComponent, computed } from 'vue';
import { useSeatFormatStore } from '@/stores/seatFormat';
import { usePlanStore } from '@/stores/plan';

export default defineComponent({
  setup() {
    const seatStore = useSeatFormatStore();
    const nseat = computed(() => seatStore.nseat);
    const setNseat = seatStore.setNseat;
    const planStore = usePlanStore();
    return {
      nseat,
      planStore,
      setNseat,
    };
  },
  props: {
    rows: Array
  },
  methods: {
    handle_seat_num_changed(e) {
      this.setNseat(e.target.value);
      // console.log('okay', this.rows[0].shape)
      this.planStore.renumberCircleSeats(this.rows.map(i => i.uuid), e.target.value);
    }
  }
});
</script>