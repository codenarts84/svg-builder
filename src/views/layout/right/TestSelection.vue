<template>
  <v-app>
    <v-main>
      <v-btn @click="dialog = true">Open Dialog</v-btn>
      <v-dialog v-model="dialog" max-width="600" class="bg-color">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">Open Dialog</v-btn>
        </template>
        <v-card>
          <v-card-title class="headline">Dialog Title</v-card-title>
          <v-card-text>
            Dialog content goes here.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
    };
  },
};
</script>

<style scoped>
.bg-color {
  background-color: transparent !important;
}
</style>