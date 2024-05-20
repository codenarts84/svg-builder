<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>
      GA Option
    </h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">

        <v-col cols="12" sm="6"> Capacity </v-col>
        <v-col cols="12" sm="6">
          <input type="number" min="1" class="v-custom-input" name="capacity"
            :value="capacity" @input="setCapacity" />
        </v-col>

        <v-col cols="12" sm="6"> Label </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="label" :value="label"
            @input="setLabel" />
        </v-col>

        <v-col cols="12" sm="6"> Abbreviation </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="abbreviation" :value="abbreviation"
            @input="setAbbreviation" maxlength="6" />
        </v-col>

        <v-col cols="12" sm="6"> Show Label </v-col>
        <v-col cols="12" sm="6">
          <input type="checkbox" name="show_label" :checked="isShow"
            @change="setShow" />
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed, defineProps, ref } from "vue";
import {
  usePlanStore
} from '@/stores/plan';

import { groupValue } from "@/lib/utils";

const props = defineProps({
  areas: Array
});

const planStore = usePlanStore();

const abbreviation = computed(() => groupValue(props.areas, a => a.abbreviation));
const label = computed(() => groupValue(props.areas, a => a.label));
const capacity = computed(() => groupValue(props.areas, a => a.capacity));
const isShow = computed(() => groupValue(props.areas, a => a.show_label));

const setAbbreviation = (e) => {
  const input = e.target;
  const value = input.value;
  const validCharacters = /^[a-zA-Z0-9-]*$/;

  if (!validCharacters.test(e.target.value)) {
    input.value = value.replace(/[^a-zA-Z0-9-]/g, '');
  }

  planStore.modifyAreas({
    areaIds: props.areas.map(a => a.uuid),
    abbreviation: input.value,
    text__text: input.value

  })
}

const setLabel = (e) => {
  planStore.modifyAreas({
    areaIds: props.areas.map(a => a.uuid),
    label: e.target.value
  })
}

const setCapacity = (e) => {
  planStore.modifyAreas({
    areaIds: props.areas.map(a => a.uuid),
    capacity: parseInt(e.target.value)
  })
}

const setShow = (e) => {
  planStore.modifyAreas({
    areaIds: props.areas.map(a => a.uuid),
    show_label: e.target.checked
  })
}

</script>
