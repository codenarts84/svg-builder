<template>
  <div class="color-picker-container">
    <v-btn :color="selected" class="border-rounded" @click="setToggle"></v-btn>
    <div v-show="toggle" class="color-picker-dropdown">
      <div class="color-picker">
        <v-btn class="color-item-btn" v-for="color in colors" :key="color"
          :color="color" @click="() => onColorSelected(color)"></v-btn>
      </div>
      <div class="color-picker-action">
        <v-btn class="action-button" @click="onOk">Ok</v-btn>
        <v-btn class="action-button" @click="onCancel">Cancel</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, computed } from 'vue';

const props = defineProps({
  setColor: Function,
  selected: String,
  index: Number,
  setToggle: Function,
  clearToggle: Function,
  toggle: Boolean,
})

const onColorSelected = color => {
  selected.value = color;
}
const setToggle = () => {
  props.setToggle(props.index);
}

const onOk = () => {
  props.setColor(selected.value, props.index);
  props.clearToggle();
}

const onCancel = () => {
  props.clearToggle();
}

const selected = ref(props.selected)

const colors = [
  '#2b68e8',
  '#2144ac',
  '#646bee',
  '#21a6e6',
  '#106a9f',
  '#1992a1',
  '#20b6d2',
  '#25b8a6',
  '#2fc463',
  '#1d7f40',
  '#86ca2e',
  '#67a221',
  '#f39d2a',
  '#d77720',
  '#f7732a',
  '#bc173f',
  '#df224c',
]
</script>

<style>
.border-rounded {
  min-width: 30px;
  height: 30px !important;
  border-radius: 50%;
}

.color-picker-container {
  position: relative;
}

.color-picker-dropdown {
  position: absolute;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  padding: 10px 20px;
  margin: 10px 0;
  background-color: rgb(255, 255, 255);
  color: rgba(0, 0, 0, 0.87);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  margin: 30px 0;
}

.color-picker-action {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.color-item-btn {
  min-width: 30px;
  height: 30px !important;
  border-radius: 50%;
  margin: 5px;
}

.action-button {
  min-width: 100px;
}
</style>