<template>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <h4>Categories</h4>
    <v-btn class="btn" @click="dialog = true" size="small" variant="flat"
      style="padding: 0px"><v-icon icon="mdi-cog"></v-icon>Manage
    </v-btn>
  </div>
  <div class="text-center">
    <v-dialog v-model="dialog" width="600">
      <v-card class="v-card-container">
        <div class="close-btn">
          <v-btn density="comfortable" icon="$close" variant="plain"
            @click="dialog = false"></v-btn>
        </div>
        <div class="text-center">
          <h2 class="category-title">Categories</h2>
          <p class="category-description">
            Categories are used to alert users of different pricing options
            available. Example, If most seats are Standard Pricing of Adult $12
            and
            Child $8 but your front 2 rows are Premium with Adult $15 and Child
            $13,
            Create one Premium category and one Standard category for your chart.
          </p>
        </div>
        <div class="widget-container">
          <div class="widget-body">
            <button type="button" class="add-button" id="addRow"
              @click="handle_create_category">+ Create new
              category</button>
            <table>
              <tr v-for="(ca, idx) in categories" :key="ca">
                <td class="color-container-td">
                  <ColorPicker :setColor="setColor" :selected="ca.color"
                    :index="idx" :setToggle="setToggle" :clearToggle="clearToggle"
                    :toggle="toggle[idx]" />
                </td>
                <td class="input-container-td">
                  <input class="category-input" type="text" name="inputForm"
                    :value="ca.name" ref="categoryInput"
                    @input="(e) => handle_change_name(e, idx)">
                </td>
                <td class="delete-container-td">
                  <div class="delete-container-div">
                    <v-btn v-if="delete_btn(idx)" density="comfortable"
                      icon="$delete" variant="plain"
                      @click="() => handle_delete(idx)"></v-btn>
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
import { ref, defineProps, computed, defineComponent, nextTick } from "vue";
import { usePlanStore } from '@/stores/plan.js'
import DropDown from '../../home/components/DropDown.vue';
import ColorPicker from "./ColorPicker.vue";
import { isoFormat } from "d3";
const dialog = ref(false);

const components = defineComponent({
  DropDown
})

const colors = [
  '#2b68e8',
  '#2144ac',
  '#646bee',
  '#21a6e6',
  '#106a9f',
  '#1992a1',
  '#20b6d2',
  '#25b8a6',
  '#2fc463',
  '#1d7f40',
  '#86ca2e',
  '#67a221',
  '#f39d2a',
  '#d77720',
  '#f7732a',
  '#bc173f',
  '#df224c',
]

const toggle = ref(Array(colors.length).fill(false));

const setToggle = (idx) => {
  const value = toggle.value[idx];
  clearToggle();
  toggle.value[idx] = !value
}

const clearToggle = () => {
  toggle.value = Array(colors.length).fill(false);
}

const props = defineProps({
});

const planStore = usePlanStore();
const cates = computed(() => planStore.categories);

const categories = ref(cates);


const assigned_category = (categoryName) => {
  for (const z of planStore._plan.zones) {
    for (const r of z.rows) {
      for (const s of r.seats) {
        if (s?.category === categoryName) return false;
      }
    }
    for (const a of z.areas) {
      if (a.seats) {
        for (const s of a.seats)
          if (s?.category === categoryName) return false;
      } else {
        if (a.category === categoryName) return false;
      }
    }
  }
  return true;
}

const delete_btn = ((idx) => {
  const bStatus = assigned_category(categories.value[idx].name);
  return bStatus;
})


const handle_change_name = (e, idx) => {
  // if (categories.value.find(c => c.name === e.target.value)) {
  //   alert('Already exist')
  //   e.target.value = '';
  //   return;
  // }
  planStore.changeCategory(categories.value[idx].name, e.target.value, categories.value[idx].color);
}

const setColor = (color, idx) => {
  planStore.changeCategory(categories.value[idx].name, categories.value[idx].name, color);
}

const handle_delete = (idx) => {
  planStore.deleteCategory(categories.value[idx].name);
}

const handle_create_category = () => {
  if (categories.value.length === 17) {
    alert('Can not add category anymore')
    return;
  }
  const len = colors.length;
  let color = null;
  while (!color) {
    const rand = Math.floor(Math.random() * len);
    color = colors[rand]
    if ((categories.value.findIndex(item => item.color === color)) === -1) break;
  }
  const newName = getUniqueCategoryName('New Category');
  planStore.createCategory(newName, color);
  nextTick(() => {
    const allCategoryInput = document.querySelectorAll('.category-input')
    const cnt = allCategoryInput.length;
    allCategoryInput[cnt - 1].select();
  })
}

const getUniqueCategoryName = name => {
  let newName = name;
  let counter = 1;
  while (categories.value.some(category => category.name === newName)) {
    newName = `${name} ${counter}`;
    counter++;
  }
  return newName;
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

.category-input {
  width: 100%;
  padding: 6px 10px;
  margin: 8px 0;
  box-sizing: border-box;
  border: none;
  border-radius: 5px;
}

.category-input:focus {
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
  padding: 0 10px;
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

.close-btn {
  display: flex;
  justify-content: flex-end;
}
</style>