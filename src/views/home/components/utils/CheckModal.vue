<template>
  <v-btn class="btn" @click="onClick">
    <v-icon v-if="!isValid && !validateSeatSection && !validatePosition"
      color="green" icon="mdi-check-circle" size="large"></v-icon>
    <v-icon v-else color="red" icon="mdi-close-circle" size="large"></v-icon>
    <v-tooltip activator="parent" location="bottom">Validation</v-tooltip>
  </v-btn>
</template>
<script setup>
import { ref, computed } from "vue";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";

const plan = computed(() => usePlanStore().plan)
const validationErrors = computed(() => usePlanStore().validationPlan());
const section_label = computed(() => useMainStore().section_label)
const bvalid = computed(() => useMainStore().bvalid);
const mainStore = useMainStore();

const onClick = () => {
  mainStore.setBvalid(!bvalid.value);
}

const isValid = computed(() => {
  return validationErrors.value.isValid;
})

const validatePosition = computed(() => {
  return usePlanStore().validatePosition();
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

const dialog = ref(false);
const status = ref(false);

</script>
