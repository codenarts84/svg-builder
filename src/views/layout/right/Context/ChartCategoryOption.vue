<template>
  <div style="padding: 15px 10px; text-align: left">
    <CategoryManage />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useMainStore } from "@/stores";
import CategoryManage from "@/views/home/components/CategoryManage.vue";
</script>