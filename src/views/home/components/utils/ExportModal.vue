<template>
  <v-btn class="btn" @click="dialog = true"
    ><v-icon color="black" icon="mdi-download" size="large"></v-icon>Export
  </v-btn>
  <div class="text-center">
    <v-dialog v-model="dialog" width="400">
      <v-card prepend-icon="mdi-download" title="Save / Email Chart">
        <v-card-text>
          Once your chart is complete, download the chart file so it can be
          imported into BookTix. A copy of the chart is also emailed to you
          based on the below email address.
          <v-text-field
            label="Email Address"
            required
            clearable
            v-model="emailAddress"
            @change="onChangeEmail"
            style="margin-top: 30px"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text="Download & Email"
            variant="tonal"
            @click="onSave"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, defineProps } from "vue";
// import { useBoardStore } from "../../../../stores/svgStore";

// const boardStore = useBoardStore();
const dialog = ref(false);
const emailAddress = ref("hereis.topdev@gmail.com");
const onChangeEmail = (v) => (emailAddress.value = v.target.value);
const props = defineProps({
  export: Function,
});
const onSave = () => {
  props.export();
  dialog.value = false;
};
</script>
