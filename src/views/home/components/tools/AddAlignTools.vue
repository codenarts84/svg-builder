<template>
  <div id="align-dropdown" style="width: 100%; height: 100%">
    <ObjAlignCenterVertical width="20px" height="20px" />
  </div>
  <v-menu location="end" activator="#align-dropdown">
    <v-list style="left: 20px">
      <v-list-item @click="onClick">
        <v-list-item-title>
          <ObjAlignCenterVertical width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <v-icon color="black" icon="mdi-sofa" size="large"></v-icon>
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <v-icon color="black" icon="mdi-chair-rolling" size="large"></v-icon>
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <v-icon
            color="black"
            icon="mdi-table-furniture"
            size="large"
          ></v-icon>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import ObjAlignCenterVertical from "@/assets/svgs/menuIcons/ObjAlignCenterVertical.vue";

const onClick = () => alert("Not set yet");
</script>
