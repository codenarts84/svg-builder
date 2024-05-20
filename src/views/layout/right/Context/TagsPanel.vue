<template>
  <div style="padding: 15px 10px; text-align: left">
    <div
      style="display: flex; justify-content: space-between; align-items: center">
      <h4>Tags</h4>
    </div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-select v-model="tag" :items="tagsOption" label="Tags" chips multiple>
          </v-select>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, computed } from "vue";
import { usePlanStore } from "@/stores/plan";
import { onMounted } from "vue";
const planstore = usePlanStore();

const props = defineProps({
  setTag: Function,
  selectedTag: Array
})

const tagsOption = ref([
  "Wheelchair",
  "Wheelchair Companion",
  "Partial View",
  "Folding Chair",
  "Standing Room Only"
]);

const tag = ref([]);

onMounted(() => {
  tag.value = props.selectedTag
})

// watch(() => props.selectedTag, (newValue, oldValue) => {
//   tag.value = props.selectedTag;
// })

watch(tag, (newValue, oldValue) => {
  props.setTag(newValue);
  // planstore.setTag(props.rows.map(i => i.uuid), newValue);
})
</script>