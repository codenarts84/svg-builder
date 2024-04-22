<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Shape</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="6"> Rotate </v-col>
        <v-col cols="12" sm="6">
          <!-- <v-text-field
            class="custom-small-text-field"
            variant="outlined"
            type="number"
            density="compact"
          ></v-text-field> -->
          <input class="custom-small-text-field" type="number" name="rotate" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style>
.v-input__details {
  display: none;
}

.v-col-sm-6 {
  padding: 5px;
}
</style>
