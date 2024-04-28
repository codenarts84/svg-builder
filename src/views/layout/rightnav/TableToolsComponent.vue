<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>
      Shape
    </h4>
    <v-container>

      <v-row style="display: flex; justify-content: center; align-items: center">

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Width </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" class="v-custom-input" name="width" :value="width"
            @input="setWidth" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Height </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" class="v-custom-input" name="height"
            :value="height" @input="setHeight" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'roundTable'"> Radius </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'roundTable'">
          <input type="number" class="v-custom-input" name="radius"
            :value="radius" @input="setRadius" />
        </v-col>

        <v-col cols="12" sm="6"> Rotation </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'roundTable'"> Capacity </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'roundTable'">
          <input type=" number" class="v-custom-input" name="rotation"
            :value="category" @input="setCategory" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Top </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" class="v-custom-input" name="rotation"
            :value="categoryT" @input="setCategoryT" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Bottom </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" class="v-custom-input" name="rotation"
            :value="categoryB" @input="setCategoryB" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Left </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" class="v-custom-input" name="rotation"
            :value="categoryL" @input="setCategoryL" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Right </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" class="v-custom-input" name="rotation"
            :value="categoryR" @input="setCategoryR" />
        </v-col>

        <v-col cols="12" sm="6"> Label Name </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="label" @input="setLabel" />
        </v-col>

        <v-col cols="12" sm="6"> Abbreviation </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="abbreviation" @input="setAbbreviation" />
        </v-col>

        <!-- <v-col cols="12" sm="6"> Position X </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col>

        <v-col cols="12" sm="6"> Position Y </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col>

        <v-col cols="12" sm="6"> Text Size </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col> -->

        <!-- <v-col cols="12" sm="6"> Category </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col>

        <v-col cols="12" sm="6"> Section </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col> -->

        <!-- <v-col cols="12" sm="6"> Seat Label </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col>

        <v-col cols="12" sm="6"> Skip </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col> -->

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
  data() {
    return {
    }
  },
  setup() {
    const planStore = usePlanStore();
    return {
      planStore
    }
  },
  computed: {
    width() {
      return groupValue(this.areas, a => a.rectangleTable ? a.rectangleTable.width : 0)
    },
    height() {
      return groupValue(this.areas, a => a.rectangleTable ? a.rectangleTable.height : 0)
    },
    radius() {
      return groupValue(this.areas, a => a.roundTable ? a.roundTable.radius : 0)
    },
    rotation() {
      return groupValue(this.areas, a => a.rotation)
    },
    capacity() {
      return groupValue(this.areas, a => a.capacity ? a.capacity : 0)
    },


  },
  methods: {
    setColor(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), color: e.target.value })
    },
    setBorderColor(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), border_color: e.target.value })
    },
    setBorderWidth(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), border_width: parseInt(e.target.value) })
    },
    setRotation(e) {
      console.log(typeof (parseInt(e.target.value)))
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), rotation: parseInt(e.target.value) })
    },
    setTextColor(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__color: e.target.value })
    },
    setText(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__text: e.target.value })
    },
    setTextSize(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__size: parseInt(e.target.value) })
    },
    setTextX(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__position__x: parseInt(e.target.value) })
    },
    setTextY(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__position__y: parseInt(e.target.value) })
    },
    setWidth(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), rectangle__width: parseInt(e.target.value) })
    },
    setHeight(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), rectangle__height: parseInt(e.target.value) })
    },
    setRadius(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), circle__radius: parseInt(e.target.value) })
    },
    setRadiusX(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), ellipse__radius__x: parseInt(e.target.value) })
    },
    setRadiusY(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), ellipse__radius__y: parseInt(e.target.value) })
    },
  }
}

</script>
