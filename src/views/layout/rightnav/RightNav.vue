<template>
  <v-navigation-drawer
    location="right"
    style="top: 64px; width: 300px; padding-bottom: 64px"
  >
    <RowComponent />
    <v-divider></v-divider>
    <ShapeComponent />
    <v-divider></v-divider>
    <SectionLabel />
    <v-divider></v-divider>
    <TagsComponent />
    <v-divider></v-divider>
    <RowLabeling />
    <v-divider></v-divider>
    <SeatLabeling />
  </v-navigation-drawer>
</template>

<script setup>
import RowComponent from "./RowComponent.vue";
import ShapeComponent from "./ShapeComponent.vue";
import SectionLabel from "./SectionLabel.vue";
import TagsComponent from "./TagsComponent.vue";
import RowLabeling from "./RowLabeling.vue";
import SeatLabeling from "./SeatLabeling.vue";
</script>
