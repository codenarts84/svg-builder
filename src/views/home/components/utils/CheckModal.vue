<template>
  <v-btn class="btn" @click="dialog = true"><v-icon v-if="status == true"
      color="green" icon="mdi-check-circle" size="large"></v-icon>
    <v-icon v-if="status == false" color="red" icon="mdi-close-circle"
      size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Validation</v-tooltip>
  </v-btn>
  <div class="text-center">
    <v-dialog v-model="dialog" width="500">
      <v-card title="Chart Validation">
        <v-card-text>
          <v-chip v-if="validateCategory" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateCategory} element(s) without category.` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All elements contain category.' }}
          </v-chip>

          <v-chip v-if="validateSection" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSection} element(s) without section.` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All elements contain section.' }}
          </v-chip>

          <v-chip v-if="validateSeatId" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSeatId} duplicate element(s)` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'No duplicate elements' }}
          </v-chip>

          <v-chip v-if="validateTableLabel" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateTableLabel} table seat(s) without table label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All table seats contain table label' }}
          </v-chip>

          <v-chip v-if="validateTableAbv" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateTableAbv} table seat(s) without table abbreviation` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All table seats contain table abbreviation' }}
          </v-chip>

          <v-chip v-if="validateCapacity" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateCapacity} sections without capacity` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All sections contain capacity' }}
          </v-chip>

          <v-chip v-if="validateSectionLabel" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSectionLabel} section(s) without label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All sections contain label' }}
          </v-chip>

          <v-chip v-if="validateSectionAbv" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSectionAbv} section(s) without abbreviation` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All sections contain abbreviation' }}
          </v-chip>

          <v-chip v-if="validateSeatLabel" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSeatLabel} seat(s) without label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All seats contain label' }}
          </v-chip>

          <v-chip v-if="validateRowLabel" class="ma-2" color="red" label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateRowLabel} row(s) without label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All rows contain label' }}
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
import { ref, computed } from "vue";
import { usePlanStore } from "@/stores/plan";
// import { useBoardStore } from "../../../../stores/svgStore";

// const boardStore = useBoardStore();
const plan = usePlanStore();
const validationErrors = computed(() => plan.validationPlan());

const validateCategory = computed(() => {
  return validationErrors.value.category;
})

const validateSection = computed(() => {
  return validationErrors.value.section;
})

const validateSeatId = computed(() => {
  return validationErrors.value.seatId;
})

const validateTableLabel = computed(() => {
  return validationErrors.value.tableLabel;
})

const validateTableAbv = computed(() => {
  return validationErrors.value.tableAbv;
})

const validateCapacity = computed(() => {
  return validationErrors.value.capacity;
})

const validateSectionLabel = computed(() => {
  return validationErrors.value.sectionLabel;
})

const validateSectionAbv = computed(() => {
  return validationErrors.value.sectionAbv;
})

const validateSeatLabel = computed(() => {
  return validationErrors.value.seatLabel;
})

const validateRowLabel = computed(() => {
  return validationErrors.value.rowLabel;
})

const dialog = ref(false);
const status = ref(false);

</script>
