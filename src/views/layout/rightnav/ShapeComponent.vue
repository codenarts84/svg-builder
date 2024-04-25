<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Shape</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Rotate </v-col>
        <v-col cols="12" sm="6">
          <!-- <v-text-field
            class="custom-small-text-field"
            variant="outlined"
            type="number"
            density="compact"
          ></v-text-field> -->
          <!-- <v-btn @click="testFunc">Check</v-btn>
          <h5>{{ rotate_val }}</h5> -->
          <input class="v-custom-input" type="number" name="rotate"
            :value="rotate_val" @input="handleRotate" />
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

<script setup>
import { defineProps, computed } from 'vue'
import { usePlanStore } from '@/stores/plan.js';
import { useMainStore } from '@/stores';

const planStore = usePlanStore();


const props = defineProps({
  rows: Array,
  temp_Rotate: Function,
})

// const testFunc = () => {
//   console.log('This is testFunc');
//   console.log(props.rows);
// }

const rotate_val = computed(() => props.rows.length ? props.rows[0].rotation : '0');

const handleRotate = (e) => {
  // console.log('this is handle Rotate');
  const val = e.target.value;
  // if (!val) return;
  const temp = val - rotate_val.value;
  // console.log(val, rotate_val.value, temp);
  props.temp_Rotate(temp);
  // const currrent_deg = rotate_val;
  // console.log('uuid', props.rows[0].uuid);

}
</script>