<template>
  <v-toolbar-items class="border-left">
    <v-btn color="primary" style="margin-left: 10px" @click="reset"
      ><v-icon color="black" icon="mdi-file" size="large"></v-icon>
      <v-tooltip activator="parent" location="bottom">New</v-tooltip>
    </v-btn>
    <v-btn class="btn" @click="onImport">
      <v-icon color="black" icon="mdi-folder" size="large"></v-icon>
      <v-tooltip activator="parent" location="bottom">Import</v-tooltip>
    </v-btn>
  </v-toolbar-items>
</template>
<script setup>
import { defineProps, ref, computed } from "vue";
import { useMainStore } from "@/stores";
import sampleplan from "@/sampleplan";
// import ImportIcon from "@/assets/svgs/menuIcons/ImportIcon.vue";
const store = useMainStore();
const props = defineProps({
  onImportClick: Function,
});

const tool = ref(computed(() => store.tool));

const changeTool = (tool) => store.changeTool(tool);
const reset = () => {
  if (
    window.confirm(
      "Do you want to start a new plan? Your current plan will be discarded."
    )
  ) {
    const store = useMainStore();
    store.loadPlan(sampleplan.sampleplan);
  }
};

// const onImport = () => props.onImportClick();
</script>
