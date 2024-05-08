<template>
  <v-toolbar-items class="border-left">
    <v-btn color="primary" style="margin-left: 10px" @click="reset"><v-icon
        color="black" icon="mdi-file" size="large"></v-icon>
      <v-tooltip activator="parent" location="bottom">New</v-tooltip>
    </v-btn>
    <v-btn class="btn" @click="onImport">
      <v-icon color="black" icon="mdi-folder" size="large"></v-icon>
      <v-tooltip activator="parent" location="bottom">Import</v-tooltip>
    </v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { useMainStore } from "@/stores";
import sampleplan from "@/sampleplan";
import Ajv from 'ajv'
import schema from '@/schema/seating-plan.schema.json'
// import ImportIcon from "@/assets/svgs/menuIcons/ImportIcon.vue";
const store = useMainStore();

const reset = () => {
  if (
    window.confirm(
      "Do you want to start a new plan? Your current plan will be discarded."
    )
  ) {
    const store = useMainStore();
    localStorage.clear("frontrow2.editor.plan");
    location.reload();
    store.loadPlan(sampleplan.sampleplan);
  }
};

const onImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      let data
      try {
        data = JSON.parse(fileReader.result)
      } catch {
        alert('Failed to load file (not a JSON file)')
        return
      }
      const ajv = new Ajv({
        allErrors: true,
        verbose: true,
      })
      Promise.resolve(ajv.validate(schema, data)).then((valid) => {
        if (valid || ajv.errors.every((e) => e.keyword === "additionalProperties")) {
          store.loadPlan(JSON.parse(fileReader.result))
        } else {
          console.log(ajv.errors)
          alert('Failed to load file (invalid seating plan)')
        }
      })
    }
    fileReader.readAsText(input.files[0])
  }
  input.click()
}
</script>
