<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Seat Label</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Seat Label </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="seat_label" :value="seat"
            @input="setSeat" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { usePlanStore } from "@/stores/plan";
const planStore = usePlanStore();
const props = defineProps({
  seats: Array
})

const seat = computed(() => props.seats ? props.seats[0].seat_number : '');
const setSeat = (e) => {
  if (e.target.value) {
    planStore.modifySeats({ seatIds: props.seats.map(i => i.uuid), seat_number: e.target.value })
  }
}
</script>