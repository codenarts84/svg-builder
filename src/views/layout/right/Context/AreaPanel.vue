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
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          Text </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          <input class=" v-custom-input" name="text_value" :value="textValue"
            @input="setText" maxlength="15" />
        </v-col>

        <v-col cols="12" sm="6"> Text size </v-col>
        <v-col cols="12" sm="6">
          <input type="number" min="1" class="v-custom-input" name="text_size"
            :value="textSize" @input="setTextSize" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          Text Color </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          <InputColor :color="textColor" :setColor="setTextColor" />
        </v-col>
        <!-- <v-col cols="12" sm="12" v-if="bTextColor">
          <v-color-picker class="v-color-picker" mode="hexa"
            v-model="text_color" />
        </v-col> -->
        <v-col cols="12" sm="6"
          v-if="shape === 'gaCircle' || shape === 'gaSquare' || shape === 'gaPolygon'">
          Text Color </v-col>
        <v-col cols="12" sm="6"
          v-if="shape === 'gaCircle' || shape === 'gaSquare' || shape === 'gaPolygon'">
          <select class="v-custom-input" :value="gaTextColor"
            @input="setGATextColor">
            <option v-for="(op, idx) in gaColorOptions" :key="idx"
              :value="op.name">
              {{ op.name }}
            </option>
          </select>
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          label Text position (x) </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          <input type="number" class="v-custom-input" name="text_x" :value="textX"
            @input="setTextX" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          label Text position (y) </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          <input type="number" class="v-custom-input" name="text_y" :value="textY"
            @input="setTextY" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape !== 'text' && shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          Stroke Width </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'text' && shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          <input type="number" min="0" class="v-custom-input" name="text_size"
            :value="borderWidth" @input="setBorderWidth" />
        </v-col>

        <v-col cols="12" sm="6"
          v-if="shape !== 'text' && shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          Stroke Color </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'text' && shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          <InputColor :color="borderColor" :setColor="setBorderColor" />
        </v-col>
        <!-- <v-col cols="12" sm="12" v-if="shape !== 'text'">
          <v-color-picker class="v-color-picker" mode="hexa"
            v-model="stroke_color" />
        </v-col> -->


        <v-col cols="12" sm="6"
          v-if="shape !== 'text' && shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          Fill Color </v-col>
        <v-col cols="12" sm="6"
          v-if="shape !== 'text' && shape !== 'gaCircle' && shape !== 'gaSquare' && shape !== 'gaPolygon'">
          <InputColor :color="color" :setColor="setColor" />
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<script>

import { usePlanStore } from '@/stores/plan';
import { ref } from 'vue'
import InputColor from '@/views/home/components/InputColor.vue'

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
  components: {
    InputColor
  },
  data() {
    const text_color = ref(groupValue(this.areas, a => a.text ? a.text.color : undefined))
    const fill_color = ref(groupValue(this.areas, a => a.color))
    const stroke_color = ref(groupValue(this.areas, a => a.border_color))
    const gaColorOptions = ref([
      { name: 'White', color: '#ffffff' },
      { name: 'Gray', color: '#333333' },
      { name: 'Black', color: '#000000' }
    ]);

    return {
      text_color,
      fill_color,
      stroke_color,
      gaColorOptions
    }
  },
  watch: {
    text_color(newValue, oldValue) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__color: newValue })
    },
    fill_color(newValue, oldValue) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), color: newValue })
    },
    stroke_color(newValue, oldValue) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), border_color: newValue })
    }
  },
  setup() {
    const planStore = usePlanStore();
    return {
      planStore,
    }
  },
  computed: {
    gaTextColor() {
      const value = this.gaColorOptions.find(item => item.color === groupValue(this.areas, a => a.text.color));
      return value.name;
    },
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
    setGATextColor(e) {
      const value = this.gaColorOptions.find(item => item.name === e.target.value);
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__color: value.color })
    },
    setColor(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), color: e })
    },
    setBorderColor(e) {
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), border_color: e })
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
      this.planStore.modifyAreas({ areaIds: this.areas.map(a => a.uuid), text__color: e })
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
