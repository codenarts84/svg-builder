<template>
  <div id="align-dropdown" style="width: 100%; height: 100%">
    <ObjAlignCenterVertical width="20px" height="20px" />
  </div>
  <v-menu location="end" activator="#align-dropdown">
    <v-list style="left: 20px; top: -10px">
      <!-- <v-list-item @click="onClick">
        <v-list-item-title>
          <ObjAlignCenterVertical width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item> -->

      <v-list-item @click="onClick">
        <v-list-item-title>
          <ObjAlignCenterHorizentalIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <ObjAlignLeftIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <ObjAlignRightIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <FlipVertIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <FlipHoriIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <DistHoriIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <DistVertIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import ObjAlignCenterVertical from "@/assets/svgs/menuIcons/ObjAlignCenterVertical.vue";
import ObjAlignCenterHorizentalIcon from "@/assets/svgs/menuIcons/ObjAlignCenterHorizentalIcon.vue";
import ObjAlignLeftIcon from "@/assets/svgs/menuIcons/ObjAlignLeftIcon.vue";
import ObjAlignRightIcon from "@/assets/svgs/menuIcons/ObjAlignRightIcon.vue";
import FlipVertIcon from "@/assets/svgs/menuIcons/FlipVertIcon.vue";
import FlipHoriIcon from "@/assets/svgs/menuIcons/FlipHoriIcon.vue";
import DistHoriIcon from "@/assets/svgs/menuIcons/DistHoriIcon.vue";
import DistVertIcon from "@/assets/svgs/menuIcons/DistVertIcon.vue";

const onClick = () => alert("Not set yet");
</script>
