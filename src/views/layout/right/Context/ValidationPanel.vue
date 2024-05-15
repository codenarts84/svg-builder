<template>
  <div style="padding: 15px 10px; text-align: left">
    <v-row class="mb-2">
      <v-col class="d-flex align-center">
        <h1 style="font-size: 16px; font-weight: bold; margin-right: auto;">
          Validation
        </h1>
        <v-btn icon @click="onClose"
          style="min-width: 0; width: 24px; height: 24px; background-color: transparent; box-shadow: none;">
          <v-icon small style="color: rgba(0, 0, 0, 0.6);">mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-container>
      <v-row>
        <v-col cols="12" md="12">

          <v-chip v-if="validateCategory" class="ma-2" color="red" closable label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateCategory} element(s) without category.` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All elements contain category.' }}
          </v-chip>

          <v-chip v-if="validateSection" class="ma-2" color="red" closable label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSection} element(s) without section.` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All elements contain section.' }}
          </v-chip>

          <v-chip v-if="validateSeatId" class="ma-2" color="red" closable label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSeatId} duplicate element(s)` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'No duplicate elements' }}
          </v-chip>

          <v-chip v-if="validateTableLabel" class="ma-2" color="red" closable
            label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateTableLabel} table seat(s) without table label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All table seats contain table label' }}
          </v-chip>

          <v-chip v-if="validateTableAbv" class="ma-2" color="red" closable label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateTableAbv} table seat(s) without table abbreviation` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All table seats contain table abbreviation' }}
          </v-chip>

          <v-chip v-if="validateCapacity" class="ma-2" color="red" closable label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateCapacity} GA sections without capacity` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All GA sections has capacity' }}
          </v-chip>

          <v-chip v-if="validateSectionLabel" class="ma-2" color="red" closable
            label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSectionLabel} GA section(s) without label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All GA sections contain label' }}
          </v-chip>

          <v-chip v-if="validateSectionAbv" class="ma-2" color="red" closable
            label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSectionAbv} GA section(s) without abbreviation` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All GA sections contain abbreviation' }}
          </v-chip>

          <v-chip v-if="validateSeatLabel" class="ma-2" color="red" closable
            label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSeatLabel} seat(s) without label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All seats contain label' }}
          </v-chip>

          <v-chip v-if="validateRowLabel" class="ma-2" color="red" closable label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateRowLabel} row(s) without label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'All rows contain label' }}
          </v-chip>

          <v-chip v-if="validateSeatSection" class="ma-2" color="red" closable
            label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `${validateSeatSection} seat(s) duplicate seat label` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'No seats duplicate seat label' }}
          </v-chip>

          <v-chip v-if="validatePosition" class="ma-2" color="red" closable label>
            <v-icon icon="mdi-close" start></v-icon>
            {{ `Some seats are on top of another seat` }}
          </v-chip>
          <v-chip v-else class="ma-2" color="green" closable label>
            <v-icon icon="mdi-check" start></v-icon>
            {{ 'No seat is on top of another seat' }}
          </v-chip>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePlanStore } from "@/stores/plan";
import { useMainStore } from "@/stores";

const planstore = usePlanStore();
const validationErrors = computed(() => planstore.validationPlan());
const plan = computed(() => planstore.plan)
const section_label = computed(() => useMainStore().section_label)

const onClose = () => {
  useMainStore().setBvalid(false);
}

const validatePosition = computed(() => {
  return planstore.validatePosition();
})

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


const validateSeatSection = computed(() => {
  let nSection = 0;
  section_label.value.forEach(section => {
    for (const z of plan.value.zones) {
      const temp = []
      for (const r of z.rows) {
        for (const s of r.seats) {
          if (s.section_label === section.label)
            temp.push(`${r.row_number}${s.seat_number}`)
        }
      }
      const tt = [...new Set(temp)];
      nSection += (temp.length - tt.length);
    }
  })
  return nSection;
})

</script>

<style>
.v-chip {
  height: auto !important;
}

.v-chip .v-chip__content {
  max-width: 100%;
  height: auto;
  min-height: 32px;
  white-space: pre-wrap;
}
</style>