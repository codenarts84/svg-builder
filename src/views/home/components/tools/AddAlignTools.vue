<template>
  <v-list v-if="props.opened" id="align-tools">

    <v-list-item @click="onAlignHorizonCenter">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Center</v-tooltip>
        <ObjAlignCenterHorizentalIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onAlignHorizonLeft">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Left</v-tooltip>
        <ObjAlignLeftIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onAlignHorizonRight">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Right</v-tooltip>
        <ObjAlignRightIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onFlipVertical">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Flip Vertical</v-tooltip>
        <FlipVertIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onFlipHorizental">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Flip
          Horizental</v-tooltip>
        <FlipHoriIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onDistributeHorizental">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Distribute
          Horizental</v-tooltip>
        <DistHoriIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
    <v-list-item @click="onDistributeVertical">
      <v-list-item-title>
        <v-tooltip activator="parent" location="right">Distribute
          Vertical</v-tooltip>
        <DistVertIcon width="20px" height="20px" />
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup>
import ObjAlignCenterHorizentalIcon from "@/assets/svgs/menuIcons/ObjAlignCenterHorizentalIcon.vue";
import ObjAlignLeftIcon from "@/assets/svgs/menuIcons/ObjAlignLeftIcon.vue";
import ObjAlignRightIcon from "@/assets/svgs/menuIcons/ObjAlignRightIcon.vue";
import FlipVertIcon from "@/assets/svgs/menuIcons/FlipVertIcon.vue";
import FlipHoriIcon from "@/assets/svgs/menuIcons/FlipHoriIcon.vue";
import DistHoriIcon from "@/assets/svgs/menuIcons/DistHoriIcon.vue";
import DistVertIcon from "@/assets/svgs/menuIcons/DistVertIcon.vue";

import { defineProps, computed } from "vue";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
import AppToolbar from "../AppToolbar.vue";
import {
  findClosestGridPoint,
  findCircleCenter,
  degreeInCircle,
  positionInZone,
  rectangleBBox,
  polygonBBox,
  textBBox,
  ellipseBBox,
  testOverlap,
  roundTableBBox,
  rectangleTableBBox,
  estimateTextWidth,
  rotateRectangluarBox,
} from "@/lib/geometry";

const mainStore = useMainStore();
const planStore = usePlanStore();

const selection = computed(() => mainStore.selection);
const plan = planStore.plan;

const props = defineProps({
  opened: Boolean,
  selectionBoundary: Function,
});

const onAlignHorizonCenter = () => {
  const boundary = props.selectionBoundary();
  const startX = boundary.x;
  const endX = startX + boundary.width;
  const midX = (startX + endX) / 2;
  if (selection.value.length) {
    for (const z of plan.zones) {
      // row
      for (const r of z.rows) {
        if (selection.value.includes(r.uuid)) {
          const minx = Math.min(...r.seats.map(s => s.position.x)) + z.position.x + r.position.x
          const maxx = Math.max(...r.seats.map(s => s.position.x)) + z.position.x + r.position.x
          const midx = (minx + maxx) / 2;
          r.position.x += (midX - midx);
        }
      }

      // shape
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid)) {
          if (a.shape === 'circle') {
            a.position.x = midX;
          } else if (a.shape === 'rectangle' || a.shape === 'gaSquare') {
            if (a.rotation) {
              let abox = {
                x: a.position.x,
                y: a.position.y,
                width: a.rectangle.width,
                height: a.rectangle.height
              }
              abox = rotateRectangluarBox(a, abox);
              a.position.x = midX - abox.width / 2;
            } else {
              a.position.x = midX - a.rectangle.width / 2;
            }
          } else if (a.shape === 'ellipse' || a.shape === 'gaCircle') {
            a.position.x = midX;
          } else if (a.shape === 'polygon' || a.shape === 'gaPolygon') {
            if (a.rotation) {
              const abox = polygonBBox(a);
              const dx = midX - (abox.x + abox.width / 2);
              a.position.x += dx;
            } else {
              const points = a.polygon.points;
              const minx = Math.min(...points.map(s => s.x)) + a.position.x;
              const maxx = Math.max(...points.map(s => s.x)) + a.position.x;
              a.position.x += midX - (minx + maxx) / 2;
            }
          } else if (a.shape === 'text') {
            a.position.x = midX;
          } else if (a.shape === 'roundTable') {
            //bug fix
            a.position.x = midX;
          } else if (a.shape === 'rectangleTable') {
            //bug fix
            a.position.x = midX;
          }
        }
      }
    }
    planStore.persistPlan();
  }
}

const onAlignHorizonLeft = () => {
  const boundary = props.selectionBoundary();
  if (selection.value.length) {
    for (const z of plan.zones) {
      // row
      for (const r of z.rows) {
        if (selection.value.includes(r.uuid)) {
          const minx = Math.min(...r.seats.map(s => s.position.x)) + r.position.x + z.position.x;
          if (boundary.x < minx - 10) {
            const dx = minx - 10 - boundary.x;
            r.position.x -= dx;
          }
        }
      }

      // shape
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid)) {
          if (a.shape === 'circle') {
            a.position.x = boundary.x + a.circle.radius;
          } else if (a.shape === 'rectangle' || a.shape === 'gaSquare') {
            if (a.rotation) {
              let abox = {
                x: a.position.x,
                y: a.position.y,
                width: a.rectangle.width,
                height: a.rectangle.height
              }
              abox = rotateRectangluarBox(a, abox);
              a.position.x = boundary.x + (a.position.x - abox.x);
            } else {
              a.position.x = boundary.x;
            }
          } else if (a.shape === 'ellipse' || a.shape === 'gaCircle') {
            if (a.rotation) {
              let abox = ellipseBBox(a);
              a.position.x = boundary.x + (a.position.x - a.ellipse.radius.x - abox.x) + a.ellipse.radius.x;
            } else {
              a.position.x = boundary.x + a.ellipse.radius.x;
            }
          } else if (a.shape === 'polygon' || a.shape === 'gaPolygon') {
            if (a.rotation) {
              const abox = polygonBBox(a);
              if (boundary.x < abox.x) {
                const dx = abox.x - boundary.x;
                a.position.x -= dx;
              }
            } else {
              const points = a.polygon.points;
              const minx = Math.min(...points.map(s => s.x)) + a.position.x;
              const maxx = Math.max(...points.map(s => s.x)) + a.position.x;
              if (boundary.x < minx) {
                const dx = minx - boundary.x;
                a.position.x -= dx;
              }
            }
          } else if (a.shape === 'text') {
            const size = a.text.size || 16;
            const width = estimateTextWidth(a.text.text, size);
            if (a.rotation) {
              let abox = {
                x: a.position.x + a.text.position.x - width / 2,
                y: a.position.y + a.text.position.y - size / 2,
                width: width,
                height: size,
              };
              abox = rotateRectangluarBox(a, abox);
              a.position.x = boundary.x + width / 2 - (a.position.x - width / 2 - abox.x);
            } else {
              a.position.x = boundary.x + width / 2;
            }
          } else if (a.shape === 'roundTable') {
            //bug fix
            a.position.x = boundary.x + a.radius;
          } else if (a.shape === 'rectangleTable') {
            //bug fix
            if (a.rotation) {
              let abox = {
                x: a.position.x,
                y: a.position.y,
                width: a.rectangleTable.width,
                height: a.rectangleTable.height
              }
              abox = rotateRectangluarBox(a, abox);
              a.position.x = boundary.x + (a.position.x - abox.x) + a.rectangleTable.width / 2;
            } else {
              a.position.x = boundary.x + a.rectangleTable.width / 2;
            }
            // a.position.x = boundary.x + a.rectangleTable.width / 2;
          }
        }
      }
    }
    planStore.persistPlan();
  }
}


const onAlignHorizonRight = () => {
  const boundary = props.selectionBoundary();
  const startX = boundary.x;
  console.log(boundary)
  const endX = boundary.x + boundary.width;
  if (selection.value.length) {
    for (const z of plan.zones) {
      // row
      for (const r of z.rows) {
        if (selection.value.includes(r.uuid)) {
          const maxx = Math.max(...r.seats.map(s => s.position.x))
          if (endX > r.position.x + maxx + 10) {
            r.position.x += (endX - r.position.x - maxx - 10);
            console.log(r.position.x)
          }
        }
      }

      // shape
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid)) {
          if (a.shape === 'circle') {
            a.position.x = endX - a.circle.radius;
          } else if (a.shape === 'rectangle' || a.shape === 'gaSquare') {
            if (a.rotation) {
              let abox = {
                x: a.position.x,
                y: a.position.y,
                width: a.rectangle.width,
                height: a.rectangle.height
              }
              abox = rotateRectangluarBox(a, abox);
              a.position.x = endX - abox.width + (a.position.x - abox.x);
            } else {
              a.position.x = endX - a.rectangle.width;
            }
          } else if (a.shape === 'ellipse' || a.shape === 'gaCircle') {
            if (a.rotation) {
              const abox = ellipseBBox(a);
              a.position.x = endX - a.ellipse.radius.x + (a.position.x + a.ellipse.radius.x - abox.x - abox.width);
            } else {
              a.position.x = endX - a.ellipse.radius.x;
            }
          } else if (a.shape === 'polygon' || a.shape === 'gaPolygon') {

            if (a.rotation) {
              const abox = polygonBBox(a);
              if (endX > abox.x + abox.width) {
                const dx = endX - (abox.x + abox.width);
                a.position.x += dx;
              }
            } else {
              const points = a.polygon.points;
              const minx = Math.min(...points.map(s => s.x)) + a.position.x;
              const maxx = Math.max(...points.map(s => s.x)) + a.position.x;
              if (endX > maxx) {
                const dx = endX - maxx;
                a.position.x += dx;
              }
            }

          } else if (a.shape === 'text') {
            const size = a.text.size || 16;
            const width = estimateTextWidth(a.text.text, size);
            if (a.rotation) {
              let abox = {
                x: a.position.x + a.text.position.x - width / 2,
                y: a.position.y + a.text.position.y - size / 2,
                width: width,
                height: size,
              };
              abox = rotateRectangluarBox(a, abox);
              a.position.x = endX - abox.width + (a.position.x - abox.x)
            } else {
              a.position.x = endX - width / 2;
            }
          } else if (a.shape === 'roundTable') {
            a.position.x = endX - a.radius;
          } else if (a.shape === 'rectangleTable') {
            a.position.x = endX - a.rectangleTable.width / 2;
          }
        }
      }
    }
  }
  planStore.persistPlan();
}

const onFlipVertical = () => {
  const boundary = props.selectionBoundary();
  const startX = boundary.x;
  const endX = startX + boundary.width;
  const midX = (startX + endX) / 2;
  if (selection.value.length) {
    for (const z of plan.zones) {
      // row
      for (const r of z.rows) {
        if (selection.value.includes(r.uuid)) {
          const minx = Math.min(...r.seats.map(s => s.position.x)) + z.position.x + r.position.x
          const maxx = Math.max(...r.seats.map(s => s.position.x)) + z.position.x + r.position.x
          const midx = (minx + maxx) / 2;
          // r.position.x += 2 * (midX - midx);
          r.seats.forEach(s => s.position.x = midx * 2 - s.position.x)
        }
      }

      // shape
      for (const a of z.areas) {
        if (selection.value.includes(a.uuid)) {
          if (a.shape === 'circle') {
            a.position.x = midX;
          } else if (a.shape === 'rectangle' || a.shape === 'gaSquare') {
            if (a.rotation) {
              let abox = {
                x: a.position.x,
                y: a.position.y,
                width: a.rectangle.width,
                height: a.rectangle.height
              }
              abox = rotateRectangluarBox(a, abox);
              a.position.x = (midX * 2 - abox.x - abox.width);
            } else {
              a.position.x = midX * 2 - a.position.x - a.rectangle.width;
            }
          } else if (a.shape === 'ellipse' || a.shape === 'gaCircle') {
            a.position.x = midX;
          } else if (a.shape === 'polygon' || a.shape === 'gaPolygon') {
            if (a.rotation) {
              const abox = polygonBBox(a);
              const dx = midX - (abox.x + abox.width / 2);
              a.position.x += dx;
            } else {
              const points = a.polygon.points;
              const minx = Math.min(...points.map(s => s.x)) + a.position.x;
              const maxx = Math.max(...points.map(s => s.x)) + a.position.x;
              a.position.x += midX - (minx + maxx) / 2;
            }
          } else if (a.shape === 'text') {
            a.position.x = midX;
          } else if (a.shape === 'roundTable') {
            //bug fix
            a.position.x = midX;
          } else if (a.shape === 'rectangleTable') {
            //bug fix
            a.position.x = midX;
          }
        }
      }
    }
    planStore.persistPlan();
  }
}

const onFlipHorizental = () => {

}

const onDistributeHorizental = () => { }

const onDistributeVertical = () => { }

</script>

<style>
#align-tools {
  position: absolute;
  width: 60px;
  left: 70px;
  top: 160px;
  /* background-color: #f3f3f3; */
  border-radius: 10px;
  box-shadow: 0px 5px 5px -3px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
    0px 8px 10px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
    0px 3px 14px 2px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
  transition: all 1s;
  z-index: 99;
}
</style>