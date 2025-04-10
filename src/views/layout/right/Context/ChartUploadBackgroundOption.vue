<template>
  <div style="padding: 15px 10px; text-align: left">
    <h4>Upload Background</h4>
    <v-container>
      <v-row style="display: flex; justify-content: center; align-items: center">
        <v-col cols="12" sm="12">
          Background images are not saved with this chart but can be added later
          to the ticketing system.
        </v-col>
        <v-col cols="12" sm="12">
          <v-btn v-if="planRef?.background" @click="bgRemove">
            Remove Background
          </v-btn>
          <v-btn v-else @click="bgUpload">Upload Background</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { inject } from "vue";
const planRef = inject('planRef');

const bgUpload = () => {
  const input = document.createElement('input')
  input.type = 'file';
  input.accept = '.svg,.png';
  input.onchange = (e) => {
    const file = input.files[0];
    if (!file) return;
    const validTypes = ['image/svg+xml', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Sorry, we only allow SVG or PNG files to be placed as background images.');
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const planWidth = planRef.value.plan.size.width;
        const planHeight = planRef.value.plan.size.height;

        console.log(img.width, img.height)

        if (img.width != planWidth || img.height != planHeight) {
          alert(`Sorry, but the image must be exactly ${planWidth} wide by ${planHeight} high to match the size of the seating chart itself.`);
          return;
        }

        planRef.value.background = fileReader.result;
        planRef.value.backgroundWidth = planWidth;
        planRef.value.backgroundHeight = planHeight;
        planRef.value.persistBackground();
      };

      img.src = fileReader.result;
    };
    fileReader.readAsDataURL(file);
  };
  input.click();
}

const bgRemove = () => {
  planRef.value.background = null;
  planRef.value.persistBackground();
}
</script>