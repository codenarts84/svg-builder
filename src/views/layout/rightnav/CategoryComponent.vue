<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Category</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Category </v-col>
        <v-col cols="12" sm="6">
          <select class="v-custom-input" @input="setCategory">
            <option v-for="op in category" :key="op">{{ op.name }}</option>
            <!-- <option>1</option>
            <option>2</option> -->
          </select>
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

export default defineComponent({
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
      this.planStore.modifySeats({ seatIds: this.seats.map(s => s.uuid), category: val.target.value })
    },
  },
  computed: {
  }
});
</script>