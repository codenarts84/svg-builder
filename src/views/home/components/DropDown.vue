<template>
  <div class="dropdown">
    <div class="dropdown-toggle" @click="toggleDropdown">
      <div class="dropdown-item">
        <div class="dropdown-color">
          <div
            :style="{ 'background-color': selection?.color, 'border-radius': '50%', 'width': '10px', 'height': '10px' }">
          </div>
        </div>
        <div class="dropdown-name">{{ selection?.name }}</div>
      </div>
      <i class="fa fa-chevron-down"></i>
    </div>
    <div :class="!direction ? 'dropdown-menu' : 'dropdown-menu-top'"
      v-show="isOpen">
      <template v-for="(option, index) in options" :key="index">
        <div class="dropdown-item" @click="() => selectOption(option)">
          <div class="dropdown-color">
            <div
              :style="{ 'background-color': option.color, 'border-radius': '50%', 'width': '10px', 'height': '10px' }">
            </div>
          </div>
          <div class="dropdown-name">{{ option.name }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: Array,
    setCategory: Function,
    selection: String,
    direction: Boolean
  },

  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    selectOption(option) {
      this.setCategory(option.name);
    }
  }
};
</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-menu-top {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-menu div {
  padding: 5px;
}

.dropdown-menu div:hover {
  background-color: #f0f0f0;
}

.dropdown-item {
  width: 100%;
  padding: 0 15px;
  display: flex;
  /* justify-content: center; */
  align-items: center;
}

.dropdown-color {
  width: 40% !important;
  padding-left: 20% !important;
  text-align: center;
}

.dropdown-name {
  cursor: pointer;
}
</style>
