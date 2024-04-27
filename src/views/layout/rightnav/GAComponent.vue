<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>
      GA Option
    </h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">

        <v-col cols="12" sm="6"> Capacity </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="capacity"
            :value="capacity" @input="setCapacity" />
        </v-col>

        <v-col cols="12" sm="6"> Abbreviation </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="abbreviation" :value="abbreviation"
            @input="setAbbreviation" />
        </v-col>

        <v-col cols="12" sm="6"> Category </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="category" :value="category"
            @input="setCategory" />
        </v-col>

        <v-col cols="12" sm="6"> Section </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" name="section" :value="section"
            @input="setSection" />
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<script>

import { usePlanStore } from '@/stores/plan';

const groupValue = (areas, mapper) => {
  const uniques = areas.map(mapper).filter((v, i, s) => s.indexOf(v) === i)
  if (uniques.length === 1) {
    return uniques[0]
  } else {
    return undefined
  }
}

export default {
  props: {
    areas: Array,
  },
  setup() {
    const planStore = usePlanStore();
    return {
      planStore
    }
  },

  computed: {
    abbreviation() {
      return groupValue(this.areas, a => a.abbreviation)
    },
    category() {
      return groupValue(this.areas, a => a.category)
    },
    section() {
      return groupValue(this.areas, a => a.section)
    },
    capacity() {
      return groupValue(this.areas, a => a.capacity)
    }
  },

  methods: {
    setAbbreviation(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), abbreviation: e.target.value })
    },
    setCategory(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), category: e.target.value })
    },
    setSection(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), section: e.target.value })
    },
    setCapacity(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), capacity: parseInt(e.target.value) })
    }
  }
}

</script>