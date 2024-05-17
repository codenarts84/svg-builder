<template>
  <v-list v-if="props.opened" id="item-tools">
    <v-list-item @click="changeTool('text')"
      :class="tool == 'text' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Text</v-tooltip>
        <v-icon color="black" icon="mdi-pen-plus" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('rectangle')"
      :class="tool == 'rectangle' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Rectangle</v-tooltip>
        <v-icon color="black" icon="mdi-shape-rectangle-plus"
          size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('circle')"
      :class="tool == 'circle' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Circle</v-tooltip>

        <v-icon color="black" icon="mdi-shape-circle-plus" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('ellipse')"
      :class="tool == 'ellipse' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Ellipse</v-tooltip>

        <v-icon color="black" icon="mdi-ellipse-outline" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('polygon')"
      :class="tool == 'polygon' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Polygon</v-tooltip>

        <v-icon color="black" icon="mdi-shape-polygon-plus" size="large"></v-icon>
      </v-list-item-title>
    </v-list-item>

    <v-list-item @click="changeTool('icon'); dialog = true;"
      :class="tool == 'icon' ? 'current-tool' : ''">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Insert Icon</v-tooltip>
        <insert-icon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="headline">Icon Gallery</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col v-for="(icon, index) in icons" :key="index" cols="12" sm="4">
                <v-card class="mx-auto" max-width="250" @click="onClick(index)">
                  <v-img :src="icon.src" class="white--text"
                    height="150px"></v-img>
                  <v-card-title class="text-center">{{ icon.name
                  }}</v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-list>
</template>

<script setup>
import { defineProps, ref, computed, onMounted } from "vue";
import { useMainStore } from "@/stores";
import InsertIcon from "@/assets/svgs/menuIcons/InsertIcon.vue";

const props = defineProps({
  // addRectangle: Function,
  // addEllipse: Function,
  // addTextField: Function,
  // onImportClick: Function,
  opened: Boolean,
});
// const onAddRectangle = () => props.addRectangle();
// const onAddEllipse = () => props.addEllipse();
// const onAddTextField = () => props.addTextField();

const store = useMainStore();
const tool = ref(computed(() => store.tool));

const dialog = ref(false);
const icons = ref([]);

const loadIcons = () => {
  // Replace this with actual logic to load image URLs and names
  // const requireContext = require.context('assets/icons', false, /\.svg$/);
  // icons.value = requireContext.keys().map((fileName) => {
  //   const name = fileName.replace('./', '').replace('.svg', '').replace(/_/g, ' ');
  //   return {
  //     src: requireContext(fileName),
  //     name: name,
  //   };
  // });
  const iconNames = ['icon_one', 'icon_two', 'icon_three', 'icon_four', 'icon_five', 'icon_six', 'icon_seven', 'icon_eight', 'icon_nine']; // Add more as needed
  icons.value = iconNames.map((name) => {
    return {
      src: `assets/svgs/icons/${name}.svg`, // Adjust the path as needed
      name: name.replace(/_/g, ' '),
    };
  });
};

const changeTool = (tool) => store.changeTool(tool);

const onClick = idx => {
  dialog.value = false;
}

onMounted(() => {
  loadIcons();
})
</script>
<style>
#item-tools {
  position: absolute;
  width: 60px;
  left: 70px;
  top: 115px;
  border-radius: 10px;
  box-shadow: 0px 5px 5px -3px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
    0px 8px 10px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
    0px 3px 14px 2px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
  transition: all 1s;
  z-index: 99;
}

.icon-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;
}
</style>
