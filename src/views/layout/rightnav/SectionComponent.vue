<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Row Labeling</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Section Label </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" @input="setSectionLabel"
            name="section_label" :value="sectionLabel" />
        </v-col>
        <v-col cols="12" sm="6"> Section Abbreviation </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" @input="setSectionAbb"
            name="section_abbreviation" :value="sectionAbb" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style>
.v-col-sm-6 {
  padding: 5px;
}
</style>

<script>
import { usePlanStore } from '@/stores/plan';

export default {
  props: {
    rows: Array
  },
  data() {

  },
  setup() {
    const planStore = usePlanStore();
    return {
      planStore
    }
  },
  computed: {
    sectionLabel() {
      return '';
    },
    sectionAbb() {
      return '';
    },
  },
  methods: {
    setSectionLabel() {

    },
    setSectionAbb() {

    }
  }
}


</script>