<template>
  <v-btn class="btn" @click="onClick"><v-icon color="black" icon="mdi-download"
      size="large"></v-icon>Export
  </v-btn>
  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <v-card prepend-icon="mdi-download" title="Save / Email Chart">
        <v-card-text>
          Once your chart is complete, download the chart file so it can be
          imported into BookTix. A copy of the chart is also emailed to you
          based on the below email address.
          <v-text-field label="Email Address" required clearable
            v-model="emailAddress" @change="onChangeEmail"
            style="margin-top: 30px"></v-text-field>

          <!-- <v-text-field label="Service ID" required clearable v-model="serviceID"
            style="margin-top: 30px" placeholder="service_jv2oiml"></v-text-field>

          <v-text-field label="Template ID" required clearable
            v-model="templateID" style="margin-top: 30px"
            placeholder="template_60b0p0p"></v-text-field>

          <v-text-field label="Public Key" required clearable v-model="key"
            style="margin-top: 30px"
            placeholder="yAHgq8gPUad2EXNq2"></v-text-field> -->
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text="Download & Email" variant="tonal"
            @click="onSave"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from "vue";
import { usePlanStore } from "@/stores/plan"
import { useToast } from "vue-toastification";
// import { useBoardStore } from "../../../../stores/svgStore";

// const boardStore = useBoardStore();
const dialog = ref(false);
const plan = usePlanStore();
const emailAddress = ref("hereis.topdev@gmail.com");
const key = ref("");
const templateID = ref("");
const serviceID = ref("");
const onChangeEmail = (v) => (emailAddress.value = v.target.value);
const isValid = computed(() => plan.validationPlan().isValid);
const props = defineProps({
  export: Function,
});
const onSave = () => {
  props.export(emailAddress.value);
  // props.export(emailAddress.value, serviceID.value, templateID.value, key.value);
  dialog.value = false;
};

const toast = useToast();

const onClick = () => {
  if (!isValid.value) {
    dialog.value = true
  } else {
    toast.error("Validation Error!", {
      timeout: 1000
    });
  }
}
</script>
