<script>
import { computed, watch, nextTick, ref, onMounted } from "vue";
import { useMainStore } from "@/stores";
import { usePlanStore } from "@/stores/plan";
import {
  ellipseBBox,
  findCircleCenter,
  findClosestGridPoint,
  polygonBBox,
  positionInZone,
  rectangleBBox,
  testOverlap,
  textBBox,
  roundTableBBox,
  rectangleTableBBox,
  rotateRectangluarBox,
  estimateTextWidth
} from "@/lib/geometry";
import { generateID } from "@/lib/numbers";
import { v4 as uuid } from "uuid";
import * as d3 from "d3";
import ZoneComponent from "./ZoneComponent.vue";
import { useToolbarStore } from '@/stores/toolbar';
import { useSeatFormatStore } from "@/stores/seatFormat";
import { useBoardStore } from "@/stores/svgStore";
import { pointBox } from "intersects";

const round = (fl, places) => Number(fl.toFixed(places || 0));

const defaultBg = JSON.parse(
  window.localStorage.getItem("frontrow2.editor.bg") ||
  '{"background": null, "backgroundOpacity": 100, "backgroundX": 0, "backgroundY": 0, "backgroundWidth": 100, "backgroundHeight": 100}'
);

export default {
  name: "ZoneComp",
  components: { ZoneComponent },
  setup() {
    const svg = ref(null);
    const zoom = ref(null);
    const defaultScale = ref(1);
    const fullScreen = ref(true);
    const lastMouseUp = ref(0);
    const background = ref(defaultBg.background);
    const backgroundOpacity = ref(defaultBg.backgroundOpacity);
    const backgroundWidth = ref(defaultBg.backgroundWidth);
    const backgroundHeight = ref(defaultBg.backgroundHeight);
    const backgroundX = ref(defaultBg.backgroundX);
    const backgroundY = ref(defaultBg.backgroundY);
    const rotating = ref(false);
    const rotatingOriginX = ref(0);
    const rotatingOriginY = ref(0);
    const moveDirection = ref(-1);
    const temp_ox = ref(0);
    const temp_oy = ref(0);
    const rotatingHandleX = ref(0);
    const rotatingHandleY = ref(0);
    const rotatingStartAngle = ref(0);
    const resizing = ref(false);
    const resizingOriginX = ref(0);
    const resizingOriginY = ref(0);
    const resizingStartDistance = ref(0);
    const selecting = ref(false);
    const selectingStartX = ref(0);
    const selectingStartY = ref(0);
    const selectingCurrentX = ref(100);
    const selectingCurrentY = ref(100);
    const drawing = ref(false);
    const drawingStartX = ref(0);
    const drawingStartY = ref(0);
    const drawingCurrentX = ref(100);
    const drawingCurrentY = ref(100);
    const rowCurrentX = ref(100);
    const rowCurrentY = ref(100);
    const polygonDrawing = ref(false);
    const polygonPoints = ref([]);
    const rowBlockDrawing = ref(false);
    const stgrowBlockDrawing = ref(false);
    const rowDrawing = ref(false);
    const rowSpacing = ref(25);
    const rowSeatSpacing = ref(25);
    const mouseStatus = ref(false);

    const store = useMainStore();
    const planstore = usePlanStore();
    const plan = computed(() => planstore.plan);
    const validationErrors = computed(() => planstore.validationErrors);
    const selection = computed(() => store.selection);
    const tool = computed(() => store.tool);
    const cursor = computed(() => store.cursor);
    const zoomTransform = computed(() => store.zoomTransform);
    const selectedZone = computed(() => store.selectedZone);
    const lockedZones = computed(() => store.lockedZones);
    const grid = computed(() => store.grid);
    const planSize = computed(() => planstore.planSize);

    const toolbarStore = useToolbarStore();

    const seatStore = useSeatFormatStore();

    const bSnap2Grid = computed(() => store.snap);
    const sections = computed(() => store.section_label)
    const categories = computed(() => planstore.categories)


    onMounted(() => {
      console.log("SVG Element:", svg.value.getBoundingClientRect());
    });

    const getSvgRect = () => svg.value.getBoundingClientRect();

    return {
      sections,
      categories,
      bSnap2Grid,
      plan,
      validationErrors,
      selection,
      tool,
      cursor,
      zoomTransform,
      selectedZone,
      lockedZones,
      grid,
      temp_ox,
      temp_oy,
      // unwatch,
      // unwatchTool,
      // createZoom,
      // hotkey,
      svg,
      zoom,
      defaultScale,
      fullScreen,
      lastMouseUp,
      background,
      backgroundOpacity,
      backgroundWidth,
      backgroundHeight,
      backgroundX,
      backgroundY,
      rotating,
      rotatingOriginX,
      rotatingOriginY,
      rotatingHandleX,
      rotatingHandleY,
      rotatingStartAngle,
      resizing,
      resizingOriginX,
      resizingOriginY,
      resizingStartDistance,
      selecting,
      selectingStartX,
      selectingStartY,
      selectingCurrentX,
      selectingCurrentY,
      drawing,
      drawingStartX,
      drawingStartY,
      drawingCurrentX,
      drawingCurrentY,
      polygonDrawing,
      polygonPoints,
      rowBlockDrawing,
      stgrowBlockDrawing,
      rowDrawing,
      rowSpacing,
      rowSeatSpacing,
      rowCurrentX,
      rowCurrentY,
      mouseStatus,
      getSvgRect,
    };
  },
  computed: {
    noTableSelection() {
      if (this.selection.length === 1) {
        for (const z of this.plan.zones) {
          for (const a of z.areas) {
            if ((a.shape === 'roundTable' || a.shape === 'rectangleTable') && this.selection.includes(a.uuid)) return false;
          }
        }
      }
      return true;
    },

    mainclasses() {
      return {
        // move cursor
        movable: this.tool === "select",
        "zoom-transform": true,
      };
    },

    currentToolStatus() {
      return this.tool === "seatselect" ? false : true;
    },

    selectionIncludesNoSeats() {
      for (const z of this.plan.zones) {
        for (const r of z.rows) {
          for (const s of r.seats) {
            if (this.selection.includes(s.uuid)) {
              return false;
            }
          }
        }
      }
      return true;
    },
    polygonPreviewPoints() {
      return this.polygonPoints
        .concat([{ x: this.drawingCurrentX, y: this.drawingCurrentY }])
        .map((point) => `${point.x},${point.y}`)
        .join(" ");
    },
    rowBlockPosition() {
      const x =
        this.drawingCurrentX > this.drawingStartX
          ? this.drawingStartX
          : this.drawingCurrentX +
          ((this.drawingStartX - this.drawingCurrentX) % this.rowSeatSpacing);
      const y =
        this.drawingCurrentY > this.drawingStartY
          ? this.drawingStartY
          : this.drawingCurrentY +
          ((this.drawingStartY - this.drawingCurrentY) % this.rowSpacing);
      return { x, y };
    },
    rowDrawPosition() {
      const x =
        this.drawingCurrentX > this.drawingStartX
          ? this.drawingStartX
          : this.drawingCurrentX +
          ((this.drawingStartX - this.drawingCurrentX) % this.rowSeatSpacing);
      const y = this.drawingStartY;
      return { x, y };
    },
    rowBlockTransform() {
      return `translate(${this.rowBlockPosition.x}, ${this.rowBlockPosition.y})`;
    },
    rowBlockRows() {
      if (this.rowBlockDrawing) {
        return Math.ceil(
          Math.abs(this.drawingCurrentY - this.drawingStartY) / this.rowSpacing
        );
      } else {
        return 0;
      }
    },

    stgrowBlockRows() {
      if (this.stgrowBlockDrawing) {
        return Math.ceil(
          Math.abs(this.drawingCurrentY - this.drawingStartY) / this.rowSpacing
        );
      } else {
        return 0;
      }
    },

    rowCirclePreviews() {
      const circles = [];
      for (const z of this.plan.zones) {
        for (const r of z.rows) {
          if (this.selection.includes(r.uuid)) {
            if (r.seats.length === 0) continue;
            // See circleRows() in store/index.js for a more commented version of this math
            const firstx = r.seats[0].position.x + r.position.x + z.position.x;
            const firsty = r.seats[0].position.y + r.position.y + z.position.y;
            const lastx =
              r.seats[r.seats.length - 1].position.x +
              r.position.x +
              z.position.x;
            const lasty =
              r.seats[r.seats.length - 1].position.y +
              r.position.y +
              z.position.y;

            if (this.tool === "rowCircleFixedCenter") {
              const radius = Math.sqrt(
                (this.drawingCurrentX - firstx) *
                (this.drawingCurrentX - firstx) +
                (this.drawingCurrentY - firsty) *
                (this.drawingCurrentY - firsty)
              );

              circles.push({
                radius,
                cx: this.drawingCurrentX,
                cy: this.drawingCurrentY,
              });
            } else {
              const distance = Math.sqrt(
                (lastx - firstx) * (lastx - firstx) +
                (lasty - firsty) * (lasty - firsty)
              );
              const radius = Math.max(
                Math.abs(
                  (this.drawingCurrentX - firstx) * (lasty - firsty) -
                  (this.drawingCurrentY - firsty) * (lastx - firstx)
                ) / distance,
                distance / 2
              );
              const sign = Math.sign(
                (this.drawingCurrentX - firstx) * (lasty - firsty) -
                (this.drawingCurrentY - firsty) * (lastx - firstx)
              );

              const { cx, cy } = findCircleCenter({
                x1: firstx,
                y1: firsty,
                x2: lastx,
                y2: lasty,
                radius,
                sign,
              });

              circles.push({
                radius,
                cx,
                cy,
              });
            }
          }
        }
      }
      return circles;
    },
    rowDrawingSeats() {
      if (this.rowDrawing) {
        const numberOfSeats = Math.ceil(
          Math.sqrt(
            Math.pow(this.drawingCurrentX - this.drawingStartX, 2) +
            Math.pow(this.drawingCurrentY - this.drawingStartY, 2)
          ) / this.rowSeatSpacing
        );
        const seats = [];
        for (let si of Array(numberOfSeats).keys()) {
          if (this.drawingCurrentX === this.drawingStartX) {
            seats.push({
              x: this.drawingStartX,
              y:
                this.drawingStartY +
                this.rowSeatSpacing *
                si *
                Math.sign(this.drawingCurrentY - this.drawingStartY),
            });
          } else {
            seats.push({
              x:
                this.drawingStartX +
                this.rowSeatSpacing *
                si *
                Math.sign(this.drawingCurrentX - this.drawingStartX) *
                Math.cos(
                  Math.atan(
                    (this.drawingCurrentY - this.drawingStartY) /
                    (this.drawingCurrentX - this.drawingStartX)
                  )
                ),
              y:
                this.drawingStartY +
                this.rowSeatSpacing *
                si *
                Math.sign(this.drawingCurrentX - this.drawingStartX) *
                Math.sin(
                  Math.atan(
                    (this.drawingCurrentY - this.drawingStartY) /
                    (this.drawingCurrentX - this.drawingStartX)
                  )
                ),
            });
          }
        }
        return seats;
      } else {
        return [];
      }
    },
    rowBlockSeats() {
      if (this.rowBlockDrawing) {
        return Math.ceil(
          Math.abs(this.drawingCurrentX - this.drawingStartX) /
          this.rowSeatSpacing
        );
      } else {
        return 0;
      }
    },
    stgrowBlockSeats() {
      if (this.stgrowBlockDrawing) {
        return Math.ceil(
          Math.abs(this.drawingCurrentX - this.drawingStartX) /
          this.rowSeatSpacing
        );
      } else {
        return 0;
      }
    },
    stgrowBlockSeats1() {
      if (this.stgrowBlockDrawing) {
        const res = Math.ceil(
          Math.abs(this.drawingCurrentX - this.drawingStartX) /
          this.rowSeatSpacing
        )
        return res > 0 ? res - 1 : 0;
      } else {
        return 0;
      }
    },
    selectionBoxesVisible() {
      return this.selectionBoxes.filter((b) => b.visible);
    },
    selectionBoxes() {
      const res = [];
      if (this.selection.length) {
        for (const z of this.plan.zones) {
          for (const r of z.rows) {
            if (this.selection.includes(r.uuid)) {
              const minx = Math.min(
                ...r.seats.map((s) => s.position.x - (s.radius || 10))
              );
              const miny = Math.min(
                ...r.seats.map((s) => s.position.y - (s.radius || 10))
              );
              const maxx = Math.max(
                ...r.seats.map((s) => s.position.x + (s.radius || 10))
              );
              const maxy = Math.max(
                ...r.seats.map((s) => s.position.y + (s.radius || 10))
              );
              res.push({
                visible: false,
                x: z.position.x + r.position.x + minx,
                y: z.position.y + r.position.y + miny,
                width: maxx - minx,
                height: maxy - miny,
              });
            }
            for (const s of r.seats) {
              if (this.selection.includes(s.uuid)) {
                res.push({
                  visible: true,
                  x:
                    z.position.x +
                    r.position.x +
                    s.position.x -
                    (s.radius || 10),
                  y:
                    z.position.y +
                    r.position.y +
                    s.position.y -
                    (s.radius || 10),
                  width: 2 * (s.radius || 10),
                  height: 2 * (s.radius || 10),
                });
              }
            }
          }

          for (const a of z.areas) {
            if (this.selection.includes(a.uuid)) {
              let abox;
              if (a.shape === "circle") {
                abox = {
                  x: a.position.x - a.circle.radius,
                  y: a.position.y - a.circle.radius,
                  width: 2 * a.circle.radius,
                  height: 2 * a.circle.radius,
                };
              } else if (a.shape === "ellipse" || a.shape === "gaCircle") {
                abox = ellipseBBox(a);
              } else if (a.shape === "rectangle" || a.shape === "gaSquare") {
                abox = rectangleBBox(a);
              } else if (a.shape === "polygon" || a.shape === "gaPolygon") {
                abox = polygonBBox(a);
              } else if (a.shape === "text") {
                const s = a.text.size || 16;
                abox = textBBox(a, a.text.text, s);
              } else if (a.shape === 'roundTable') {
                abox = roundTableBBox(a);
              } else if (a.shape === 'rectangleTable') {
                abox = rectangleTableBBox(a);
              }
              //COME HERE
              abox.x += z.position.x;
              abox.y += z.position.y;
              abox.visible = true;
              res.push(abox);
            } else if (a.shape === 'roundTable') {
              for (const s of a.seats) {
                if (this.selection.includes(s.uuid)) {
                  let abox = {
                    x: a.position.x + s.position.x - (s.radius || 10),
                    y: a.position.y + s.position.y - (s.radius || 10),
                    width: 2 * (s.radius || 10),
                    height: 2 * (s.radius || 10)
                  }
                  if (a.rotation) {
                    abox = rotateRectangluarBox(a, abox);
                  }
                  abox.x += z.position.x;
                  abox.y += z.position.y;
                  abox.visible = true;
                  res.push(abox);
                }
              }
            } else if (a.shape === 'rectangleTable') {
              for (const s of a.seats) {
                if (this.selection.includes(s.uuid)) {
                  let abox = {
                    x: a.position.x + s.position.x - (s.radius || 10) - a.rectangleTable.width / 2,
                    y: a.position.y + s.position.y - (s.radius || 10) - a.rectangleTable.height / 2,
                    width: 2 * (s.radius || 10),
                    height: 2 * (s.radius || 10)
                  }
                  if (a.rotation) {
                    abox = rotateRectangluarBox(a, abox);
                  }
                  abox.x += z.position.x;
                  abox.y += z.position.y;
                  abox.visible = true;
                  res.push(abox);
                }
              }
            }
          }
        }
      }
      return res;
    },
    selectionBoundary() {
      // console.log('selectionBoundary')
      const bboxes = this.selectionBoxes;
      if (bboxes.length === 0) return null;
      const minx = Math.min(...bboxes.map((s) => s.x));
      const miny = Math.min(...bboxes.map((s) => s.y));
      const maxx = Math.max(...bboxes.map((s) => s.x + s.width));
      const maxy = Math.max(...bboxes.map((s) => s.y + s.height));
      return {
        x: minx,
        y: miny,
        width: maxx - minx,
        height: maxy - miny,
      };
    },
    rotateHandle() {
      if (!this.selectionBoundary) return { x: 0, y: 0 };
      if (this.rotating) {
        return {
          x: this.rotatingHandleX,
          y: this.rotatingHandleY,
        };
      }
      return {
        x: this.selectionBoundary.x + this.selectionBoundary.width / 2,
        y: this.selectionBoundary.y - 30,
      };
    },
  },

  created() {
    // window.addEventListener("resize", this.createZoom);
    // window.addEventListener("keydown", this.hotkey);
    window.localStorage.setItem('snap_enabled', true);
    window.localStorage.setItem('grid_enabled', true);
    this.unwatch = watch(this.planSize, (newValue, oldValue) => {
      if (
        !oldValue ||
        newValue.width !== oldValue.width ||
        newValue.height !== oldValue.height
      ) {
        nextTick(() => {
          this.createStage();
          this.createZoom(); // Make sure this.createZoom() is compatible with the composition API
        });
      }
    });
    this.unwatchTool = watch(
      () => this.tool,
      (newValue, oldValue) => {
        if (!oldValue || newValue !== oldValue) {
          // console.log("This is the tool", this.tool, oldValue, newValue);
          this.drawing = false;
          this.selecting = false;
          this.rowBlockDrawing = false;
          this.polygonDrawing = false;
          this.polygonPoints = [];
        }
      }
    );
  },

  unmounted() {
    // window.removeEventListener("resize", this.createZoom);
    window.removeEventListener("keydown", this.hotkey);
    // console.log("unMounted");
    this.unwatch();
    this.unwatchTool();
  },

  methods: {
    getUniqueTableName() {
      const tableNames = []
      const tableAbvs = []
      for (const z of this.plan.zones) {
        for (const area of z.areas) {
          if (area.shape === 'roundTable' || area.shape === 'rectangleTable') {
            if (area.label && area.label.name)
              tableNames.push(area.label.name)
            if (area.label && area.label.abv)
              tableAbvs.push(area.label.abv)
          }
        }
      }
      let nName = 1;
      let nAbv = 1;
      let labelName = 'Table 1';
      let abvName = 'T1'
      while (tableNames.some(name => name === labelName)) {
        nName++;
        labelName = `Table ${nName}`;
      }

      while (tableAbvs.some(name => name === abvName)) {
        nAbv++;
        abvName = `T${nAbv}`
      }
      return { labelName, abvName }
    },

    getUniqueGAName() {
      const gaLabels = []
      const gaAbvs = []
      for (const z of this.plan.zones) {
        for (const area of z.areas) {
          if (area.shape === 'gaCircle' || area.shape === 'gaSquare' || area.shape === 'gaPolygon') {
            if (area.label)
              gaLabels.push(area.label)
            if (area.abbreviation)
              gaAbvs.push(area.abbreviation)
          }
        }
      }
      let nName = 1;
      let nAbv = 1;
      let gaLabel = 'General Admission 1';
      let gaAbv = 'GA1'
      while (gaLabels.some(name => name === gaLabel)) {
        nName++;
        gaLabel = `General Admission ${nName}`;
      }

      while (gaAbvs.some(name => name === gaAbv)) {
        nAbv++;
        gaAbv = `GA${nAbv}`
      }
      return { gaLabel, gaAbv }
    },

    setZoomTransform(t) {
      const store = useMainStore();
      store.setZoomTransform(t);
    },


    startRotating(event) {
      if (!this.svg) return;
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      const svgbox = this.getSvgRect();
      this.rotating = true;
      const drawPos = positionInZone(
        event.clientX - svgbox.x,
        event.clientY - svgbox.y,
        this.zoomTransform,
        null
      );
      this.rotatingOriginX =
        this.selectionBoundary.x + this.selectionBoundary.width / 2;
      this.rotatingOriginY =
        this.selectionBoundary.y + this.selectionBoundary.height / 2;
      useMainStore().set_Ox(this.rotatingOriginX);
      useMainStore().set_Oy(this.rotatingOriginY);
      // this.temp_ox = this.selectionBoundary.x + this.selectionBoundary.width / 2;
      // this.temp_oy = this.selectionBoundary.y + this.selectionBoundary.height / 2;
      // console.log('When', this.rotatingOriginX)
      this.rotatingStartAngle = 0;
      this.rotatingHandleX = drawPos.x;
      this.rotatingHandleY = drawPos.y;
      return true;
    },

    startResizing(event, node) {
      if (!this.svg) return;

      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      const svgbox = this.getSvgRect();
      this.resizing = true;
      const drawPos = positionInZone(
        event.clientX - svgbox.x,
        event.clientY - svgbox.y,
        this.zoomTransform,
        null
      );
      switch (node) {
        case "nw":
          this.moveDirection = 1;
          this.resizingOriginX =
            this.selectionBoundary.x + this.selectionBoundary.width;
          this.resizingOriginY =
            this.selectionBoundary.y + this.selectionBoundary.height;
          break;
        case "ne":
          this.moveDirection = 2;
          this.resizingOriginX = this.selectionBoundary.x;
          this.resizingOriginY =
            this.selectionBoundary.y + this.selectionBoundary.height;
          break;
        case "sw":
          this.moveDirection = 4;
          this.resizingOriginX =
            this.selectionBoundary.x + this.selectionBoundary.width;
          this.resizingOriginY = this.selectionBoundary.y;
          break;
        case "se":
          this.moveDirection = 3;
          this.resizingOriginX = this.selectionBoundary.x;
          this.resizingOriginY = this.selectionBoundary.y;
          break;
        default:
          console.error("unknown resize node");
      }
      this.resizingStartDistance = Math.sqrt(
        (drawPos.x - this.resizingOriginX) *
        (drawPos.x - this.resizingOriginX) +
        (drawPos.y - this.resizingOriginY) *
        (drawPos.y - this.resizingOriginY)
      );
      // console.log(this.resizingStartDistance);
      return true;
    },

    startDragging(uuid, zone, event) {
      // console.log('startdragging here!!!')
      // console.log(store.selection);
      if (!this.svg) return;
      if (event) {
        const svgbox = this.getSvgRect();

        const pos = positionInZone(
          event.clientX - svgbox.x,
          event.clientY - svgbox.y,
          this.zoomTransform,
          null
        );
        const store = useMainStore();
        store.startDragging(uuid, event.shiftKey, pos.x, pos.y, zone.uuid);
      }
    },

    startDraggingPolygonPoint(uuid, pid, zone, event) {
      console.log('startDragging')
      if (!this.svg) return;
      const svgbox = this.getSvgRect();
      const pos = positionInZone(
        event.clientX - svgbox.x,
        event.clientY - svgbox.y,
        this.zoomTransform,
        null
      );
      const store = useMainStore();
      store.startDraggingPolygonPoint(
        uuid,
        pid,
        event.shiftKey,
        pos.x,
        pos.y,
        zone
      );
    },

    mousedown(event) {
      if (!this.svg) return;
      const store = useMainStore();

      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      if (this.rotating || this.resizing) {
        return;
      }
      const svgbox = this.getSvgRect(); //this.getSvgRect();
      const zone = this.plan.zones.find((z) => z.uuid === this.selectedZone);
      // console.log(svgbox);

      let targetPos = positionInZone(
        event.clientX - svgbox.x,
        event.clientY - svgbox.y,
        this.zoomTransform,
        zone
      );

      if (targetPos.x < 0 || targetPos.y < 0 || targetPos.x > this.plan.size.width || targetPos.y > this.plan.size.height) return;

      switch (this.tool) {
        // case "hand":
        //   console.log("changed to handon");
        //   useMainStore().changeTool("handon");
        //   return;
        case "select":
        case "seatselect": {
          let selPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            null
          );
          this.selecting = true;
          this.selectingStartX = selPos.x;
          this.selectingStartY = selPos.y;
          this.selectingCurrentX = selPos.x;
          this.selectingCurrentY = selPos.y;

          // this.rotatingOriginX =
          //   this.selectionBoundary.x + this.selectionBoundary.width / 2;
          // this.rotatingOriginY =
          //   this.selectionBoundary.y + this.selectionBoundary.height / 2;
          // console.log('Here?')
          // console.log(this.rotatingOriginX);
          break;
        }
        case "gaCircle":
        case "gaSquare":
        case "rectangle":
        case "circle":
        case "ellipse": {
          this.drawing = true;
          let drawPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            null
          );
          if (event.shiftKey || this.bSnap2Grid) {
            drawPos = findClosestGridPoint({
              x: drawPos.x,
              y: drawPos.y,
              zone: zone,
            });
          }
          this.drawingStartX = drawPos.x;
          this.drawingStartY = drawPos.y;
          this.drawingCurrentX = drawPos.x;
          this.drawingCurrentY = drawPos.y;
          break;
        }
        case "text": {
          let targetPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            zone
          );
          const width = estimateTextWidth('Text', 32);
          const height = 32;
          if (event.shiftKey || this.bSnap2Grid) {
            targetPos = findClosestGridPoint({
              x: targetPos.x,
              y: targetPos.y,
            });
          }

          if (targetPos.x - width / 2 < 0 || targetPos.x + width / 2 > this.plan.size.width || targetPos.y - height / 2 < 0 || targetPos.y + height / 2 > this.plan.size.height)
            return;
          const newId = uuid();
          usePlanStore()
            .createArea(this.selectedZone, {
              shape: "text",
              rotation: 0,
              uuid: newId,
              position: {
                x: targetPos.x,
                y: targetPos.y,
              },
              text: {
                position: { x: 0, y: 0 },
                color: "#333333",
                text: "Text",
                size: 32,
              },
            })
            .then(() => {
              this.$nextTick(() => {
                store.toggleSelection([newId], this.selectedZone, false);
              });
            });
          break;
        }
        case "roundTable": {
          let targetPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            zone
          );
          // if (targetPos.x < 35 || targetPos.y < 35 || targetPos.x > this.plan.size.width - 35 || targetPos.y > this.plan.size.height - 35) return;
          if (event.shiftKey || this.bSnap2Grid) {
            targetPos = findClosestGridPoint({
              x: targetPos.x,
              y: targetPos.y,
            });
          }
          if (targetPos.x - 45 < 0 || targetPos.x + 45 > this.plan.size.width || targetPos.y - 42 < 0 || targetPos.y + 42 > this.plan.size.height)
            return;
          const arr = []
          for (let i = 0; i < 6; i++) {
            arr.push(i);
          }

          const { labelName, abvName } = this.getUniqueTableName();
          const newId = uuid();
          usePlanStore()
            .createArea(this.selectedZone, {
              shape: "roundTable",
              space: 0,
              rotation: 0,
              uuid: newId,
              label: {
                position: {
                  x: 0,
                  y: 0,
                },
                name: labelName,
                abv: abvName,
                color: "#333333",
                size: 16,
              },
              position: {
                x: targetPos.x,
                y: targetPos.y,
              },
              radius: 25,
              capacity: 6,
              seats: arr.map((item, idx, arr) => {
                const degree = 2 * Math.PI / arr.length * idx;
                return {
                  seat_number: (idx + 1).toString(),
                  position: {
                    x: 35 * Math.cos(degree),
                    y: 35 * Math.sin(degree),
                  },
                  r: 10,
                  guid: generateID(),
                  uuid: uuid()
                }
              })
            })
            .then(() => {
              this.$nextTick(() => {
                store.toggleSelection([newId], this.selectedZone, false);
              });
            });
          break;
        }

        case "rectangleTable": {
          let targetPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            zone
          );
          if (event.shiftKey || this.bSnap2Grid) {
            targetPos = findClosestGridPoint({
              x: targetPos.x,
              y: targetPos.y,
            });
          }
          if (targetPos.x - 70 < 0 || targetPos.x + 70 > this.plan.size.width || targetPos.y - 50 < 0 || targetPos.y + 50 > this.plan.size.width)
            return;
          const dx = 120 / 3;
          let top = []
          for (let i = 0; i < 4; i++) top.push(i)
          top = top.map((item, idx) => {
            return {
              position: {
                x: idx * dx + 10,
                y: -10
              },
              seat_number: (idx + 1).toString(),
              color: "#333333",
              uuid: uuid(),
              guid: generateID(),
              radius: 10,
              special: 'top'
            }
          })
          let bottom = []
          for (let i = 0; i < 4; i++) bottom.push(i)
          bottom = bottom.map((item, idx) => {
            return {
              position: {
                x: idx * dx + 10,
                y: 70
              },
              radius: 10,
              seat_number: (idx + 5).toString(),
              color: "#333333",
              uuid: uuid(),
              guid: generateID(),
              special: 'bottom'
            }
          })
          const { labelName, abvName } = this.getUniqueTableName();
          const newId = uuid();
          usePlanStore()
            .createArea(this.selectedZone, {
              shape: "rectangleTable",
              capacity: {
                top: 4,
                bottom: 4,
                left: 0,
                right: 0,
              },
              rectangleTable: {
                width: 140,
                height: 60,
              },
              rotation: 0,
              uuid: newId,
              position: {
                x: targetPos.x,
                y: targetPos.y,
              },
              label: {
                name: labelName,
                abv: abvName,
                position: { x: 0, y: 0 },
                color: "#333333",
                text: "",
                size: 16
              },
              seats: [...top, ...bottom]
            })
            .then(() => {
              this.$nextTick(() => {
                store.toggleSelection([newId], this.selectedZone, false);
              });
            });
          break;
        }

        case "rowCircle":
        case "rowCircleFixedCenter": {
          if (this.tool !== "rowCircle" && this.tool !== "rowCircleFixedCenter")
            return false;
          let clickPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            null
          );
          if (event.shiftKey || this.bSnap2Grid) {
            clickPos = findClosestGridPoint({
              x: clickPos.x,
              y: clickPos.y,
              zone: zone,
            });
          }
          this.drawingCurrentX = clickPos.x;
          this.drawingCurrentY = clickPos.y;

          const store = useMainStore();
          store.circleRows(
            this.drawingCurrentX,
            this.drawingCurrentY,
            this.tool === "rowCircleFixedCenter"
          );
          store.changeTool("select");
          break;
        }
        case "row": {
          if (this.rowDrawing) {
            break;
          }
          let rowPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            null
          );
          if (event.shiftKey || this.bSnap2Grid)
            rowPos = findClosestGridPoint({
              x: rowPos.x,
              y: rowPos.y,
              zone: zone,
            });

          this.rowDrawing = true;
          this.drawingStartX = rowPos.x;
          this.drawingStartY = rowPos.y;
          this.drawingCurrentX = rowPos.x;
          this.drawingCurrentY = rowPos.y;
          this.rowCurrentX = rowPos.x;
          this.rowCurrentY = rowPos.y;
          break;
        }
        case "rows": {
          if (this.rowBlockDrawing) {
            break;
          }
          let pos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            null
          );
          if (event.shiftKey || this.bSnap2Grid)
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });

          this.rowBlockDrawing = true;
          this.drawingStartX = pos.x;
          this.drawingStartY = pos.y;
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          this.rowCurrentX = pos.x;
          this.rowCurrentY = pos.y;
          break;
        }
        case "stgrows": {
          if (this.stgrowBlockDrawing) {
            break;
          }
          let pos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            null
          );
          if (event.shiftKey || this.bSnap2Grid)
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });

          this.stgrowBlockDrawing = true;
          this.drawingStartX = pos.x;
          this.drawingStartY = pos.y;
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          this.rowCurrentX = pos.x;
          this.rowCurrentY = pos.y;
          break;
        }
      }
    },
    temp_Rotate(val) {
      const store = useMainStore();
      store.moveRotating(
        store.temp_ox,
        store.temp_oy,
        val * Math.PI / 180
      );
    },

    // Curve() {
    //   const store = useMainStore();
    //   store.circleRows(
    //     10,
    //     10,
    //     false
    //   );
    // },

    mousemove(event) {
      if (!this.svg) return;
      const store = useMainStore();
      // console.log(this.tool);
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      // console.log("MouseMove", this.svg, this.getSvgRect());
      const svgbox = this.getSvgRect();
      let pos = positionInZone(
        event.clientX - svgbox.x,
        event.clientY - svgbox.y,
        this.zoomTransform,
        null
      );
      const zone = this.plan.zones.find((z) => z.uuid === this.selectedZone);

      if (pos.x < 0 || pos.y < 0 || pos.x > this.plan.size.width || pos.y > this.plan.size.height) {
        this.mouseStatus = false;
        return;
      }

      this.mouseStatus = true;

      if (this.rotating && this.tool !== "seatselect") {
        let angle = -Math.atan(
          (this.rotatingOriginX - pos.x) / (this.rotatingOriginY - pos.y)
        );


        console.log(this.bSnap2Grid)
        // rotate-setting
        if (event.shiftKey || this.bSnap2Grid) {
          // Snap to 5° intervals
          if (angle < 0) angle += 2 * Math.PI;
          angle -= angle % ((5 / 180) * Math.PI);
        }
        if (pos.y > this.rotatingOriginY) angle += Math.PI;
        const store = useMainStore();
        store.moveRotating(
          this.rotatingOriginX,
          this.rotatingOriginY,
          angle - this.rotatingStartAngle
        );

        // console.log('sec', angle, this.rotatingStartAngle);
        this.rotatingStartAngle = angle;
        this.rotatingHandleX = pos.x;
        this.rotatingHandleY = pos.y;
        return;
      }
      if (this.resizing) {
        let distance = Math.sqrt(
          (pos.x - this.resizingOriginX) * (pos.x - this.resizingOriginX) +
          (pos.y - this.resizingOriginY) * (pos.y - this.resizingOriginY)
        );
        for (const z of this.plan.zones) {
          for (const row of z.rows) {
            if (this.selection.includes(row.uuid)) {
              if (row.seats.length < 2) return;
              const x0 = row.seats[0].position.x;
              const y0 = row.seats[0].position.y;
              const x1 = row.seats[1].position.x;
              const y1 = row.seats[1].position.y;
              if (
                Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1)) *
                (distance / this.resizingStartDistance) <
                20
              )
                return;
            }
          }
        }
        store.moveResizing(
          this.resizingOriginX,
          this.resizingOriginY,
          distance / this.resizingStartDistance,
        );
        this.resizingStartDistance = distance;
      }

      switch (this.tool) {
        case "select":
          if (store.dragging) {
            // if (this.selectionBoundary.x < 0 || this.selectionBoundary.y < 0 || this.selectionBoundary.x + this.selectionBoundary.width > (this.plan.size.width + 10) ||
            //   this.selectionBoundary.y + this.selectionBoundary.height > this.plan.size.height) return;
            store.moveDragging(
              pos.x,
              pos.y,
              event.shiftKey || this.bSnap2Grid,
              this.zoomTransform.k
            );
            // console.log('akfAjej', this.selectionBoundary)
            if (this.selectionBoundary) {
              useMainStore().set_Ox(this.selectionBoundary.x + this.selectionBoundary.width / 2);
              useMainStore().set_Oy(this.selectionBoundary.y + this.selectionBoundary.height / 2);
            }

          } else if (this.selecting) {
            this.selectingCurrentX = pos.x;
            this.selectingCurrentY = pos.y;

            let uuids = [];
            // console.log([...uuids]);
            const xmin = Math.min(this.selectingStartX, this.selectingCurrentX);
            const ymin = Math.min(this.selectingStartY, this.selectingCurrentY);
            const xmax = Math.max(this.selectingStartX, this.selectingCurrentX);
            const ymax = Math.max(this.selectingStartY, this.selectingCurrentY);
            // console.log(uuids, xmin, ymin, xmax, ymax);

            for (const z of this.plan.zones) {
              if (this.lockedZones.includes(z.uuid)) continue;
              for (const r of z.rows) {
                for (const s of r.seats) {
                  if (
                    z.position.x +
                    r.position.x +
                    s.position.x +
                    (s.radius || 10) >=
                    xmin &&
                    z.position.x +
                    r.position.x +
                    s.position.x -
                    (s.radius || 10) <=
                    xmax &&
                    z.position.y +
                    r.position.y +
                    s.position.y +
                    (s.radius || 10) >=
                    ymin &&
                    z.position.y +
                    r.position.y +
                    s.position.y -
                    (s.radius || 10) <=
                    ymax &&
                    !uuids.includes(r.uuid)
                  ) {
                    uuids.push(r.uuid);
                  }
                }
              }
              for (const a of z.areas) {
                if (testOverlap(a, z, xmin, ymin, xmax, ymax)) {
                  // console.log("HERE??");
                  uuids.push(a.uuid);
                }
              }
            }

            // console.log(this.selectedZone)
            //Edit Here plz

            if (this.selectionBoundary) {
              useMainStore().set_Ox(this.selectionBoundary.x + this.selectionBoundary.width / 2);
              useMainStore().set_Oy(this.selectionBoundary.y + this.selectionBoundary.height / 2);
            }
            store.setSelection(uuids, this.selectedZone, event.shiftKey);

          } else {
            return false;
          }

          break;
        case "seatselect":
          if (store.dragging) {
            store.moveDragging(
              pos.x,
              pos.y,
              event.shiftKey || this.bSnap2Grid,
              this.zoomTransform.k
            );
          } else if (this.selecting) {
            this.selectingCurrentX = pos.x;
            this.selectingCurrentY = pos.y;

            let uuids = [];
            // console.log([...uuids]);
            const xmin = Math.min(this.selectingStartX, this.selectingCurrentX);
            const ymin = Math.min(this.selectingStartY, this.selectingCurrentY);
            const xmax = Math.max(this.selectingStartX, this.selectingCurrentX);
            const ymax = Math.max(this.selectingStartY, this.selectingCurrentY);
            // console.log(uuids, xmin, ymin, xmax, ymax);


            for (const z of this.plan.zones) {
              if (this.lockedZones.includes(z.uuid)) continue;
              for (const r of z.rows) {
                for (const s of r.seats) {
                  if (
                    z.position.x +
                    r.position.x +
                    s.position.x +
                    (s.radius || 10) >=
                    xmin &&
                    z.position.x +
                    r.position.x +
                    s.position.x -
                    (s.radius || 10) <=
                    xmax &&
                    z.position.y +
                    r.position.y +
                    s.position.y +
                    (s.radius || 10) >=
                    ymin &&
                    z.position.y +
                    r.position.y +
                    s.position.y -
                    (s.radius || 10) <=
                    ymax
                  ) {
                    uuids.push(s.uuid);
                  }
                }
              }

              for (const a of z.areas) {
                if (a.shape === 'roundTable') {
                  for (const s of a.seats) {
                    let abox = {
                      x: a.position.x + s.position.x - (s.radius || 10),
                      y: a.position.y + s.position.y - (s.radius || 10),
                      width: 2 * (s.radius || 10),
                      height: 2 * (s.radius || 10)
                    }
                    if (a.rotation) {
                      abox = rotateRectangluarBox(a, abox);
                    }
                    abox.x += z.position.x;
                    abox.y += z.position.y;
                    if (
                      (abox.x + abox.width) >=
                      xmin &&
                      abox.x <=
                      xmax &&
                      (abox.y + abox.height) >=
                      ymin &&
                      abox.y <=
                      ymax
                    ) {
                      uuids.push(s.uuid);
                    }
                  }
                } else if (a.shape === 'rectangleTable') {
                  for (const s of a.seats) {
                    let abox = {
                      x: a.position.x + s.position.x - (s.radius || 10) - a.rectangleTable.width / 2,
                      y: a.position.y + s.position.y - (s.radius || 10) - a.rectangleTable.height / 2,
                      width: 2 * (s.radius || 10),
                      height: 2 * (s.radius || 10)
                    }
                    if (a.rotation) {
                      abox = rotateRectangluarBox(a, abox);
                    }
                    abox.x += z.position.x;
                    abox.y += z.position.y;
                    if (
                      (abox.x + abox.width) >=
                      xmin &&
                      abox.x <=
                      xmax &&
                      (abox.y + abox.height) >=
                      ymin &&
                      abox.y <=
                      ymax
                    ) {
                      uuids.push(s.uuid);
                    }
                  }
                }
              }
            }
            // console.log(this.selectedZone)

            store.setSelection(uuids, this.selectedZone, event.shiftKey);
          } else {
            return false;
          }
          break;
        case "gaCircle":
        case "gaSquare":
        case "rectangle":
        case "circle":
        case "ellipse":
          if (!this.drawing) return false;
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "roundTable":
        case "rectangleTable":
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "rowCircle":
        case "rowCircleFixedCenter":
          if (this.tool !== "rowCircle" && this.tool !== "rowCircleFixedCenter")
            return false;
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "row":
          this.rowCurrentX = pos.x;
          this.rowCurrentY = pos.y;
          if (!this.rowDrawing) return false;
          // rotate-setting
          if (event.shiftKey || this.bSnap2Grid) {
            // Snap to 5° intervals
            {
              const dx = pos.x - this.drawingStartX;
              const dy = pos.y - this.drawingStartY;
              let angle = (-Math.atan(dx / dy) / Math.PI) * 180;
              let distance = Math.sqrt(dx * dx + dy * dy);
              if (angle < 0) angle += 360;
              angle -= angle % 5;
              if (
                Math.round(Math.abs(angle)) === 90 ||
                Math.round(Math.abs(angle)) === 0 ||
                Math.round(Math.abs(angle)) === 180 ||
                Math.round(Math.abs(angle)) === 270
              ) {
                distance = Math.round(distance / 10) * 10;
              }
              this.drawingCurrentX =
                this.drawingStartX -
                Math.sign(dy) * distance * Math.sin((angle / 180) * Math.PI);
              this.drawingCurrentY =
                this.drawingStartY +
                Math.sign(dy) * distance * Math.cos((angle / 180) * Math.PI);
            }
          } else {
            this.drawingCurrentX = pos.x;
            this.drawingCurrentY = pos.y;
          }
          break;
        case "rows":
          this.rowCurrentX = pos.x;
          this.rowCurrentY = pos.y;
          if (!this.rowBlockDrawing) return false;
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "stgrows":
          this.rowCurrentX = pos.x;
          this.rowCurrentY = pos.y;
          if (!this.stgrowBlockDrawing) return false;
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "polygon":
        case "gaPolygon":
          if (store.dragging) {
            store.moveDragging(
              pos.x,
              pos.y,
              event.shiftKey || this.bSnap2Grid,
              this.zoomTransform.k
            );
            break;
          }
          if (!this.polygonDrawing) return false;

          // rotate-setting
          // if (event.shiftKey || this.bSnap2Grid) {
          // Snap to 5° intervals
          {
            const dx =
              pos.x - this.polygonPoints[this.polygonPoints.length - 1].x;
            const dy =
              pos.y - this.polygonPoints[this.polygonPoints.length - 1].y;
            let angle = (-Math.atan(dx / dy) / Math.PI) * 180;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (angle < 0) angle += 360;
            angle -= angle % 5;
            if (
              Math.round(Math.abs(angle)) === 90 ||
              Math.round(Math.abs(angle)) === 0 ||
              Math.round(Math.abs(angle)) === 180 ||
              Math.round(Math.abs(angle)) === 270
            ) {
              distance = Math.round(distance / 10) * 10;
            }
            this.drawingCurrentX =
              this.polygonPoints[this.polygonPoints.length - 1].x -
              Math.sign(dy) * distance * Math.sin((angle / 180) * Math.PI);
            this.drawingCurrentY =
              this.polygonPoints[this.polygonPoints.length - 1].y +
              Math.sign(dy) * distance * Math.cos((angle / 180) * Math.PI);
          }
          // } else {
          //   this.drawingCurrentX = pos.x;
          //   this.drawingCurrentY = pos.y;
          // }
          break;
      }
    },
    mouseup(event) {
      if (!this.svg) return;
      // console.log("~~~~~~~~~~~~~~~Mouse Up", this.tool);
      // if (this.tool == "handon") {
      //   console.log("MouseUP", this.tool);
      //   useMainStore().changeTool("hand");
      //   return false;
      // }
      const store = useMainStore();
      if (event.ctrlKey || event.metaKey) {
        // this is a panning event
        return false;
      }
      if (this.rotating) {
        this.rotating = false;
        this.rotatingOriginX = 0;
        this.rotatingOriginY = 0;
        usePlanStore().persistPlan();
        return;
      }
      if (this.resizing) {
        this.resizing = false;
        this.resizingOriginX = 0;
        this.resizingOriginY = 0;
        usePlanStore().persistPlan();
        return;
      }
      const svgbox = this.getSvgRect();
      const zone = this.plan.zones.find((z) => z.uuid === this.selectedZone);
      let pos = positionInZone(
        event.clientX - svgbox.x,
        event.clientY - svgbox.y,
        this.zoomTransform,
        null
      );
      const newId = uuid();
      const interval = new Date().getTime() - this.lastMouseUp;
      this.lastMouseUp = new Date().getTime();
      switch (this.tool) {
        // case "select":
        case "seatselect":
          // console.log('mouseup here')
          if (store.dragging) {
            store.stopDragging();
          } else if (this.selecting) {
            if (
              interval < 500 &&
              Math.abs(this.selectingCurrentX - this.selectingStartX) < 10
            ) {
              // "double click"
              store.changeTool("select");
              return true;
            }
            this.selecting = false;
            let uuids = [];
            const xmin = Math.min(this.selectingStartX, this.selectingCurrentX);
            const ymin = Math.min(this.selectingStartY, this.selectingCurrentY);
            const xmax = Math.max(this.selectingStartX, this.selectingCurrentX);
            const ymax = Math.max(this.selectingStartY, this.selectingCurrentY);
            for (const z of this.plan.zones) {
              if (this.lockedZones.includes(z.uuid)) continue;
              for (const r of z.rows) {
                for (const s of r.seats) {
                  if (
                    z.position.x +
                    r.position.x +
                    s.position.x +
                    (s.radius || 10) >=
                    xmin &&
                    z.position.x +
                    r.position.x +
                    s.position.x -
                    (s.radius || 10) <=
                    xmax &&
                    z.position.y +
                    r.position.y +
                    s.position.y +
                    (s.radius || 10) >=
                    ymin &&
                    z.position.y +
                    r.position.y +
                    s.position.y -
                    (s.radius || 10) <=
                    ymax
                  ) {
                    uuids.push(s.uuid);
                  }
                }
              }
              for (const a of z.areas) {
                if (a.shape === 'roundTable') {
                  for (const s of a.seats) {
                    let abox = {
                      x: a.position.x + s.position.x - (s.radius || 10),
                      y: a.position.y + s.position.y - (s.radius || 10),
                      width: 2 * (s.radius || 10),
                      height: 2 * (s.radius || 10)
                    }
                    if (a.rotation) {
                      abox = rotateRectangluarBox(a, abox);
                    }
                    abox.x += z.position.x;
                    abox.y += z.position.y;
                    if (
                      (abox.x + abox.width) >=
                      xmin &&
                      abox.x <=
                      xmax &&
                      (abox.y + abox.height) >=
                      ymin &&
                      abox.y <=
                      ymax
                    ) {
                      uuids.push(s.uuid);
                    }
                  }
                } else if (a.shape === 'rectangleTable') {
                  for (const s of a.seats) {
                    let abox = {
                      x: a.position.x + s.position.x - (s.radius || 10) - a.rectangleTable.width / 2,
                      y: a.position.y + s.position.y - (s.radius || 10) - a.rectangleTable.height / 2,
                      width: 2 * (s.radius || 10),
                      height: 2 * (s.radius || 10)
                    }
                    if (a.rotation) {
                      abox = rotateRectangluarBox(a, abox);
                    }
                    abox.x += z.position.x;
                    abox.y += z.position.y;
                    if (
                      (abox.x + abox.width) >=
                      xmin &&
                      abox.x <=
                      xmax &&
                      (abox.y + abox.height) >=
                      ymin &&
                      abox.y <=
                      ymax
                    ) {
                      uuids.push(s.uuid);
                    }
                  }
                }
              }
            }

            // console.log('SeatSelect', uuids, this.selectedZone);
            store.setSelection(uuids, this.selectedZone, event.shiftKey);
            console.log(this.selection);
            // console.log("Selectseat here");
            // console.log(store.selection)
            return true;
          }
          return false;
        case "select":
          // console.log('plan select')
          if (store.dragging) {
            store.stopDragging();
          } else if (this.selecting) {
            this.selecting = false;
            let uuids = [];
            const xmin = Math.min(this.selectingStartX, this.selectingCurrentX);
            const ymin = Math.min(this.selectingStartY, this.selectingCurrentY);
            const xmax = Math.max(this.selectingStartX, this.selectingCurrentX);
            const ymax = Math.max(this.selectingStartY, this.selectingCurrentY);
            for (const z of this.plan.zones) {
              if (this.lockedZones.includes(z.uuid)) continue;
              for (const r of z.rows) {
                for (const s of r.seats) {
                  if (
                    z.position.x +
                    r.position.x +
                    s.position.x +
                    (s.radius || 10) >=
                    xmin &&
                    z.position.x +
                    r.position.x +
                    s.position.x -
                    (s.radius || 10) <=
                    xmax &&
                    z.position.y +
                    r.position.y +
                    s.position.y +
                    (s.radius || 10) >=
                    ymin &&
                    z.position.y +
                    r.position.y +
                    s.position.y -
                    (s.radius || 10) <=
                    ymax &&
                    !uuids.includes(r.uuid)
                  ) {
                    uuids.push(r.uuid);
                  }
                }
              }
              for (const a of z.areas) {
                if (testOverlap(a, z, xmin, ymin, xmax, ymax)) {
                  // console.log("HERE??");
                  uuids.push(a.uuid);
                }
              }
            }

            // console.log(uuids, this.selectedZone);
            // console.log("Select", uuids, this.selectedZone, event.shiftKey);
            // console.log(this.selectedZone);

            store.setSelection(uuids, this.selectedZone, event.shiftKey);
            return true;
          }
          return false;
        case "gaCircle":
        case "gaSquare":
        case "rectangle":
        case "circle":
        case "ellipse":
          if (!this.drawing) return false;
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          if (this.tool === "rectangle") {
            const w = Math.abs(pos.x - this.drawingStartX);
            const h = Math.abs(pos.y - this.drawingStartY);
            if (w < 5 || h < 5) {
              this.drawing = false;
              return; // probably a misclick
            }
            usePlanStore()
              .createArea(this.selectedZone, {
                shape: "rectangle",
                color: "#cccccc", // todo: use previously used color
                border_color: "#000000", // todo: use previously used color
                border_width: 2,
                rotation: 0,
                uuid: newId,
                position: {
                  x: round(
                    Math.min(pos.x, this.drawingStartX) - zone.position.x,
                    4
                  ),
                  y: round(
                    Math.min(pos.y, this.drawingStartY) - zone.position.y,
                    4
                  ),
                },
                text: {
                  position: { x: round(w / 2, 4), y: round(h / 2, 4) },
                  color: "#333333",
                  text: "",
                },
                rectangle: {
                  width: round(w, 4),
                  height: round(h, 4),
                },
              })
              .then(() => {
                // console.log("HERE", "error", this.selectZone);

                this.$nextTick(() => {
                  store.toggleSelection([newId], this.selectedZone, false);
                });
              });
          } else if (this.tool === "gaSquare") {
            const w = Math.abs(pos.x - this.drawingStartX);
            const h = Math.abs(pos.y - this.drawingStartY);
            if (w < 5 || h < 5) {
              this.drawing = false;
              return; // probably a misclick
            }
            const { gaLabel, gaAbv } = this.getUniqueGAName();
            usePlanStore()
              .createArea(this.selectedZone, {
                shape: "gaSquare",
                label: gaLabel,
                abbreviation: gaAbv,
                section_label: "",
                section_abv: "",
                color: "#cccccc", // todo: use previously used color
                border_color: "#000000", // todo: use previously used color
                border_width: 2,
                rotation: 0,
                uuid: newId,
                guid: generateID(),
                capacity: 0,
                position: {
                  x: round(
                    Math.min(pos.x, this.drawingStartX) - zone.position.x,
                    4
                  ),
                  y: round(
                    Math.min(pos.y, this.drawingStartY) - zone.position.y,
                    4
                  ),
                },
                text: {
                  position: { x: round(w / 2, 4), y: round(h / 2, 4) },
                  color: "#333333",
                  text: gaAbv,
                },
                rectangle: {
                  width: round(w, 4),
                  height: round(h, 4),
                },
              })
              .then(() => {
                this.$nextTick(() => {
                  store.toggleSelection([newId], this.selectedZone, false);
                });
              });
          } else if (this.tool === "circle") {
            if (event.shiftKey || this.bSnap2Grid) {
              pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
            }
            const radius = round(
              Math.sqrt(
                Math.pow(this.drawingStartX - pos.x, 2) +
                Math.pow(this.drawingStartY - pos.y, 2)
              ),
              4
            );
            if (radius < 1) {
              this.drawing = false;
              return; // probably a misclick
            }
            usePlanStore()
              .createArea(this.selectedZone, {
                shape: "circle",
                color: "#cccccc", // todo: use previously used color
                border_color: "#000000", // todo: use previously used color
                border_width: 2,
                rotation: 0,
                uuid: newId,
                position: {
                  x: round(this.drawingStartX - zone.position.x, 4),
                  y: round(this.drawingStartY - zone.position.y, 4),
                },
                text: {
                  position: { x: 0, y: 0 },
                  color: "#333333",
                  text: "",
                },
                circle: {
                  radius: radius,
                },
              })
              .then(() => {
                this.$nextTick(() => {
                  store.toggleSelection([newId], this.selectedZone, false);
                });
              });
          } else if (this.tool === "ellipse") {
            if (event.shiftKey || this.bSnap2Grid) {
              pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
            }
            const w = Math.abs(pos.x - this.drawingStartX);
            const h = Math.abs(pos.y - this.drawingStartY);
            if (w < 5 || h < 5) {
              this.drawing = false;
              return; // probably a misclick
            }
            usePlanStore()
              .createArea(this.selectedZone, {
                shape: "ellipse",
                color: "#cccccc", // todo: use previously used color
                border_color: "#000000", // todo: use previously used color
                border_width: 2,
                rotation: 0,
                uuid: newId,
                position: {
                  x: round(this.drawingStartX - zone.position.x, 4),
                  y: round(this.drawingStartY - zone.position.y, 4),
                },
                text: {
                  position: { x: 0, y: 0 },
                  color: "#333333",
                  text: "",
                },
                ellipse: {
                  radius: {
                    x: round(w, 4),
                    y: round(h, 4),
                  },
                },
              })
              .then(() => {
                this.$nextTick(() => {
                  store.toggleSelection([newId], this.selectedZone, false);
                });
              });
          } else if (this.tool === "gaCircle") {
            if (event.shiftKey || this.bSnap2Grid) {
              pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
            }
            const w = Math.abs(pos.x - this.drawingStartX);
            const h = Math.abs(pos.y - this.drawingStartY);
            if (w < 5 || h < 5) {
              this.drawing = false;
              return; // probably a misclick
            }
            const { gaLabel, gaAbv } = this.getUniqueGAName();
            usePlanStore()
              .createArea(this.selectedZone, {
                shape: "gaCircle",
                label: gaLabel,
                abbreviation: gaAbv,
                section_label: "",
                section_abv: "",
                color: "#cccccc", // todo: use previously used color
                border_color: "#000000", // todo: use previously used color
                border_width: 2,
                rotation: 0,
                capacity: 0,
                uuid: newId,
                guid: generateID(),
                position: {
                  x: round(this.drawingStartX - zone.position.x, 4),
                  y: round(this.drawingStartY - zone.position.y, 4),
                },
                text: {
                  position: { x: 0, y: 0 },
                  color: "#333333",
                  text: gaAbv,
                },
                ellipse: {
                  radius: {
                    x: round(w, 4),
                    y: round(h, 4),
                  },
                },
              })
              .then(() => {
                this.$nextTick(() => {
                  store.toggleSelection([newId], this.selectedZone, false);
                });
              });
          }
          this.drawing = false;
          break;
        case "polygon":
          if (store.dragging) {
            store.stopDragging();
            break;
          }
          if (this.polygonDrawing) {
            const pp = this.polygonPoints;
            const polysnap = (pos, offset) => {
              // Snap to 5° intervals, and snap to grid length when at x*90°
              const dx = pos.x - pp[pp.length - offset].x;
              const dy = pos.y - pp[pp.length - offset].y;
              let angle = (-Math.atan(dx / dy) / Math.PI) * 180;
              let distance = Math.sqrt(dx * dx + dy * dy);
              if (angle < 0) angle += 360;
              angle -= angle % 5;
              if (
                Math.round(Math.abs(angle)) === 90 ||
                Math.round(Math.abs(angle)) === 0 ||
                Math.round(Math.abs(angle)) === 180 ||
                Math.round(Math.abs(angle)) === 270
              ) {
                distance = Math.round(distance / 10) * 10;
              }
              return {
                x:
                  pp[pp.length - offset].x -
                  Math.sign(dy) * distance * Math.sin((angle / 180) * Math.PI),
                y:
                  pp[pp.length - offset].y +
                  Math.sign(dy) * distance * Math.cos((angle / 180) * Math.PI),
              };
            };
            let comparepos = pos;
            if (event.shiftKey || this.bSnap2Grid) {
              pos = polysnap(pos, 1);
              if (pp.length > 1) {
                comparepos = polysnap(pos, 2);
              }
            }
            // if (
            //   comparepos.x ===
            //   this.polygonPoints[this.polygonPoints.length - 1].x &&
            //   comparepos.y ===
            //   this.polygonPoints[this.polygonPoints.length - 1].y
            // )
            if (
              Math.abs(comparepos.x - this.polygonPoints[this.polygonPoints.length - 1].x) < 5
              && Math.abs(comparepos.y - this.polygonPoints[this.polygonPoints.length - 1].y) < 5
            ) {
              // "Double click"
              this.finishPolygon();
            } else {
              this.polygonPoints.push(pos);
            }
          } else {
            this.polygonDrawing = true;
            if (event.shiftKey || this.bSnap2Grid) {
              pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
            }
            this.polygonPoints = [pos];
          }
          break;
        case "gaPolygon":
          if (store.dragging) {
            store.stopDragging();
            break;
          }
          if (this.polygonDrawing) {
            const pp = this.polygonPoints;
            const polysnap = (pos, offset) => {
              // Snap to 5° intervals, and snap to grid length when at x*90°
              const dx = pos.x - pp[pp.length - offset].x;
              const dy = pos.y - pp[pp.length - offset].y;
              let angle = (-Math.atan(dx / dy) / Math.PI) * 180;
              let distance = Math.sqrt(dx * dx + dy * dy);
              if (angle < 0) angle += 360;
              angle -= angle % 5;
              if (
                Math.round(Math.abs(angle)) === 90 ||
                Math.round(Math.abs(angle)) === 0 ||
                Math.round(Math.abs(angle)) === 180 ||
                Math.round(Math.abs(angle)) === 270
              ) {
                distance = Math.round(distance / 10) * 10;
              }
              return {
                x:
                  pp[pp.length - offset].x -
                  Math.sign(dy) * distance * Math.sin((angle / 180) * Math.PI),
                y:
                  pp[pp.length - offset].y +
                  Math.sign(dy) * distance * Math.cos((angle / 180) * Math.PI),
              };
            };
            let comparepos = pos;
            if (event.shiftKey || this.bSnap2Grid) {
              pos = polysnap(pos, 1);
              if (pp.length > 1) {
                comparepos = polysnap(pos, 2);
              }
            }
            // if (
            //   comparepos.x ===
            //   this.polygonPoints[this.polygonPoints.length - 1].x &&
            //   comparepos.y ===
            //   this.polygonPoints[this.polygonPoints.length - 1].y
            // )
            if (
              Math.abs(comparepos.x - this.polygonPoints[this.polygonPoints.length - 1].x) < 5
              && Math.abs(comparepos.y - this.polygonPoints[this.polygonPoints.length - 1].y) < 5
            ) {
              // "Double click"
              this.finishGAPolygon();
            } else {
              this.polygonPoints.push(pos);
            }
          } else {
            this.polygonDrawing = true;
            if (event.shiftKey || this.bSnap2Grid) {
              pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
            }
            this.polygonPoints = [pos];
          }
          break;
        case "rows":
          // if mouseup is in same spot as mousedown, keep drawing, as this
          // was the original behaviour with click-draw-click vs. mousedown-draw-mouseup
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          if (this.drawingStartX === pos.x && this.drawingStartY === pos.y) {
            break;
          }
          if (this.rowBlockDrawing) {
            usePlanStore()
              .createRowBlock(
                zone.uuid,
                {
                  x: this.rowBlockPosition.x - zone.position.x,
                  y: this.rowBlockPosition.y - zone.position.y,
                },
                this.rowBlockRows,
                this.rowBlockSeats,
                this.rowSpacing,
                this.rowSeatSpacing
              )
              .then((rowIds) => {
                this.$nextTick(() => {
                  store.toggleSelection(rowIds, this.selectedZone, false);
                });
              });
            this.rowBlockDrawing = false;
          }
          break;
        case "stgrows":
          // if mouseup is in same spot as mousedown, keep drawing, as this
          // was the original behaviour with click-draw-click vs. mousedown-draw-mouseup
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          if (this.drawingStartX === pos.x && this.drawingStartY === pos.y) {
            break;
          }
          if (this.stgrowBlockDrawing) {
            usePlanStore()
              .createStgRowBlock(
                zone.uuid,
                {
                  x: this.rowBlockPosition.x - zone.position.x,
                  y: this.rowBlockPosition.y - zone.position.y,
                },
                this.stgrowBlockRows,
                this.stgrowBlockSeats,
                this.rowSpacing,
                this.rowSeatSpacing
              )
              .then((rowIds) => {
                this.$nextTick(() => {
                  store.toggleSelection(rowIds, this.selectedZone, false);
                });
              });
            this.stgrowBlockDrawing = false;
          }
          break;
        case "row":
          // if mouseup is in same spot as mousedown, keep drawing, as this
          // was the original behaviour with click-draw-click vs. mousedown-draw-mouseup
          if (event.shiftKey || this.bSnap2Grid) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          if (this.drawingStartX === pos.x && this.drawingStartY === pos.y) {
            break;
          }
          if (this.rowDrawing) {
            usePlanStore()
              .createRow(
                zone.uuid,
                {
                  x: this.drawingStartX - zone.position.x,
                  y: this.drawingStartY - zone.position.y,
                },
                this.rowDrawingSeats.map((s) => {
                  return {
                    x: s.x - (this.drawingStartX - zone.position.x),
                    y: s.y - (this.drawingStartY - zone.position.y),
                  };
                })
              )
              .then((rowId) => {
                this.$nextTick(() => {
                  store.toggleSelection([rowId], this.selectedZone, false);
                });
              });
            this.rowDrawing = false;
          }
          break;
      }
    },


    finishPolygon() {
      const newId = uuid();
      const zone = this.plan.zones.find((z) => z.uuid === this.selectedZone);
      this.polygonDrawing = false;

      const minx = Math.min(...this.polygonPoints.map((p) => p.x));
      const miny = Math.min(...this.polygonPoints.map((p) => p.y));
      const maxx = Math.max(...this.polygonPoints.map((p) => p.x));
      const maxy = Math.max(...this.polygonPoints.map((p) => p.y));
      usePlanStore()
        .createArea(this.selectedZone, {
          shape: "polygon",
          color: "#cccccc", // todo: use previously used color
          border_color: "#000001", // todo: use previously used color
          border_width: 2,
          rotation: 0,
          uuid: newId,
          position: {
            x: minx - zone.position.x,
            y: miny - zone.position.y,
          },
          text: {
            position: { x: (maxx - minx) / 2, y: (maxy - miny) / 2 },
            color: "#333333",
            text: "",
          },
          polygon: {
            points: this.polygonPoints.map((p) => ({
              x: p.x - minx,
              y: p.y - miny,
            })),
          },
        })
        .then(() => {
          this.$nextTick(() => {
            const store = useMainStore();
            store.toggleSelection([newId], this.selectedZone, false);
          });
        });
    },


    finishGAPolygon() {
      const newId = uuid();
      const zone = this.plan.zones.find((z) => z.uuid === this.selectedZone);
      this.polygonDrawing = false;

      const minx = Math.min(...this.polygonPoints.map((p) => p.x));
      const miny = Math.min(...this.polygonPoints.map((p) => p.y));
      const maxx = Math.max(...this.polygonPoints.map((p) => p.x));
      const maxy = Math.max(...this.polygonPoints.map((p) => p.y));
      const { gaLabel, gaAbv } = this.getUniqueGAName();
      usePlanStore()
        .createArea(this.selectedZone, {
          shape: "gaPolygon",
          color: "#cccccc", // todo: use previously used color
          border_color: "#000001", // todo: use previously used color
          border_width: 2,
          rotation: 0,
          uuid: newId,
          guid: generateID(),
          capacity: 0,
          label: gaLabel,
          abbreviation: gaAbv,
          section_label: "",
          section_abv: "",
          position: {
            x: minx - zone.position.x,
            y: miny - zone.position.y,
          },
          text: {
            position: { x: (maxx - minx) / 2, y: (maxy - miny) / 2 },
            color: "#333333",
            text: gaAbv,
          },
          polygon: {
            points: this.polygonPoints.map((p) => ({
              x: p.x - minx,
              y: p.y - miny,
            })),
          },
        })
        .then(() => {
          this.$nextTick(() => {
            const store = useMainStore();
            store.toggleSelection([newId], this.selectedZone, false);
          });
        });
    },

    persistBackground(event) {
      window.localStorage.setItem(
        "frontrow2.editor.bg",
        JSON.stringify({
          background: this.background,
          backgroundOpacity: this.backgroundOpacity,
          backgroundX: this.backgroundX,
          backgroundY: this.backgroundY,
          backgroundWidth: this.backgroundWidth,
          backgroundHeight: this.backgroundHeight,
        })
      );
    },

    createStage() {
      // console.log('createStage')
      const newId = 'b6ea4e4c-4bbc-45eb-ab8d-53fae88c5363#';
      if (this.plan.zones[0].areas.findIndex(item => item.uuid === newId) === -1) {
        usePlanStore()
          .createArea(this.selectedZone, {
            shape: "text",
            rotation: 0,
            uuid: newId,
            position: {
              x: this.plan.size.width / 2,
              y: 100,
            },
            text: {
              position: { x: 0, y: 0 },
              color: "#333333",
              text: "STAGE",
              size: 40,
            },
          })
          .then(() => {
            this.$nextTick(() => {
              this.store.toggleSelection([newId], this.selectedZone, false);
            });
          });
      }
    },

    wheel(event) {
      if (event.ctrlKey) return;
      const width = window.innerWidth - 300;
      const height = window.innerHeight - 40;
      const boxWidth = this.zoomTransform.k * this.plan.size.width;
      const boxHeight = this.zoomTransform.k * this.plan.size.height;
      if (event.deltaY > 0 && this.zoomTransform.y < -boxHeight + 100) return;
      if (event.deltaY < 0 && (this.zoomTransform.y + boxHeight) > (height + boxHeight - 100)) return;
      if (event.deltaX > 0 && this.zoomTransform.x < -boxWidth + 100) return;
      if (event.deltaX < 0 && (this.zoomTransform.x + boxWidth) > (width + boxWidth - 100)) return;
      this.zoomTransform.x -= event.deltaX / 10;
      this.zoomTransform.y -= event.deltaY / 10;
    },

    createZoom() {
      if (!this.svg) return;

      const viewportHeight = this.svg.clientHeight;
      const viewportWidth = this.svg.clientWidth;
      const panPadding = viewportHeight * -10;
      this.defaultScale = this.plan.size.height
        ? Math.min(
          (viewportWidth - 130) / this.plan.size.width,
          (viewportHeight - 130) / this.plan.size.height
        )
        : 1;
      this.zoom = d3
        .zoom()
        .scaleExtent([
          Math.min(this.defaultScale * 0.5, 1),
          Math.max(5, this.defaultScale * 5),
        ])
        .translateExtent([
          [
            (-viewportWidth + panPadding) / this.defaultScale,
            (-viewportHeight + panPadding) / this.defaultScale,
          ],
          [
            (viewportWidth - panPadding) / this.defaultScale +
            this.plan.size.width,
            (viewportHeight - panPadding) / this.defaultScale +
            this.plan.size.height,
          ],
        ])
        .extent([
          [0, 0],
          [viewportWidth, viewportHeight],
        ])
        .filter((event) => {
          const wheeled = event.type === "wheel";
          const mouseDrag =
            event.type === "mousedown" ||
            event.type === "mouseup" ||
            event.type === "mousemove";
          const touch =
            event.type === "touchstart" ||
            event.type === "touchmove" ||
            event.type === "touchstop";
          return (
            (wheeled || mouseDrag || touch) &&
            (event.metaKey ||
              event.ctrlKey ||
              this.tool == "hand" ||
              this.tool == "handon")
          );
        })
        .wheelDelta((event) => {
          if (event.ctrlKey) {
            return (
              -event.deltaY *
              (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002)
            );
          } else return 0;
        })
        .on("zoom", (event) => {
          const scale = event.transform.k;
          console.log(event.transform.k)
          useMainStore().setZoomTransform(event.transform);

          this.zoom.translateExtent([
            [
              (-viewportWidth + panPadding) / scale,
              (-viewportHeight + panPadding) / scale,
            ],
            [
              (viewportWidth - panPadding) / scale + this.plan.size.width,
              (viewportHeight - panPadding) / scale + this.plan.size.height,
            ],
          ]);
        });

      // // // todo: old code had an zoom.on("zoom", null); do we need that?
      // useMainStore().changeTool("hand");

      const initTransform = d3.zoomIdentity
        .scale(this.defaultScale)
        .translate(
          (viewportWidth / this.defaultScale - this.plan.size.width) / 2,
          (viewportHeight / this.defaultScale - this.plan.size.height) / 2
        );
      useMainStore().setZoomTransform(initTransform);

      d3.select(this.svg)
        .call(this.zoom.transform, initTransform)
        .on("wheel", function (event) {
          // Prevent scrolling when the min/max of the zoom extent is reached
          event.preventDefault();

        });

      const svg = d3.select(this.svg).call(this.zoom);
      svg.on("touchmove.zoom", null);

      // console.log("successed", this.zoom);
    },

    hotkey(event) {
      const width = window.innerWidth - 300;
      const height = window.innerHeight - 40;
      const boxWidth = this.zoomTransform.k * this.plan.size.width;
      const boxHeight = this.zoomTransform.k * this.plan.size.height;
      if (
        event.target !== document.body &&
        !event.target.matches(".c-toolbar *")
      ) {
        return; // Do nothing if something is focused, e.g. an input element (except it's a toolbar button)
      }
      switch (event.code) {
        case "Delete":
        case "Backspace":
          usePlanStore().deleteObjects(this.selection);
          event.preventDefault(); // prevent backspace to go history back in Firefox on Mac
          return;
        case "Enter":
          if (this.polygonDrawing) {
            this.finishPolygon();
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
          return false;
        case "Escape":
          this.rowBlockDrawing = false;
          this.rowDrawing = false;
          this.polygonDrawing = false;
          this.drawing = false;
          if (
            this.tool === "rowCircle" ||
            this.tool === "rowCircleFixedCenter"
          ) {
            useMainStore().changeTool("select");
          }
          event.preventDefault();
          event.stopPropagation();
          return;

        case "ArrowUp":
          if (this.selection.length) {
            useMainStore().moveSelected(
              0,
              -1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
            );
          } else {
            if ((this.zoomTransform.y + boxHeight) > (height + boxHeight - 100)) return;
            this.zoomTransform.y += 1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10);
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        case "ArrowDown":
          if (this.selection.length) {
            useMainStore().moveSelected(
              0,
              1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
            );
          } else {
            if (this.zoomTransform.y < -boxHeight + 100) return;
            this.zoomTransform.y -= 1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10);
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        case "ArrowLeft":
          if (this.selection.length) {
            useMainStore().moveSelected(
              -1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10),
              0
            );
          } else {
            if ((this.zoomTransform.x + boxWidth) > (width + boxWidth - 100)) return;
            this.zoomTransform.x += 1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        case "ArrowRight":
          if (this.selection.length) {
            useMainStore().moveSelected(
              1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10),
              0
            );
          } else {
            if (this.zoomTransform.x < -boxWidth + 100) return;
            this.zoomTransform.x -= 1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
          }
          event.preventDefault();
          event.stopPropagation();
          return;
      }
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case "a":
            useMainStore().selectAll();
            event.preventDefault();
            event.stopPropagation();
            return true;
          case "s": {
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(this.plan, undefined, 2)])
            );
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = this.plan.name + ".json";
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
          case "c":
            if (this.tool === "seatselect") {
              alert(
                "Copying individual seats is currently not possible, please select a row instead."
              );
              return;
            }
            useMainStore().copy(this.selection);
            event.preventDefault();
            event.stopPropagation();
            return true;
          case "x":
            if (this.tool === "seatselect") {
              alert(
                "Copying individual seats is currently not possible, please select a row instead."
              );
              return;
            }
            useMainStore().cut(this.selection);
            event.preventDefault();
            event.stopPropagation();
            return true;
          case "v":
            useMainStore().paste();
            event.preventDefault();
            event.stopPropagation();
            return true;
          case "z":
            usePlanStore().undo();
            event.preventDefault();
            event.stopPropagation();
            return true;
          case "y":
            usePlanStore().redo();
            event.preventDefault();
            event.stopPropagation();
            return true;
          case "+":
            if (this.tool === "rows") {
              this.rowSpacing += event.altKey ? 0.1 : 1;
              event.preventDefault();
              event.stopPropagation();
              return true;
            }
            break;
          case "-":
            if (this.tool === "rows" && event.ctrlKey) {
              this.rowSpacing -= event.altKey ? 0.1 : 1;
              event.preventDefault();
              event.stopPropagation();
              return true;
            }
            break;
        }
      } else {
        switch (event.key) {
          case "+":
            if (["rows", "row"].includes(this.tool)) {
              this.rowSeatSpacing += event.altKey ? 0.1 : 1;
            }
            break;
          case "-":
            if (["rows", "row"].includes(this.tool)) {
              this.rowSeatSpacing -= event.altKey ? 0.1 : 1;
            }
            break;
          case "v":
            useMainStore().changeTool("select");
            break;
          case "s":
            useMainStore().changeTool("seatselect");
            break;
          case "n":
            useMainStore().changeTool("row");
            break;
          case "b":
            useMainStore().changeTool("rows");
            break;
          case "r":
            useMainStore().changeTool("rectangle");
            break;
          case "c":
            useMainStore().changeTool("circle");
            break;
          case "e":
            useMainStore().changeTool("ellipse");
            break;
          case "p":
            useMainStore().changeTool("polygon");
            break;
          case "t":
            useMainStore().changeTool("text");
            break;
        }
      }
    },

    getTransform() {
      return this.zoomTransform.k;
    },
    setTransform(v) {
      this.zoomTransform.k = v;
    },

    scaleBy(temp, factor) {
      // console.log(temp, factor);
      d3.select(temp).transition().call(this.zoom.scaleBy, factor);
    },

    scaleTo(temp, factor) {
      // console.log(temp, factor);
      d3.select(temp).transition().call(this.zoom.scaleTo, factor);
    },

    // testFunc() {
    //   console.log("This is the test Func");
    // },
  },

  mounted() {
    // console.log("Mounted");
    this.createStage();
    this.createZoom();
    // window.addEventListener("resize", this.createZoom);
    window.addEventListener("keydown", this.hotkey);
  },
  beforeUnmout() {
    // window.addEventListener("resize", this.createZoom);
    window.addEventListener("keydown", this.hotkey);
  },
};
</script>
<template>
  <svg id="svg" :width="plan.size.width" :height="plan.size.height"
    v-if="plan.size" @mousemove="mousemove" @mousedown="mousedown"
    @mouseup="mouseup" @wheel="wheel" ref="svg" style="
      width: 100%;
      height: 100%;
      background-color: rgb(151, 162, 182);
      user-select: none;">
    <metadata>
      <booktix-data>
        <chartname>
          {{ plan.name }}
        </chartname>
        <categories>
          <category v-for="(category, idx) in categories" :key="idx">
            <name>{{ category.name }}</name>
            <color>{{ category.color }}</color>
          </category>
        </categories>
        <sections>
          <section v-for="(section, idx) in sections" :key="idx">
            <name>{{ section.label }}</name>
            <abv>{{ section.abv }}</abv>
          </section>
        </sections>
      </booktix-data>
    </metadata>
    <defs>
      <clipPath id="clip">
        <rect :width="plan.size.width" :height="plan.size.height" />
      </clipPath>
    </defs>
    <g :class="mainclasses" :transform="zoomTransform.toString()"
      clip-path="url(#clip)">
      <rect :width="plan.size.width" :height="plan.size.height" fill="#fcfcfc"
        :cursor="cursor"></rect>
      <image v-if="background" :width="backgroundWidth" :height="backgroundHeight"
        :href="background" :opacity="backgroundOpacity / 100" :x="backgroundX"
        :y="backgroundY"></image>
      <defs>
        <pattern id="smallGrid" width="20" height="20"
          patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ddd"
            stroke-width="0.5"></path>
        </pattern>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#smallGrid)"></rect>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ccc"
            stroke-width="1"></path>
        </pattern>
      </defs>
      <rect v-if="grid" :width="plan.size.width" :height="plan.size.height"
        fill="url(#grid)" :cursor="cursor">
      </rect>
      <ZoneComponent v-for="z in plan.zones" :zone="z" :key="z.uuid"
        :startDragging="startDragging"
        :startDraggingPolygonPoint="startDraggingPolygonPoint" :ox="temp_ox"
        :oy="temp_oy" :selectionBoundary="selectionBoundary">
      </ZoneComponent>

      <rect class="selection-box" v-for="b in selectionBoxesVisible"
        :x="b.x - 1.5" :y="b.y - 1.5" :width="b.width + 3" :height="b.height + 3"
        :key="b" fill="none"></rect>

      <line class="selection-rotate-handle-connector"
        v-if="selection.length && selectionBoundary && currentToolStatus"
        :x1="rotateHandle.x" :y1="rotateHandle.y" :x2="rotatingOriginX
          ? rotatingOriginX
          : selectionBoundary.x + selectionBoundary.width / 2
          " :y2="rotatingOriginY
    ? rotatingOriginY
    : selectionBoundary.y + selectionBoundary.height / 2
    "></line>
      <circle class="selection-rotate-handle"
        v-if="selection.length && selectionBoundary && currentToolStatus"
        :cx="rotateHandle.x" :cy="rotateHandle.y" r="5"
        @mousedown="startRotating"></circle>
      <circle class="selection-rotate-handle-end"
        v-if="selection.length && selectionBoundary && currentToolStatus" :cx="rotatingOriginX
          ? rotatingOriginX
          : selectionBoundary.x + selectionBoundary.width / 2
          " :cy="rotatingOriginY
    ? rotatingOriginY
    : selectionBoundary.y + selectionBoundary.height / 2
    " r="5"></circle>
      <rect class="selection-boundary"
        v-if="selection.length && selectionBoundary"
        :x="selectionBoundary.x - 1.5" :y="selectionBoundary.y - 1.5"
        :width="selectionBoundary.width + 3"
        :height="selectionBoundary.height + 3" fill="none"></rect>
      <rect class="selection-resize-handle-nw"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats && noTableSelection"
        :x="selectionBoundary.x - 4.5" :y="selectionBoundary.y - 4.5" :width="6"
        :height="6" @mousedown="startResizing($event, 'nw')"></rect>
      <rect class="selection-resize-handle-ne"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats && noTableSelection"
        :x="selectionBoundary.x + selectionBoundary.width - 1.5"
        :y="selectionBoundary.y - 4.5" :width="6" :height="6"
        @mousedown="startResizing($event, 'ne')"></rect>
      <rect class="selection-resize-handle-sw"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats && noTableSelection"
        :x="selectionBoundary.x - 4.5"
        :y="selectionBoundary.y + selectionBoundary.height - 1.5" :width="6"
        :height="6" @mousedown="startResizing($event, 'sw')"></rect>
      <rect class="selection-resize-handle-se"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats && noTableSelection"
        :x="selectionBoundary.x + selectionBoundary.width - 1.5"
        :y="selectionBoundary.y + selectionBoundary.height - 1.5" :width="6"
        :height="6" fill="none" @mousedown="startResizing($event, 'se')"></rect>
      <rect class="preview"
        v-if="(tool == 'rectangle' || tool == 'gaSquare') && drawing"
        :x="Math.min(drawingStartX, drawingCurrentX)"
        :y="Math.min(drawingStartY, drawingCurrentY)"
        :width="Math.abs(drawingStartX - drawingCurrentX)"
        :height="Math.abs(drawingStartY - drawingCurrentY)"></rect>
      <circle class="preview" v-else-if="tool == 'circle' && drawing"
        :cx="drawingStartX" :cy="drawingStartY" :r="Math.sqrt(
          Math.pow(drawingStartX - drawingCurrentX, 2) +
          Math.pow(drawingStartY - drawingCurrentY, 2)
        )
          "></circle>
      <ellipse class="preview"
        v-else-if="(tool == 'ellipse' || tool == 'gaCircle') && drawing"
        :cx="drawingStartX" :cy="drawingStartY"
        :rx="Math.abs(drawingStartX - drawingCurrentX)"
        :ry="Math.abs(drawingStartY - drawingCurrentY)"></ellipse>

      <polygon class="preview" v-else-if="tool === 'polygon' && polygonDrawing"
        x="0" y="0" :points="polygonPreviewPoints"></polygon>

      <polygon class="preview" v-else-if="tool === 'gaPolygon' && polygonDrawing"
        x="0" y="0" :points="polygonPreviewPoints"></polygon>

      <g class="row-circle-preview"
        v-else-if="tool === 'rowCircle' || tool === 'rowCircleFixedCenter'">
        <circle class="preview" v-for="circ in rowCirclePreviews" :r="circ.radius"
          :cx="circ.cx" :cy="circ.cy" :key="circ"></circle>
        <circle class="preview-center" v-for="circ in rowCirclePreviews" :r="2"
          :cx="circ.cx" :cy="circ.cy" :key="circ"></circle>
      </g>

      <g class="preview" v-else-if="(tool === 'roundTable') && mouseStatus">
        <circle class="seat-preview" :cx="drawingCurrentX" :cy="drawingCurrentY"
          :r="25">
        </circle>
        <circle class="seat-preview" v-for="index in 6" :key="index"
          :cx="drawingCurrentX + 35 * Math.cos(2 * Math.PI / 6 * index)"
          :cy="drawingCurrentY + 35 * Math.sin(2 * Math.PI / 6 * index)" :r="10">
        </circle>
      </g>

      <g class="preview" v-else-if="(tool === 'rectangleTable') && mouseStatus"
        :transform="`translate(-70, -30)`">
        <rect class="seat-preview" :x="drawingCurrentX" :y="drawingCurrentY"
          :width="140" :height="60">
        </rect>
        <circle class="seat-preview" v-for="index in 4" :key="index"
          :cx="drawingCurrentX + 40 * (index - 1) + 10" :cy="drawingCurrentY - 10"
          :r="10">
        </circle>
        <circle class="seat-preview" v-for="index in 4" :key="index"
          :cx="drawingCurrentX + 40 * (index - 1) + 10" :cy="drawingCurrentY + 70"
          :r="10">
        </circle>
      </g>

      <circle class="seat-preview"
        v-else-if="tool === 'row' && !rowDrawing && mouseStatus" :cx="rowCurrentX"
        :cy="rowCurrentY" :r="10"></circle>
      <circle class="seat-preview"
        v-else-if="tool === 'rows' && !rowBlockDrawing && mouseStatus"
        :cx="rowCurrentX" :cy="rowCurrentY" :r="10"></circle>
      <circle class="seat-preview"
        v-else-if="tool === 'stgrows' && !stgrowBlockDrawing && mouseStatus"
        :cx="rowCurrentX" :cy="rowCurrentY" :r="10"></circle>
      <g class="row-preview" v-else-if="tool === 'row' && rowDrawing">
        <line class="preview" :x1="drawingStartX" :y1="drawingStartY"
          :x2="drawingCurrentX" :y2="drawingCurrentY"></line>
        <line class="auxline"
          :x1="drawingStartX - (drawingCurrentX - drawingStartX) * 1000"
          :y1="drawingStartY - (drawingCurrentY - drawingStartY) * 1000"
          :x2="drawingCurrentX + (drawingCurrentX - drawingStartX) * 1000"
          :y2="drawingCurrentY + (drawingCurrentY - drawingStartY) * 1000"></line>
        <text v-if="rowDrawingSeats.length >= 3" :x="(rowDrawingSeats[rowDrawingSeats.length - 1].x -
          rowDrawingSeats[0].x) /
          rowDrawingSeats.length +
          rowDrawPosition.x +
          10
          " :y="(rowDrawingSeats[rowDrawingSeats.length - 1].y -
    rowDrawingSeats[0].y) /
    rowDrawingSeats.length +
    rowDrawPosition.y -
    30
    " text-anchor="middle" fill="black" dy=".35em" style="z-index: 99">
          {{ rowDrawingSeats.length }} Seats
        </text>
        <circle class="seat-preview" v-for="(s, sid) in rowDrawingSeats"
          :key="sid" :cx="s.x" :cy="s.y" r="10"></circle>
      </g>
      <g class="rows-preview" v-else-if="tool === 'rows' && rowBlockDrawing"
        :transform="rowBlockTransform">
        <g v-for="rid in rowBlockRows" :key="rid">
          <circle class="seat-preview" v-for="sid in rowBlockSeats" :key="sid"
            :cx="rowSeatSpacing * (sid - 1)" :cy="rowSpacing * (rid - 1)" r="10">
          </circle>
        </g>
        <text v-if="rowBlockRows * rowBlockSeats > 0" :x="10" :y="-30"
          fill="black" dy=".35em" style="z-index: 99">
          {{ rowBlockRows }} × {{ rowBlockSeats }} Seats
        </text>

      </g>
      <g class="rows-preview" v-else-if="tool === 'stgrows' && stgrowBlockDrawing"
        :transform="rowBlockTransform">
        <!-- //change here -->
        <g v-for="rid in stgrowBlockRows" :key="rid">
          <g v-if="rid % 2">
            <circle class="seat-preview" v-for="sid in stgrowBlockSeats"
              :key="sid"
              :cx="rid % 2 ? rowSeatSpacing * (sid - 1) : rowSeatSpacing * (sid - 1) + rowSeatSpacing / 2"
              :cy="rowSpacing * (rid - 1)" r="10">
            </circle>
          </g>
          <g v-if="rid % 2 === 0">
            <circle class="seat-preview" v-for="sid in stgrowBlockSeats1"
              :key="sid"
              :cx="rid % 2 ? rowSeatSpacing * (sid - 1) : rowSeatSpacing * (sid - 1) + rowSeatSpacing / 2"
              :cy="rowSpacing * (rid - 1)" r="10">
            </circle>
          </g>
        </g>

        <text v-if="stgrowBlockRows * stgrowBlockSeats > 0" :x="10" :y="-30"
          fill="black" dy=".35em" style="z-index: 99">
          {{ stgrowBlockRows }} × {{ stgrowBlockSeats }} Seats
        </text>
      </g>

      <rect class="selection-area"
        v-else-if="(tool == 'select' || tool == 'seatselect') && selecting"
        :x="Math.min(selectingStartX, selectingCurrentX)"
        :y="Math.min(selectingStartY, selectingCurrentY)"
        :width="Math.abs(selectingStartX - selectingCurrentX)"
        :height="Math.abs(selectingStartY - selectingCurrentY)"></rect>
    </g>
  </svg>
</template>
<style>
.c-plan {
  width: 100%;
  height: 100%;
}

.c-plan svg {
  width: 100%;
  height: 100%;
  display: block;
}

.c-plan svg image {
  pointer-events: none;
}

.c-plan svg * {
  -webkit-touch-callout: none;
  /* iOS Safari */
  -webkit-user-select: none;
  /* Safari */
  -khtml-user-select: none;
  /* Konqueror HTML */
  -moz-user-select: none;
  /* Old versions of Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
  user-select: none;
}

svg .selection-area {
  stroke-width: 1.5px;
  fill: #8fc8f330;
  stroke: #0064d050;
}

svg .selection-box {
  stroke-width: 1.5px;
  stroke: #0064d0;
}

svg .selection-resize-handle-nw {
  fill: #0064d0;
  cursor: nw-resize;
}

svg .selection-resize-handle-ne {
  fill: #0064d0;
  cursor: ne-resize;
}

svg .selection-resize-handle-sw {
  fill: #0064d0;
  cursor: sw-resize;
}

svg .selection-resize-handle-se {
  fill: #0064d0;
  cursor: se-resize;
}

svg .selection-rotate-handle {
  fill: #0064d0;
  cursor: grab;
}

svg .selection-rotate-handle-connector,
svg .selection-rotate-handle-end {
  fill: #fff;
  stroke-width: 1.5px;
  stroke: #0064d0;
  pointer-events: none;
}

svg .selection-boundary {
  box-shadow: 0 0 5px 5px #0064d0;
  stroke: #0064d0;
  stroke-width: 1.5px;
  stroke-dasharray: 3, 3;
}

svg .preview {
  stroke: #0064d0;
  stroke-width: 2px;
  fill: #8fc8f3;
}

svg .auxline {
  stroke: #0064d0;
  stroke-width: 1px;
  opacity: 0.5;
  fill: rgba(0, 0, 204, 0.3);
}

svg .seat-preview {
  stroke: #0064d0;
  stroke-width: 1px;
  fill: #8fc8f3;
}

svg .row-circle-preview circle.preview {
  fill: #8fc8f3;
  stroke-width: 2px;
  opacity: 0.5;
}

svg .row-circle-preview circle.preview-center {
  fill: #8fc8f3;
  stroke-width: 0;
  opacity: 0.5;
}
</style>
