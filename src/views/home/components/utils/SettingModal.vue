<template>
  <v-btn class="btn" @click="dialog = true"><v-icon color="black" icon="mdi-cog"
      size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Settings</v-tooltip>
  </v-btn>
  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <v-card prepend-icon="mdi-cog" title="Chart Settings">
        <v-card-text>
          <v-text-field label="Chart Name*" required clearable v-model="boardName"
            @change="onChangeName"></v-text-field>
          <v-text-field label="Width*" required clearable v-model="boardWidth"
            @change="onChangeWidth"></v-text-field>
          <v-text-field label="Height*" required clearable v-model="boardHeight"
            @change="onChangeHeight"></v-text-field>

          <small class="text-caption text-medium-emphasis">*indicates required
            field</small>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

          <v-btn color="primary" text="Save" variant="tonal"
            @click="onSave"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useBoardStore } from "../../../../stores/svgStore";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
// import { usePlanStore } from "@/stores/plan";

const planstore = usePlanStore();
const plan = computed(() => planstore.plan);

const boardStore = useBoardStore();
const boardName = ref(plan.value.name);
const boardWidth = ref(plan.value.size.width);
const boardHeight = ref(plan.value.size.height);

const dialog = ref(false);

const onChangeName = (e) => (boardName.value = e.target.value);
const onChangeWidth = (e) => (boardWidth.value = e.target.value);
const onChangeHeight = (e) => (boardHeight.value = e.target.value);

const onSave = () => {
  if (!boardHeight.value || !boardWidth.value || !boardName.value) {
    alert("You need to fill all required fields");
    return;
  }
  planstore.setPlanSize(boardWidth, boardHeight);
  planstore.setPlanName(boardName.value);
  dialog.value = false;
};
</script>
