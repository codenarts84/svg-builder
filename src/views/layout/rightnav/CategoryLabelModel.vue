<template>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <h4>Categories</h4>
    <v-btn class="btn" @click="dialog = true" size="small" variant="standard"
      style="padding: 0px"><v-icon color="black" icon="mdi-plus"
        size="large"></v-icon>
    </v-btn>
  </div>
  <div class="text-center">
    <v-dialog v-model="dialog" width="600">
      <v-card class="v-card-container">
        <div class="text-center">
          <v-btn @click="dialog = false">
            <v-icon icon="mdi-close"></v-icon>
          </v-btn>
          <h2 class="category-title">Categories</h2>
          <p class="category-description">Categories can have pricing assigned
            when rendering the chart for a
            specific event, thus defining the pricing for objects assigned to each
            category</p>
        </div>
        <div class="widget-container">
          <div class="widget-body">
            <button type="button" class="add-button" id="addRow"
              @click="handle_create_category">+ Create new
              category</button>
            <table>
              <tr v-for="(ca, idx) in categories" :key="ca">
                <td class="left-container-td"></td>
                <td class="color-container-td">
                  <div class="colorcontainer"><input type="color"
                      :value="ca.color"
                      @input="(e) => handle_change_color(e, idx)" />
                  </div>
                </td>
                <td class="input-container-td"><input type="text" name="inputForm"
                    :value="ca.name" @input="(e) => handle_change_name(e, idx)">
                </td>
                <td class="delete-container-td">
                  <div class="delete-container-div">
                    <v-btn @click="() => handle_delete(idx)">
                      <v-icon icon="mdi-delete"></v-icon>
                    </v-btn>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import { ref, defineProps, computed } from "vue";
import { v4 as uuid } from "uuid";
import { usePlanStore } from '@/stores/plan.js'
const dialog = ref(false);

const props = defineProps({
});

const planStore = usePlanStore();
const categories = computed(() => planStore.categories);


const handle_change_name = (e, idx) => {
  // if (categories.value.findIndex(i => i.name === e.target.value) === -1) {
  planStore.changeCategory(categories.value[idx].name, e.target.value, categories.value[idx].color);
  // } else {
  //   alert('Category is already exist')
  // }
}

const handle_change_color = (e, idx) => {
  planStore.changeCategory(categories.value[idx].name, categories.value[idx].name, e.target.value);
}

const handle_delete = (idx) => {
  planStore.deleteCategory(categories.value[idx].name);
}

const handle_create_category = () => {
  let color = Math.floor(Math.random() * 16777215).toString(16);
  if (categories.value.findIndex(i => i.name === 'New Category') === -1) {
    planStore.createCategory('New Category', `#${color}`)
  } else {
    alert('Category is already exist')
  }
}
</script>


<style>
.v-card-container {
  padding: 40px 30px;
}

.widget-container {
  padding-top: 50px;
  margin: auto;
  width: 80%;
  display: flex;
  justify-content: center;
}

.widget-body {
  width: 500px;
}

.colorcontainer {
  width: 20px;
  height: 20px;
  border-radius: 50px;
  overflow: hidden;
}

.colorcontainer>input[type='color'] {
  opacity: 1;
  width: 160px;
  height: 160px;
  background: #FFFFFF 0% 0% no-repeat padding-box;
  box-shadow: 0px 3px 6px #0000001A;
  padding: 0;
  margin: -30px 0 0 -30px;
}

.add-button {
  background-color: transparent;
  color: #3d9ffb;
  border: none;
  font-size: 18px;
  font-weight: bold;
}

input[type=text] {
  width: 100%;
  padding: 6px 10px;
  margin: 8px 0;
  box-sizing: border-box;
  border: none;
  border-radius: 5px;
}

input[type=text]:focus {
  outline: 3px solid #bae0ff;
}

table {
  border-collapse: collapse;
  width: 100%;
}

table,
th,
td {
  border-bottom: 1px solid #ccc;
}

td {
  vertical-align: middle;
}

.left-container-td {
  width: 15%;
}

.color-container-td {
  width: 25px;
}

.input-container-td {
  width: calc(75% - 25px);
}

.delete-container-td {
  width: 10%;
}

.delete-container-div {
  width: 100%;
  display: flex;
  justify-content: center;
}

.category-description {
  color: #8b8b8b;
  font-size: 12px;
  margin: 0 20px;
}

.category-title {
  margin: 10px 0;
}
</style>