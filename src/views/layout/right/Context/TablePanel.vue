<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>
      Shape Setting
    </h4>
    <v-container>

      <v-row style="display: flex; justify-content: center; align-items: center">

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Width </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" min="1" class="v-custom-input" name="width"
            :value="width" @input="setWidth" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Height </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" min="1" class="v-custom-input" name="height"
            :value="height" @input="setHeight" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'roundTable'"> Radius </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'roundTable'">
          <input type="number" min="1" class="v-custom-input" name="radius"
            :value="radius" @input="setRadius" />
        </v-col>

        <v-col cols="12" sm="6"> Rotation </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'roundTable'"> Open spaces
        </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'roundTable'">
          <input type="number" min="0" class="v-custom-input" name="open_space"
            :value="space" @input="setSpace" />
        </v-col>

      </v-row>

    </v-container>
  </div>

  <v-divider></v-divider>

  <div style="padding: 15px 10px; text-align: left">
    <h4>
      Capacity
    </h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6" v-if="shape === 'roundTable'"> Capacity </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'roundTable'">
          <input type="number" min="0" class="v-custom-input" name="rotation"
            :value="capacity" @input="setCapacity" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Top </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" min="0" class="v-custom-input" name="capacity_top"
            :value="capacityT" @input="setCapacityT" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Bottom </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" min="0" class="v-custom-input"
            name="capacity_bottom" :value="capacityB" @input="setCapacityB" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Left </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" min="0" class="v-custom-input" name="capacity_left"
            :value="capacityL" @input="setCapacityL" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Right </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" min="0" class="v-custom-input"
            name="capacity_right" :value="capacityR" @input="setCapacityR" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'"> Total
        </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'rectangleTable'">
          <input type="number" min="0" class="v-custom-input"
            name="capacity_total" :value="capacityTotal" readonly disabled />
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
    shape() {
      return groupValue(this.areas, a => a.shape)
    },
    width() {
      return Math.round(groupValue(this.areas, a => a.rectangleTable ? a.rectangleTable.width : 0))
    },
    height() {
      return Math.round(groupValue(this.areas, a => a.rectangleTable ? a.rectangleTable.height : 0))
    },
    radius() {
      return Math.round(groupValue(this.areas, a => a.radius))
    },
    capacityT() {
      return groupValue(this.areas, a => a.seats.filter(i => i.special === 'top').length)
    },
    capacityB() {
      return groupValue(this.areas, a => a.seats.filter(i => i.special === 'bottom').length)
    },
    capacityR() {
      return groupValue(this.areas, a => a.seats.filter(i => i.special === 'right').length)
    },
    capacityL() {
      return groupValue(this.areas, a => a.seats.filter(i => i.special === 'left').length)
    },
    rotation() {
      return Math.round(groupValue(this.areas, a => a.rotation))
    },
    capacity() {
      return groupValue(this.areas, a => a.capacity)
    },
    label() {
      return groupValue(this.areas, a => a.label)
    },
    space() {
      return groupValue(this.areas, a => a.space)
    },
    capacityTotal() {
      return groupValue(this.areas, a => a.seats.length);
    }
  },
  methods: {
    setRotation(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), rotation: parseInt(e.target.value) })
    },
    setWidth(e) {
      this.planStore.modifyRectangleTableWidth(this.areas, parseInt(e.target.value))
    },
    setHeight(e) {
      this.planStore.modifyRectangleTableHeight(this.areas, parseInt(e.target.value))
    },
    setRadius(e) {
      this.planStore.modifyRoundTableRadius(this.areas, parseInt(e.target.value))
    },
    setCapacity(e) {
      if (e.target.value > 0) {
        this.planStore.renumberCircleSeats(this.areas.map(a => a.uuid), parseInt(e.target.value))
        this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), skip_letter: '' })
      }
    },
    setSpace(e) {
      this.planStore.modifyRoundTableSpace(this.areas, parseInt(e.target.value))
    },
    setCapacityT(e) {
      this.planStore.modifyRectangleTableCapacityT(this.areas, parseInt(e.target.value))
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), skip_letter: '' })
    },
    setCapacityB(e) {
      this.planStore.modifyRectangleTableCapacityB(this.areas, parseInt(e.target.value))
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), skip_letter: '' })
    },
    setCapacityR(e) {
      this.planStore.modifyRectangleTableCapacityR(this.areas, parseInt(e.target.value))
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), skip_letter: '' })
    },
    setCapacityL(e) {
      this.planStore.modifyRectangleTableCapacityL(this.areas, parseInt(e.target.value))
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), skip_letter: '' })
    },
  }
}

</script>
