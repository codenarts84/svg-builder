<template>
  <div style="padding: 15px 10px; text-align: left">
    <SectionLabelModal :addTags="addTags" />
    <v-container>
      <template v-for="tag in tags" :key="tag.id">
        <v-row>
          <v-col class="section-container" cols="12">
            <v-btn class="section-btn" @click="() => handle_tag(tag.id)">{{
              tag.label
            }}({{ tag.abv }})</v-btn>
            <v-btn @click="() => removeTag(tag.id)" density="comfortable"
              icon="$delete" variant="plain"></v-btn>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
// import SectionLabelModal from "./SectionLabelModal.vue";
import SectionLabelModal from './SectionLabelModel.vue'
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
    rows: Array,
    setTag: Function,
  },
  methods: {
    removeTag(id) {
      this.mainStore.removeSectionLabel(id);
    },
    handle_tag(id) {
      this.setTag(id);
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

.section-container {
  padding: 6px;
}

.section-btn {
  width: 80%;
}
</style>
