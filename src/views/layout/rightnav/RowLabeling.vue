<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Row Labeling</h4>
    <v-container>
      <v-row
        style="display: flex; justify-content: center; align-items: center"
      >
        <v-col cols="12" sm="6"> Row label </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            class="custom-small-text-field"
            variant="outlined"
            type="text"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6"> Row Label Location </v-col>
        <v-col cols="12" sm="6">
          <v-select
            :items="['Both', 'Right', 'Left']"
            density="compact"
          ></v-select>
        </v-col>
      </v-row>
    </v-container>
    <!-- <div v-if="rows.length > 1" class="row-numbers">
      <div class="group-title">
        <span>Row numbers</span>
      </div>
      <div class="toolbox-row">
        <label>Numbering</label>
        <select
          class="toolbox-input"
          v-model="selectedRowNumberingSchemeId"
          @change="updateRowNumbering"
        >
          <option
            v-for="option in rowNumberings"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      <div class="toolbox-row">
        <label>Starting at</label>
        <input
          type="number"
          class="toolbox-input"
          v-model.number="startingAt"
          @change="updateStartingAt"
        />
      </div>
      <div class="toolbox-row">
        <label>Reversed</label>
        <input
          type="checkbox"
          class="toolbox-input"
          v-model="isReversed"
          @change="updateReversed"
        />
      </div>
    </div> -->
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
