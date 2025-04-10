<template>
  <div>
    <input type="color" class="v-custom-input v-custom-color-input"
      @click="onClick" v-model="color" />
    <div class="d-relative">
      <v-color-picker v-show="show" class="v-color-picker" mode="hexa"
        :style="popupStyles" v-model="color" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch } from "vue";
const props = defineProps({
  setColor: Function,
  color: String
})
const popupStyles = ref({})
const show = ref(false)
const color = ref(props?.color)
const onClick = (e) => {
  e.preventDefault();
  if (e.clientY + 350 > window.innerHeight) {
    popupStyles.value = {
      bottom: '38px'
    }
  }
  show.value = !show.value;
}

watch(color, (newValue, oldValue) => {
  props.setColor(newValue)
})
</script>

<style>
.d-relative {
  position: relative;
}

.v-color-picker {
  position: absolute;
  right: 0;
  max-width: 250px !important;
  width: 250px !important;
  z-index: 999;
}

.v-custom-color-input {
  margin: 0;
  padding: 0;
  height: 35px;
}
</style>