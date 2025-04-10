<template>
  <div style="padding: 15px 10px; text-align: left" v-if="seats.length === 1">
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
import { computed, ref, defineProps, watch, onMounted } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { groupValue } from "@/lib/utils";

const planStore = usePlanStore();

const props = defineProps({
  seats: Array,
})

const seat = computed(() => {
  return groupValue(props.seats, seat => seat.seat_number);
})

const setSeat = (e) => {
  if (e.target.value) {
    planStore.modifyTableSeatLabel(props.seats[0].uuid, e.target.value)
  }
}
</script>