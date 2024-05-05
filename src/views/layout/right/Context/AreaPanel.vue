<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>
      Shape
    </h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">

        <v-col cols="12" sm="6"
          v-if="shape === 'rectangle' || shape === 'gaSquare'"> Width </v-col>
        <v-col cols="12" sm="6"
          v-if="shape === 'rectangle' || shape === 'gaSquare'">
          <input type="number" min="1" class="v-custom-input" name="width"
            :value="width" @input="setWidth" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape === 'rectangle' || shape === 'gaSquare'"> Height </v-col>
        <v-col cols="12" sm="6"
          v-if="shape === 'rectangle' || shape === 'gaSquare'">
          <input type="number" min="1" class="v-custom-input" name="height"
            :value="height" @input="setHeight" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape === 'circle'"> Radius </v-col>
        <v-col cols="12" sm="6" v-if="shape === 'circle'">
          <input type="number" min="1" class="v-custom-input" name="radius"
            :value="radius" @input="setRadius" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape === 'ellipse' || shape === 'gaCircle'"> Radius X </v-col>
        <v-col cols="12" sm="6"
          v-if="shape === 'ellipse' || shape === 'gaCircle'">
          <input type="number" min="1" class="v-custom-input" name="radius_x"
            :value="radiusX" @input="setRadiusX" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape === 'ellipse' || shape === 'gaCircle'"> Radius Y </v-col>
        <v-col cols="12" sm="6"
          v-if="shape === 'ellipse' || shape === 'gaCircle'">
          <input type="number" min="1" class="v-custom-input" name="radius_y"
            :value="radiusY" @input="setRadiusY" />
        </v-col>

        <v-col cols="12" sm="6"> Rotation </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="rotation"
            :value="rotation" @input="setRotation" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare'"> Text </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare'">
          <input class=" v-custom-input" name="text_value" :value="textValue"
            @input="setText" maxlength="15" />
        </v-col>

        <v-col cols="12" sm="6"> Text size </v-col>
        <v-col cols="12" sm="6">
          <input type="number" min="1" class="v-custom-input" name="text_size"
            :value="textSize" @input="setTextSize" />
        </v-col>

        <v-col cols="12" sm="6"> Text Color </v-col>
        <v-col cols="12" sm="6">
          <input class="v-custom-input" type="color" name="text_color"
            :value="textColor || '#ccc'" @input="setTextColor" />
        </v-col>

        <v-col cols="12" sm="6"> label Text position (x) </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="text_x" :value="textX"
            @input="setTextX" />
        </v-col>

        <v-col cols="12" sm="6"> label Text position (y) </v-col>
        <v-col cols="12" sm="6">
          <input type="number" class="v-custom-input" name="text_y" :value="textY"
            @input="setTextY" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape !== 'text'"> Stroke Width </v-col>
        <v-col cols="12" sm="6" v-if="shape !== 'text'">
          <input type="number" min="0" class="v-custom-input" name="text_size"
            :value="borderWidth" @input="setBorderWidth" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape !== 'text'"> Stroke Color </v-col>
        <v-col cols="12" sm="6" v-if="shape !== 'text'">
          <input class="v-custom-input" type="color" name="labelBorder"
            :value="borderColor || '#ccc'" @input="setBorderColor" />
        </v-col>

        <v-col cols="12" sm="6" v-if="shape !== 'text'"> Fill Color </v-col>
        <v-col cols="12" sm="6" v-if="shape !== 'text'">
          <input class="v-custom-input" type="color" name="labelColor"
            :value="color || '#ccc'" @input="setColor" />
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
    temp_Rotate: Function,
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
    rotation() {
      return Math.round(groupValue(this.areas, a => a.rotation))
    },
    shape() {
      return groupValue(this.areas, a => a.shape)
    },
    color() {
      return groupValue(this.areas, a => a.color)
    },
    borderColor() {
      return groupValue(this.areas, a => a.border_color)
    },
    borderWidth() {
      return Math.round(groupValue(this.areas, a => a.border_width))
    },
    textColor() {
      return groupValue(this.areas, a => a.text ? a.text.color : undefined)
    },
    textValue() {
      return groupValue(this.areas, a => a.text ? a.text.text : undefined)
    },
    textSize() {
      return Math.round(groupValue(this.areas, a => (a.text && a.text.size) ? a.text.size : 16))
    },
    textX() {
      return Math.round(groupValue(this.areas, a => a.text ? a.text.position.x : 0))
    },
    textY() {
      return Math.round(groupValue(this.areas, a => a.text ? a.text.position.y : 0))
    },
    width() {
      return Math.round(groupValue(this.areas, a => a.rectangle ? a.rectangle.width : 0))
    },
    height() {
      return Math.round(groupValue(this.areas, a => a.rectangle ? a.rectangle.height : 0))
    },
    radius() {
      return Math.round(groupValue(this.areas, a => a.circle ? a.circle.radius : 0))
    },
    radiusX() {
      return Math.round(groupValue(this.areas, a => a.ellipse ? a.ellipse.radius.x : 0))
    },
    radiusY() {
      return Math.round(groupValue(this.areas, a => a.ellipse ? a.ellipse.radius.y : 0))
    },
    rotate_val() {
      // console.log(typeof (this.areas[0].rotation), this.areas[0].rotation)
      if (this.areas[0].rotation) return this.areas[0].rotation;
      return 0;
    }
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
      // this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), rotation: parseInt(e.target.value) })
      const val = parseInt(e.target.value);
      const temp = val - this.rotate_val;
      this.temp_Rotate(temp);
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
