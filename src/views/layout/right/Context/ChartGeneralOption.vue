<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Chart Options</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Chart
          Name </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="chart_name" :value="chartName"
            @input="setChartName" />
        </v-col>
        <v-col cols="12" sm="6"> Width </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="number" name="width" :value="width"
            @keydown="isSetBackground" @input="setWidth" min="0" />
        </v-col>
        <v-col cols="12" sm="6"> Height </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="number" name="height"
            :value="height" @keydown="isSetBackground" @input="setHeight"
            min="0" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>

import { ref, computed, inject } from "vue";
import { usePlanStore } from "@/stores/plan";

const plan = computed(() => usePlanStore().plan);
const planRef = inject('planRef');

const chartName = ref(plan.value.name);
const width = ref(plan.value.size.width);
const height = ref(plan.value.size.height);

const isSetBackground = (e) => {
  if (planRef.value?.background) {
    e.preventDefault();
    alert('Please remove the background image before updating the size of this seating chart.')
  }
}

const setChartName = (e) => {
  const name = e.target.value;
  if (!name.trim()) {
    return;
  }
  chartName.value = name;
  usePlanStore().setPlanName(chartName.value);
}

const setWidth = (e) => {
  const { value } = e.target;
  if (value <= 0) return;
  width.value = value;
  usePlanStore().setPlanSize(width.value, height.value);
}

const setHeight = (e) => {
  const { value } = e.target;
  if (value <= 0) return;
  height.value = value;
  usePlanStore().setPlanSize(width.value, height.value);
}

</script>