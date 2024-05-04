<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Labeling</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Name </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="table_label" :value="tableName"
            @input="setTableName" />
        </v-col>
        <v-col cols="12" sm="6"> Abbreviation </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="table_abv" :value="tableAbv"
            @input="setTableAbv" />
        </v-col>
        <v-col cols="12" sm="6"> Position X </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="number" name="position_x"
            :value="positionX" @input="setPositionX" />
        </v-col>
        <v-col cols="12" sm="6"> Position Y </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="number" name="position_y"
            :value="positionY" @input="setPositionY" />
        </v-col>
        <v-col cols="12" sm="6"> Text Size </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="number" min="1" name="text_size"
            :value="textSize" @input="setTextSize" />
        </v-col>
        <v-col cols="12" sm="6"> Text Color </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="color" :value="textColor"
            @input="setTextColor" />
        </v-col>
        <v-col cols="12" sm="6"> Rotate Label with Table </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="checkbox" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed, ref, defineProps } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { useMainStore } from '@/stores';

const plan = usePlanStore();
const round = (fl, places) => Number(fl.toFixed(places ? places : 0))

const shallowEqual = (object1, object2) => {
  if (object1 === null || object2 === null || typeof object1 !== "object" || typeof object2 !== "object") {
    return object1 === object2
  }
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false
    }
  }
  return true
}

const groupValue = (rows, mapper) => {
  let lastFound = undefined
  for (let row of rows) {
    let val = mapper(row)
    if (lastFound === undefined) {
      lastFound = val
    } else if (!shallowEqual(lastFound, val)) {
      return undefined
    }
  }
  return lastFound
}

const props = defineProps({
  areas: Array
})

const tableName = computed(() => {
  return groupValue(props.areas, a => a.label ? a.label.name : undefined)
})

const tableAbv = computed(() => {
  return groupValue(props.areas, a => a.label ? a.label.abv : undefined)
})

const positionX = computed(() => {
  return groupValue(props.areas, a => a.label ? a.label.position.x : 0)
})

const positionY = computed(() => {
  return groupValue(props.areas, a => a.label ? a.label.position.y : 0)
})

const textSize = computed(() => {
  return groupValue(props.areas, a => a.label ? a.label.size : 0)
})

const textColor = computed(() => {
  return groupValue(props.areas, a => a.label.color);
})

const setTableName = (e) => {
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), label__name: e.target.value })
}

const setTableAbv = (e) => {
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), label__abv: e.target.value })
}

const setPositionX = (e) => {
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), label__position__x: parseInt(e.target.value) })
}

const setPositionY = (e) => {
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), label__position__y: parseInt(e.target.value) })
}

const setTextSize = (e) => {
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), label__size: parseInt(e.target.value) })
}

const setTextColor = (e) => {
  plan.modifyAreas({ areaIds: props.areas.map(a => a.uuid), label__color: e.target.value })
}

</script>