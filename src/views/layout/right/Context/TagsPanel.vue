<template>
  <div style="padding: 15px 10px; text-align: left">
    <div
      style="display: flex; justify-content: space-between; align-items: center">
      <h4>Tags</h4>
    </div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-select v-model="tag" :items="tags" label="Tags" chips multiple>
          </v-select>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, computed } from "vue";
import { usePlanStore } from '@/stores/plan';
import { onMounted } from "vue";
const planstore = usePlanStore();

const props = defineProps({
  rows: Array,
  selectedTag: Array
})

const tags = ref([
  "Wheelchair",
  "Wheelchair Companion",
  "Partial View",
  "Folding Chair",
  "Standing Room Only"
]);

const tag = ref(null)

onMounted(() => {
  tag.value = props.selectedTag
})

watch(() => props.selectedTag, (newValue, oldValue) => {
  tag.value = props.selectedTag;
})

watch(tag, (newValue, oldValue) => {
  planstore.setTag(props.rows.map(i => i.uuid), newValue);
})

let isDeselecting = false; // Flag to prevent recursive updates

// const selected = ref(props.selectedTag)

// const selected_change = () => {
//   planstore.setTag(props.rows.map(i => i.uuid), selected.value);
// }
// const setTagName = (e) => {
//   console.log(selected.value)
//   planstore.setTag(props.rows.map(i => i.uuid), e.target.value);
// }
</script>

<style>
.v-input__details {
  display: none;
}

.v-col-sm-6 {
  padding: 5px;
}
</style>
