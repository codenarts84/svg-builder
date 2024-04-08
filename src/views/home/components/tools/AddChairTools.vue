<template>
  <v-icon
    color="black"
    icon="mdi-seat"
    size="large"
    id="chair-dropdown"
  ></v-icon>
  <v-menu location="end" activator="#chair-dropdown">
    <v-list style="left: 20px">
      <v-list-item @click="onClick">
        <v-list-item-title>
          <v-icon color="black" icon="mdi-sofa-single" size="large"></v-icon>
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
const onClick = () => alert("Not set yet");
</script>
