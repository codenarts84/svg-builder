<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>
      SDH
    </h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">

        <v-col cols="12" sm="6"> Height </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="height" />
        </v-col>

        <v-col cols="12" sm="6"> Width </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="width" />
        </v-col>

        <v-col cols="12" sm="6"> Rotation </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" />
        </v-col>

        <v-col cols="12" sm="6"> Label </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" />
        </v-col>

        <v-col cols="12" sm="6"> Text Size </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" />
        </v-col>

        <v-col cols="12" sm="6"> Fill Color </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" />
        </v-col>

        <v-col cols="12" sm="6"> Stroke Width </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" />
        </v-col>

        <v-col cols="12" sm="6"> Stroke Color </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" />
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<script setup>

import { defineProps, ref, onMounted, watch } from 'vue';
const height = ref(0);
const width = ref(0);
const rotation = ref(0);
const text = ref('');
const textSize = ref(0);
const textColor = ref('');
const bgColor = ref('');
const bdWidth = ref('');
const bdColor = ref('');

const props = defineProps({
  areas: Array
})

onMounted(() => {
  if (props.areas.length === 1) {
    const area = props.areas[0];
    if (area.shape === 'ellipse' || area.shape === 'gaCircle') {
      width.value = area.ellipse.radius.x * 2;
      height.value = area.ellipse.radius.y * 2;
      rotation.value = area.rotation;

    }
    width.value = props.areas[0].ellipse.radius.x;
  }
})

watch(width, (newValue, oldValue) => {
  console.log(newValue, oldValue)
})

watch(height, (newValue, oldValue) => {
  console.log(newValue, oldValue)
})

</script>