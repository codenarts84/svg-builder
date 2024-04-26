<template>
  <div class="container">
    <div v-for="(circle, index) in circles" :key="index" :style="circle.style"
      class="circle"></div>
  </div>
  <div class="button">
    <button @click="decreaseIndex">-</button>
    <span>Curve Index: {{ curveIndex }}</span>
    <button @click="increaseIndex">+</button>
  </div>
</template>

<script>
export default {

  data() {
    return {
      curveIndex: 5, // Initial curve index
      circles: [] // Array to store circle positions
    };
  },
  created() {
    this.updateCircles();
  },
  methods: {
    updateCircles() {
      console.log(this.circles);
      this.circles = [];
      const containerWidth = 600; // Width of the container
      const containerHeight = 50 * this.curveIndex; // Height of the container
      const centerX = containerWidth / 2; // X coordinate of the center
      const centerY = containerHeight / 2; // Y coordinate of the center
      const semiMajorAxis = containerWidth / 2; // Semi-major axis of the ellipse
      const semiMinorAxis = containerHeight / 2; // Semi-minor axis of the ellipse
      const numCircles = 10; // Number of circles

      for (let i = 0; i < numCircles; i++) {
        const theta = (i / (numCircles - 1)) * Math.PI; // Angle from 0 to PI
        const x = centerX + semiMajorAxis * Math.cos(theta); // X coordinate on the ellipse
        const y = centerY + semiMinorAxis * Math.sin(theta); // Y coordinate on the ellipse
        this.circles.push({ style: { top: y + 'px', left: x + 'px' } });
      }
    },
    increaseIndex() {
      this.curveIndex++;
      console.log(this.curveIndex, 'Up');
      this.updateCircles();
    },
    decreaseIndex() {
      if (this.curveIndex > 0) {
        this.curveIndex--;
        console.log(this.curveIndex, 'Down');
        this.updateCircles();
      }
    }
  }
}

</script>

<style>
.container {
  position: relative;
  height: 200px;
  width: 400px;
  margin-top: 100px;
}

.circle {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: black;
  border-radius: 50%;
}

.button {
  margin: 10px;
}
</style>
