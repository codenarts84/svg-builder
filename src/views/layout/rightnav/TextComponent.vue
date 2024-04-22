<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Text</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Text </v-col>
        <v-col cols="12" sm="6">
          <input class="custom-small-text-field" type="text" name="row_spacing"
            :value="textValue" @input="setText" />
        </v-col>
        <v-col cols="12" sm="6"> Text size </v-col>
        <v-col cols="12" sm="6">
          <!-- <v-text-field class="custom-small-text-field" variant="outlined"
            type="number" density="compact"></v-text-field> -->
          <input class="custom-small-text-field" type="number" name="row_spacing"
            :value="textSize" @input="setTextSize" />
        </v-col>
        <v-col cols="12" sm="6"> Text color </v-col>
        <v-col cols="12" sm="6">
          <input class="custom-small-text-field" type="color" name="row_spacing"
            :value="textColor" @input="setTextColor" />
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<style>
.v-input__details {
  display: none;
}

.v-col-sm-6 {
  padding: 5px;
}
</style>

<script>
import { defineComponent, computed, ref } from 'vue';
import { usePlanStore } from '@/stores/plan';

const groupValue = (areas, mapper) => {
  const uniques = areas.map(mapper).filter((v, i, s) => s.indexOf(v) === i)
  if (uniques.length === 1) {
    return uniques[0]
  } else {
    return undefined
  }
}

export default defineComponent({
  props: {
    areas: Array
  },
  data() {
    return {
    }
  },
  setup() {
    const planStore = usePlanStore();
    return {
      planStore,
    };
  },
  methods: {
    setTextSize(e) {
      this.planStore.modifyTextSize(this.areas, e.target.value)
    },
    setText(e) {
      console.log(this.areas);
      this.planStore.modifyText(this.areas, e.target.value)
    },
    setTextColor(e) {
      this.planStore.modifyTextColor(this.areas, e.target.value)
    },
  },
  computed: {
    textValue() {
      console.log(this.areas)
      return groupValue(this.areas, a => a.text ? a.text.text : undefined)
    },
    textSize() {
      return groupValue(this.areas, a => (a.text && a.text.size) ? a.text.size : 16)
    },
    textColor() {
      return groupValue(this.areas, a => a.text ? a.text.color : undefined)
    },
  }
});
</script>