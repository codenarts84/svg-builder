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

      </v-row>
    </v-container>
  </div>
</template>

<script>
import {
  usePlanStore
} from '@/stores/plan';

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
    label() {
      return groupValue(this.areas, a => a.label)
    },
    capacity() {
      return groupValue(this.areas, a => a.capacity)
    }
  },

  methods: {
    setAbbreviation(e) {
      const input = e.target;
      const value = input.value;
      const validCharacters = /^[a-zA-Z0-9-]*$/;

      if (!validCharacters.test(e.target.value)) {
        input.value = value.replace(/[^a-zA-Z0-9-]/g, '');
      }

      this.planStore.modifyAreas({
        areaIds: this.areas.map(a => a.uuid),
        abbreviation: input.value,
        text__text: input.value

      })
    },
    setLabel(e) {
      this.planStore.modifyAreas({
        areaIds: this.areas.map(a => a.uuid),
        label: e.target.value
      })
    },
    setCapacity(e) {
      this.planStore.modifyAreas({
        areaIds: this.areas.map(a => a.uuid),
        capacity: parseInt(e.target.value)
      })
    }
  }
}
</script>
