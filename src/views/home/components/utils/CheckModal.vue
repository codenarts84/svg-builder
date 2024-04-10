<template>
  <v-btn class="btn" @click="dialog = true"
    ><v-icon color="black" icon="mdi-check-circle" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Validation</v-tooltip>
  </v-btn>
  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <v-card prepend-icon="mdi-check-circle" title="Chart Validation">
        <v-card-text>
          <v-chip class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            280 element(s) without category.
          </v-chip>
          <v-chip class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            280 element(s) without section.
          </v-chip>

          <v-chip class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            All elements contain label
          </v-chip>
          <v-chip class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            All elements contain abbreviation
          </v-chip>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref } from "vue";
// import { useBoardStore } from "../../../../stores/svgStore";

// const boardStore = useBoardStore();
const dialog = ref(false);
</script>
