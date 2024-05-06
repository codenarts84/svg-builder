<template>
  <div style="padding: 15px 10px; text-align: left">
    <SectionManage />
    <!-- <SectionLabelModal :addTags="addTags" /> -->
    <v-container>
      <v-row>
        <v-col cols="12">
          <select class="v-custom-input" :value="section"
            @change="selected_change">
            <option v-for="tag in tags" :key="tag.id" option-label="label"
              name="tag_name" :value="tag.label">
              {{ tag.label }}({{ tag.abv }})
            </option>
          </select>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { defineProps, ref, computed } from "vue"
import { useMainStore } from '@/stores';
import SectionManage from "@/views/home/components/SectionManage.vue";
const mainStore = useMainStore();

const props = defineProps({
  section: String,
  setSection: Function
})

const tags = computed(() => mainStore.section_label);
const selected_change = (e) => {
  console.log(e.target.value)
  props.setSection(e.target.value);
}
</script>
