<template>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <h4>Categories</h4>
    <v-btn class="btn" @click="dialog = true" size="small" variant="flat"
      style="padding: 0px"><v-icon icon="mdi-cog"></v-icon>Manage
    </v-btn>
  </div>
  <div class="text-center">
    <v-dialog v-model="dialog" width="600" persistent>
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
              @click="onCreate">+ Create new
              category</button>
            <table>
              <tr v-for="(ca, idx) in categories" :key="idx">
                <td class="color-container-td">
                  <ColorPicker :setColor="setColor" :selected="ca.color"
                    :index="idx" :setToggle="setToggle" :clearToggle="clearToggle"
                    :toggle="toggle[idx]" />
                </td>
                <td class="input-container-td">
                  <input class="category-input" :class="{ 'invalid': valid }"
                    type=" text" name="inputForm" :defaultValue="ca.name"
                    ref="categoryInput" @input="(e) => onChange(e, idx)"
                    @blur="(e) => onBlur(e, idx)" />
                </td>
                <td class="delete-container-td">
                  <div class="delete-container-div">
                    <v-btn v-if="deleteBtnShow(idx)" density="comfortable"
                      icon="$delete" variant="plain"
                      @click="() => handle_delete(idx)"></v-btn>
                  </div>
                </td>
              </tr>
            </table>
            <div class="actions">
              <v-btn color="green" @click="onSave">Submit</v-btn>
              <v-btn color="red" @click="onDiscard">Discard</v-btn>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import { ref, defineProps, computed, defineComponent, nextTick, onMounted } from "vue";
import { usePlanStore } from '@/stores/plan.js'
import { categoryColors } from "@/lib/colors";
import ColorPicker from "./ColorPicker.vue";
const dialog = ref(false);
const valid = ref(false)
const colors = categoryColors;

const planStore = usePlanStore();

const categories = ref(computed(() => planStore.categories));
const addCategories = ref([]);
const deleteCategories = ref([]);

const toggle = ref(Array(colors.length).fill(false));
const setToggle = (idx) => {
  const value = toggle.value[idx];
  clearToggle();
  toggle.value[idx] = !value
}
const clearToggle = () => {
  toggle.value = Array(colors.length).fill(false);
}

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


const deleteBtnShow = ((idx) => {
  const bStatus = assigned_category(categories.value[idx].name);
  return bStatus;
})

const onBlur = (e, idx) => {
  if (!valid.value && e.target.value) {
    planStore.changeCategory(categories.value[idx].name, e.target.value, categories.value[idx].color);
  } else {
    const allCategoryInput = document.querySelectorAll('.category-input')
    allCategoryInput[idx].select();
  }
}

const onChange = (e, idx) => {
  valid.value = categories.value.findIndex(i => i.name === e.target.value) !== -1;
}

const setColor = (color, idx) => {
  planStore.changeCategory(categories.value[idx].name, categories.value[idx].name, color);
}

const handle_delete = (idx) => {
  planStore.deleteCategory(categories.value[idx].name);
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

const onCreate = () => {
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
  addCategories.value.push(newName);
  nextTick(() => {
    const allCategoryInput = document.querySelectorAll('.category-input')
    const cnt = allCategoryInput.length;
    allCategoryInput[cnt - 1].select();
  })
}

const onSave = () => {
  dialog.value = false;
}

const onDiscard = () => {
  // addCategories.value.forEach(cat => planStore.deleteCategory(cat));
  // addCategories.value = []
  dialog.value = false;
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

.error {
  border: 1px solid red;
}

.error-msg {
  color: red;
}

.category-input:focus {
  outline: 3px solid #bae0ff;
}

.category-input.invalid:focus {
  outline: 3px solid red;
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

.widget-body>.actions {
  text-align: center;
}

.widget-body>.actions>button {
  text-transform: capitalize !important;
  margin: 20px 30px 0;
}
</style>