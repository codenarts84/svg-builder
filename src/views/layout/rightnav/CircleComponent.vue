<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>
      Shape
    </h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">

        <v-col cols="12" sm="6"> Radius X </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="radiusX" />
        </v-col>

        <v-col cols="12" sm="6"> Radius Y </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="radiusY" />
        </v-col>

        <v-col cols="12" sm="6"> Rotation </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="rotation" />
        </v-col>

        <v-col cols="12" sm="6"> Label </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="text" />
        </v-col>

        <v-col cols="12" sm="6"> Text Size </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="textSize" />
        </v-col>

        <v-col cols="12" sm="6"> Fill Color </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="bgColor" />
        </v-col>

        <v-col cols="12" sm="6"> Stroke Width </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="bdWidth" />
        </v-col>

        <v-col cols="12" sm="6"> Stroke Color </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" v-model="bdColor" />
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<script setup>

import { defineProps, ref, onMounted, watch } from 'vue';
const radiusY = ref(0);
const radiusX = ref(0);
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
    console.log(area)
    if (area.shape === 'ellipse' || area.shape === 'gaCircle') {
      radiusX.value = area.ellipse.radius.x * 2 || 0;
      radiusY.value = area.ellipse.radius.y * 2 || 0;
    } else if (area.shape === 'circle') {
      radiusX.value = area.circle.radius || 0;
      radiusY.value = area.circle.radius || 0;
    }
    rotation.value = area.rotation || 0;
    text.value = area.text.text || '';
    textSize.value = area.text.size || 16;
    textColor.value = area.text.color || '#fff';
    bgColor.value = area.color || '#cccccc';
    bdWidth.value = area.border_width || 2;
    bdColor.value = area.border_color || '#000000';
  }
})

watch(radiusX, (newValue, oldValue) => {

})

watch(radiusY, (newValue, oldValue) => {
  console.log(newValue, oldValue)
})

watch(radiusX, (newValue, oldValue) => {
  console.log(newValue, oldValue)
})

watch(radiusY, (newValue, oldValue) => {
  console.log(newValue, oldValue)
})




</script>