<template>
  <div style="padding: 15px 10px; text-align: left">
    <SectionLabelModal :addTags="addTags" />
    <v-container>
      <!-- <v-chip-group selected-class="text-primary" multiple column>
        <v-chip v-for="tag in tags" :key="tag" :value="tag.label"
          @click="handleClicked">
          {{ tag.label }}({{ tag.abv }})
        </v-chip>
      </v-chip-group> -->
      <v-row v-for="(tag) in tags" :key="tag.id">
        <v-col cols="9">
          <v-btn class="btn-label" @click="() => setTag(tag.id)">{{ tag.label
          }}({{ tag.abv }})</v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn @click="() => removeTag(tag.id)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<!--
<script setup>
import { ref, computed } from "vue";
import SectionLabelModal from "./SectionLabelModal.vue";
import { useMainStore } from "@/stores";
const mainStore = useMainStore();
const tags = computed(() => mainStore.section_label)
const addTags = (v) => {
  tags.value.push(v);
  mainStore.setSectionLabel(tags.value);
};

const handleClicked = (e) => {
  console.log(e);
}
</script> -->

<script>
import { ref, computed } from "vue";
import SectionLabelModal from "./SectionLabelModal.vue";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
export default {
  components: {
    SectionLabelModal
  },
  setup() {
    const mainStore = useMainStore();
    const planStore = usePlanStore();
    const tags = computed(() => mainStore.section_label);
    // const setSectionLabel = computed(() => mainStore.setSectionLabel);
    return {
      mainStore,
      planStore,
      tags,
      // setSectionLabel
    }
  },
  props: {
    areas: Array
  },
  methods: {
    removeTag(id) {
      this.mainStore.removeSectionLabel(id);
    },
    setTag(id) {
      const tag = this.tags.find(i => i.id === id);
      if (tag)
        this.planStore.addTableSectionLabel(this.areas.map(i => i.uuid), tag.label, tag.abv)
    },
    addTags(v) {
      this.tags.push(v);
      this.mainStore.setSectionLabel(this.tags)
    },
  }
}
</script>

<style>
.v-input__details {
  display: none;
}

.btn-label {
  width: 100%;
}

.v-col-sm-6 {
  padding: 5px;
}
</style>
