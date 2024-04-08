<template>
  <div id="chair-dropdown" style="width: 100%; height: 100%">
    <SeatBuilderIcon width="20px" height="20px" />
  </div>
  <v-menu location="end" activator="#chair-dropdown">
    <v-list style="left: 20px; top: -15px">
      <v-list-item @click="onClick">
        <v-list-item-title>
          <RowSingleIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <RowMultiIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <RowStaggedIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <GaSquareIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <TableRoundIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="onClick">
        <v-list-item-title>
          <TableRectIcon width="20px" height="20px" />
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import SeatBuilderIcon from "@/assets/svgs/menuIcons/SeatBuilderIcon.vue";
import RowSingleIcon from "@/assets/svgs/menuIcons/RowSingleIcon.vue";
import RowMultiIcon from "@/assets/svgs/menuIcons/RowMultiIcon.vue";
import RowStaggedIcon from "@/assets/svgs/menuIcons/RowStaggedIcon.vue";
import GaSquareIcon from "@/assets/svgs/menuIcons/GaSquareIcon.vue";
import TableRoundIcon from "@/assets/svgs/menuIcons/TableRoundIcon.vue";
import TableRectIcon from "@/assets/svgs/menuIcons/TableRectIcon.vue";

const onClick = () => alert("Not set yet");
</script>
