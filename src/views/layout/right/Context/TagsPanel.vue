<template>
  <div style="padding: 15px 10px; text-align: left">
    <div
      style="display: flex; justify-content: space-between; align-items: center">
      <h4>Tags</h4>
    </div>
    <v-container>
      <!-- <v-chip-group selected-class="text-primary" multiple column>
        <v-chip v-for="tag in tags" :key="tag" style="width: 100%">
          {{ tag }}
        </v-chip>
      </v-chip-group> -->
      <v-row>
        <v-col cols="12">
          <select class="toolbox-input v-custom-input" v-model="selected"
            @change="selected_change">
            <option v-for="tag in tags" :key="tag" option-label="label"
              name="tag_name" :value="tag">
              {{ tag }}
            </option>
          </select>
        </v-col>
      </v-row>
    </v-container>
    <!-- <p style="font-size: 13px; text-align: center">
      Ctrl + Left click = pick multiple. To remove all tags click each selected
      with Ctrl.
    </p> -->
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { usePlanStore } from '@/stores/plan';
const planstore = usePlanStore();

const props = defineProps({
  rows: Array,
  selectedTag: String
})
const tags = ref([
  "Wheelchair",
  "Wheelchair Companion",
  "Partial View",
  "Folding Chair",
]);
const selected = ref(props.selectedTag)

const selected_change = () => {

  planstore.setTag(props.rows.map(i => i.uuid), selected.value);
}
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
