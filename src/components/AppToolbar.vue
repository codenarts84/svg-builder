<template>
  <v-toolbar flat>
    <v-toolbar-title>SVG Editor</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <!-- <v-file-input
        label="File input"
        prepend-icon="mdi-camera"
        variant="filled"
        type="file"
        accept=".svg"
        @change="$emit('importSVG')"
      ></v-file-input> -->
      <v-btn class="btn" @click="$emit('downloadSVG')">
        <v-icon
          color="green-darken-2"
          icon="mdi-download"
          size="large"
        ></v-icon>
      </v-btn>
      <v-btn class="btn" @click="$emit('zoomIn')">
        <v-icon
          color="green-darken-2"
          icon="mdi-magnify-plus"
          size="large"
        ></v-icon
      ></v-btn>
      <v-btn class="btn" @click="$emit('zoomOut')">
        <v-icon
          color="green-darken-2"
          icon="mdi-magnify-minus"
          size="large"
        ></v-icon
      ></v-btn>
    </v-toolbar-items>
    <v-toolbar-items>
      <v-btn class="btn" @click="$emit('addTextField')">
        <v-icon color="green-darken-2" icon="mdi-pen-plus" size="large"></v-icon
      ></v-btn>
      <v-btn class="btn" @click="$emit('addRectangle')"
        ><v-icon
          color="green-darken-2"
          icon="mdi-shape-rectangle-plus"
          size="large"
        ></v-icon
      ></v-btn>

      <v-btn class="btn" @click="$emit('addEllipse')"
        ><v-icon
          color="green-darken-2"
          icon="mdi-shape-circle-plus"
          size="large"
        ></v-icon></v-btn
      ><v-btn class="btn" @click="$emit('removeItem')"
        ><v-icon color="green-darken-2" icon="mdi-delete" size="large"></v-icon
      ></v-btn>
    </v-toolbar-items>
    <v-toolbar-items>
      <v-btn class="btn" @click="$emit('textL')"
        ><v-icon
          color="green-darken-2"
          icon="mdi-format-align-left"
          size="large"
        ></v-icon>
      </v-btn>
      <v-btn class="btn" @click="$emit('textC')">
        <v-icon
          color="green-darken-2"
          icon="mdi-format-align-center"
          size="large"
        ></v-icon>
      </v-btn>
      <v-btn class="btn" @click="$emit('textR')"
        ><v-icon
          color="green-darken-2"
          icon="mdi-format-align-right"
          size="large"
        ></v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
export default {
  name: "AppToolbar",
};
</script>

<style>
.app-toolbar {
  background-color: #eee;
  padding: 10px;
  display: flex;
  gap: 10px;
  /* Additional styling */
}
</style>
