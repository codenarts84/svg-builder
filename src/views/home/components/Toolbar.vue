<template>
  <div class="c-toolbar">
    <div class="group">
      <v-btn @click="reset">BTN New</v-btn>
    </div>
    <div class="group">
      <!-- <v-btn
        @click="changeTool('select')"
        :class="tool == 'select' ? 'current-tool' : ''"
      >
        CD
      </v-btn>
      <v-btn
        @click="changeTool('seatselect')"
        :class="tool == 'seatselect' ? 'current-tool' : ''"
      >
        SS
      </v-btn>
      <v-btn
        @click="changeTool('rows')"
        :class="tool == 'rows' ? 'current-tool' : ''"
      >
        Rows
      </v-btn>
      <v-btn
        @click="changeTool('row')"
        :class="tool == 'row' ? 'current-tool' : ''"
      >
        Row
      </v-btn>

      <v-btn
        @click="changeTool('rectangle')"
        :class="tool == 'rectangle' ? 'current-tool' : ''"
      >
        rectangle
      </v-btn>

      <v-btn
        @click="changeTool('circle')"
        :class="tool == 'circle' ? 'current-tool' : ''"
      >
        circle
      </v-btn> -->
      <!--
      <v-btn
        @click="changeTool('ellipse')"
        :class="tool == 'ellipse' ? 'current-tool' : ''"
      >
        ellipse
      </v-btn>

      <v-btn
        @click="changeTool('polygon')"
        :class="tool == 'polygon' ? 'current-tool' : ''"
      >
        polygon
      </v-btn>

      <v-btn
        @click="changeTool('text')"
        :class="tool == 'text' ? 'current-tool' : ''"
      >
        text
      </v-btn> -->
    </div>

    <div class="group">
      <v-btn @click="undo"> Undo </v-btn>
      <v-btn @click="redo"> Redo </v-btn>
    </div>

    <div class="group">
      <v-btn @click="cut" :disabled="!selection.length"> cut </v-btn>
      <v-btn @click="copy" :disabled="!selection.length"> copy </v-btn>
      <v-btn @click="paste"
        :disabled="!clipboardAreas.length && !clipboardRows.length">
        paste
      </v-btn>
      <v-btn @click.prevent="deleteObjects"
        :disabled="!clipboardAreas.length && !clipboardRows.length">
        del
      </v-btn>
    </div>

    <div class="group">
      <v-btn @click="zoomOut"> zoomOut </v-btn>
      <v-btn @click="zoomOne"> {{ Math.round(zoomTransform.k * 100) }}% </v-btn>
      <v-btn @click="zoomIn"> zoomIn </v-btn>
    </div>
    <div class="group">
      <v-btn @click="toggleGrid"> {{ grid ? "grid-off" : "grid" }} </v-btn>
    </div>
  </div>
</template>

<script>
// import { mapGetters, mapMutations, mapState } from "vuex";
// import store from "../store";
import sampleplan from "../../../sampleplan";
import { computed, ref } from "vue";
import * as d3 from "d3";
import Ajv from "ajv";
import { usePlanStore } from "@/stores/plan";
import { useMainStore } from "@/stores";
// import schema from "../schema/seating-plan.schema.json";
// // import ValidationResultPrompt from "./prompts/ValidationResultPrompt";
// import jsPDF from "jspdf";
// // import "svg2pdf.js"; // do not remove

const store = useMainStore();

export default {
  name: "ToolbarComp",
  setup() {
    const store = useMainStore();
    const planstore = usePlanStore();

    const selection = computed(() => store.selection);
    const tool = computed(() => store.tool);
    const zoomTransform = computed(() => store.zoomTransform);
    const grid = computed(() => store.grid);
    const clipboardAreas = computed(() => store.clipboardAreas);
    const clipboardRows = computed(() => store.clipboardRows);
    const hasUndo = computed(() => planstore.hasUndo);
    const hasRedo = computed(() => planstore.hasRedo);
    const validationErrors = computed(() => planstore.validationErrors);
    const toggleGrid = () => store.toggleGrid();
    const disableGrid = computed(() => store.disableGrid());
    const undo = computed(() => planstore.undo());
    const redo = computed(() => planstore.redo());

    return {
      disableGrid,
      undo,
      redo,
      toggleGrid,
      selection,
      tool,
      zoomTransform,
      grid,
      clipboardAreas,
      clipboardRows,
      hasUndo,
      hasRedo,
      validationErrors,
    };
  },
  // components: { ValidationResultPrompt },
  // data() {
  //   return {
  //     showValidationResult: false,
  //   };
  // },

  watch: {},
  created() { },
  mounted() { },
  unmounted() { },
  methods: {
    zoomIn() {
      d3.select(this.$parent.$refs.plan.$refs.svg)
        .transition()
        .call(this.$parent.$refs.plan.zoom.scaleBy, 1.2);
    },
    zoomOut() {
      d3.select(this.$parent.$refs.plan.$refs.svg)
        .transition()
        .call(this.$parent.$refs.plan.zoom.scaleBy, 0.8);
    },

    zoomOne() {
      if (this.zoomTransform.k === this.$parent.$refs.plan.defaultScale) {
        d3.select(this.$parent.$refs.plan.$refs.svg)
          .transition()
          .call(this.$parent.$refs.plan.zoom.scaleTo, 1);
      } else {
        d3.select(this.$parent.$refs.plan.$refs.svg)
          .transition()
          .call(
            this.$parent.$refs.plan.zoom.scaleTo,
            this.$parent.$refs.plan.defaultScale
          );
      }
    },

    reset() {
      if (
        window.confirm(
          "Do you want to start a new plan? Your current plan will be discarded."
        )
      ) {
        const store = useMainStore();
        store.loadPlan(sampleplan.sampleplan);
      }
    },
    cut() {
      if (this.tool === "seatselect") {
        alert(
          "Copying individual seats is currently not possible, please select a row instead."
        );
        return;
      }
      this.$store.commit("cut", { objects: this.selection });
    },
    copy() {
      if (this.tool === "seatselect") {
        alert(
          "Copying individual seats is currently not possible, please select a row instead."
        );
        return;
      }
      this.$store.commit("copy", { objects: this.selection });
    },

    paste() {
      this.$store.commit("paste");
    },
    deleteObjects() {
      this.$store.commit("plan/deleteObjects", { objects: this.selection });
    },
    changeTool(tool) {
      store.changeTool(tool);
    },
  },
};
</script>

<style>
.c-toolbar {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.group {
  margin-right: 15px;
  padding-right: 15px;
  display: flex;
  flex-direction: row;
  border-right: 1px solid #ccc;
}

.current-tool {
  border: 1px solid var(--clr-primary);
  /* Assuming clr-primary is a CSS variable */
}

.mdi {
  color: black;
  opacity: 0.735;
  /* yields almost the same color as the native icons */
}

.validation .mdi {
  opacity: 1;
}

.mdi--fr-custom::before {
  content: " ";
  width: 20px;
  height: 36px;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
