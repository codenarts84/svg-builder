<template>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <h4>Section</h4>
    <v-btn class="btn" @click="dialog = true" size="small" variant="flat"
      style="padding: 0px"><v-icon icon="mdi-cog"></v-icon>Manage
    </v-btn>
  </div>
  <div class="text-center">
    <v-dialog v-model="dialog" width="600">
      <v-card class="v-card-container">
        <div class="close-btn">
          <v-btn density="comfortable" icon="$close" variant="plain"
            @click="dialog = false"></v-btn>
        </div>
        <div class="text-center">
          <h2 class="category-title">Section Labeling</h2>
        </div>
        <div class="widget-container">
          <div class="widget-body">
            <SectionLabelModal :addTags="addTags" />
            <table>
              <tr>
                <th class="text-center">Label</th>
                <th class="text-center">Abbreviation</th>
                <th class="text-center">Action</th>
              </tr>
              <tr v-for="(tag, idx) in tags" :key="idx">
                <td class="text-center">
                  {{ tag.label }}
                </td>
                <td class="text-center">
                  {{ tag.abv }}
                </td>
                <td class="text-center">
                  <v-btn density="comfortable" icon="$delete" variant="plain"
                    @click="remoteTag(tag.id)"></v-btn>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import { ref, defineProps, computed, defineComponent } from "vue";
import { usePlanStore } from '@/stores/plan.js'
import { useMainStore } from "@/stores";
import SectionLabelModal from "@/views/layout/rightnav/SectionLabelModal.vue";
const dialog = ref(false);

const props = defineProps({
});

const mainStore = useMainStore();

const tags = computed(() => mainStore.section_label);

const remoteTag = (id) => {
  mainStore.removeSectionLabel(id);
}

const addTags = v => {
  tags.value.push(v);
  mainStore.setSectionLabel(tags.value);
}

</script>


<style>
.v-card-container {
  padding: 40px 30px;
}

.widget-container {
  padding-top: 50px;
  margin: auto;
  width: 80%;
  display: flex;
  justify-content: center;
}

.widget-body {
  width: 500px;
}

.close-btn {
  display: flex;
  justify-content: flex-end;
}

table,
td,
th>.text-center {
  text-align: center;
}
</style>