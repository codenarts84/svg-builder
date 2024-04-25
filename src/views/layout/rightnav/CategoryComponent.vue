<template>
  <div style="padding: 15px 10px; text-align: left">
    <CategoryLabelModel />
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="12">
          <!-- <select class="v-custom-input" @input="setCategory">
            <option v-for="op in category" :key="op" :value="op.name">
              {{ op.name }}
            </option>
          </select> -->
          <DropDown :selection="selectedItem" :options="category"
            :setCategory="setCategory" />
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
import { defineComponent, computed, ref, withDirectives } from 'vue';
import { usePlanStore } from '@/stores/plan';
import CategoryLabelModel from './CategoryLabelModel.vue'
import DropDown from '../../home/components/DropDown.vue';

export default {
  components: {
    CategoryLabelModel,
    DropDown
  },
  props: {
    seats: Array,
  },
  data() {
    return {
    }
  },
  setup() {
    const planStore = usePlanStore();
    const category = planStore.categories;
    return {
      planStore,
      category
    };
  },
  methods: {
    setCategory(val) {
      this.planStore.modifySeats({ seatIds: this.seats.map(s => s.uuid), category: val })
    },
  },
  computed: {
    selectedItem() {
      if (this.category) {
        return this.category.find(i => this.seats[0].category === i.name)
      }
      return ''
    }
  }
};
</script>
