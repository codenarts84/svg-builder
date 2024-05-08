<template>
  <div>
    <input type="text" class="v-custom-input" @focus="show = true"
      @blur="show = false" v-model="color" />
    <div class="d-relative">
      <v-color-picker v-show="show" class="v-color-picker" mode="hexa"
        v-model="color" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch } from "vue";
const props = defineProps({
  setColor: Function,
  color: String
})
const show = ref(false)
const color = ref(props?.color)
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
</style>