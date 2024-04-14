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
} from "@/lib/geometry";
import { v4 as uuid } from "uuid";
import * as d3 from "d3";
import ZoneComponent from "./ZoneComponent.vue";

const round = (fl, places) => Number(fl.toFixed(places || 0));

const defaultBg = JSON.parse(
  window.localStorage.getItem("frontrow2.editor.bg") ||
    '{"background": null, "backgroundOpacity": 100, "backgroundX": 0, "backgroundY": 0, "backgroundWidth": 100, "backgroundHeight": 100}'
);

export default {
  name: "ZoneComp",
  components: { ZoneComponent },

  // data() {
  //   return {
  //     svg: ref(null),
  //     zoom: null,
  //     defaultScale: 1,
  //     fullScreen: true,
  //     lastMouseUp: 0,

  //     background: defaultBg.background,
  //     backgroundOpacity: defaultBg.backgroundOpacity,
  //     backgroundWidth: defaultBg.backgroundWidth,
  //     backgroundHeight: defaultBg.backgroundHeight,
  //     backgroundX: defaultBg.backgroundX,
  //     backgroundY: defaultBg.backgroundY,

  //     rotating: false,
  //     rotatingOriginX: 0,
  //     rotatingOriginY: 0,
  //     rotatingHandleX: 0,
  //     rotatingHandleY: 0,
  //     rotatingStartAngle: 0,

  //     resizing: false,
  //     resizingOriginX: 0,
  //     resizingOriginY: 0,
  //     resizingStartDistance: 0,

  //     selecting: false,
  //     selectingStartX: 0,
  //     selectingStartY: 0,
  //     selectingCurrentX: 100,
  //     selectingCurrentY: 100,

  //     drawing: false,
  //     drawingStartX: 0,
  //     drawingStartY: 0,
  //     drawingCurrentX: 100,
  //     drawingCurrentY: 100,

  //     polygonDrawing: false,
  //     polygonPoints: [],

  //     rowBlockDrawing: false,

  //     rowDrawing: false,
  //     rowSpacing: 25,
  //     rowSeatSpacing: 25,
  //   };
  // },
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
    const polygonDrawing = ref(false);
    const polygonPoints = ref([]);
    const rowBlockDrawing = ref(false);
    const rowDrawing = ref(false);
    const rowSpacing = ref(25);
    const rowSeatSpacing = ref(25);

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

    onMounted(() => {
      console.log("SVG Element:", svg.value.getBoundingClientRect());
    });

    const getSvgRect = () => svg.value.getBoundingClientRect();
    const createZoom = () => {
      if (!svg || !svg.value) return;

      const viewportHeight = svg.value.clientHeight;
      const viewportWidth = svg.value.clientWidth;
      const panPadding = 25;
      defaultScale.value = plan.value.size.height
        ? Math.min(
            viewportWidth / plan.value.size.width,
            viewportHeight / plan.value.size.height
          )
        : 1;

      zoom.value = d3
        .zoom()
        .scaleExtent([
          Math.min(defaultScale.value * 0.5, 1),
          Math.max(5, defaultScale.value * 5),
        ])
        .translateExtent([
          [
            (-viewportWidth + panPadding) / defaultScale.value,
            (-viewportHeight + panPadding) / defaultScale.value,
          ],
          [
            (viewportWidth - panPadding) / defaultScale.value +
              plan.value.size.width,
            (viewportHeight - panPadding) / defaultScale.value +
              plan.value.size.height,
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
            (wheeled || mouseDrag || touch) && (event.metaKey || event.ctrlKey)
          );
        })
        .wheelDelta((event) => {
          // In contrast to default implementation, do not use a factor 10 if ctrl is pressed
          return (
            -event.deltaY *
            (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002)
          );
        })
        .on("zoom", (event) => {
          const scale = event.transform.k;
          useMainStore().setZoomTransform(event.transform);

          zoom.value.translateExtent([
            [
              (-viewportWidth + panPadding) / scale,
              (-viewportHeight + panPadding) / scale,
            ],
            [
              (viewportWidth - panPadding) / scale + plan.value.size.width,
              (viewportHeight - panPadding) / scale + plan.value.size.height,
            ],
          ]);
        });
      // todo: old code had an zoom.on("zoom", null); do we need that?

      const initTransform = d3.zoomIdentity
        .scale(defaultScale.value)
        .translate(
          (viewportWidth / defaultScale.value - plan.value.size.width) / 2,
          (viewportHeight / defaultScale.value - plan.value.size.height) / 2
        );
      useMainStore().setZoomTransform(initTransform);

      d3.select(svg.value)
        .call(zoom.value.transform, initTransform)
        .on("wheel", function (event) {
          // Prevent scrolling when the min/max of the zoom extent is reached
          event.preventDefault();
        });

      const svg = d3.select(svg.value).call(zoom);
      svg.on("touchmove.zoom", null);

      // TODO touch support
      // TODO if we ever use this as a non-editor, we need things like fullscreen mode and zoom-on-first-touch
    };

    const hotkey = (event) => {
      if (
        event.target !== document.body &&
        !event.target.matches(".c-toolbar *")
      ) {
        return; // Do nothing if something is focused, e.g. an input element (except it's a toolbar button)
      }
      switch (event.code) {
        case "Delete":
        case "Backspace":
          usePlanStore().deleteObjects(selection.value);
          event.preventDefault(); // prevent backspace to go history back in Firefox on Mac
          return;
        case "Enter":
          if (polygonDrawing.value) {
            this.finishPolygon();
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
          return false;
        case "Escape":
          rowBlockDrawing.value = false;
          rowDrawing.value = false;
          polygonDrawing.value = false;
          drawing.value = false;
          if (
            tool.value === "rowCircle" ||
            tool.value === "rowCircleFixedCenter"
          ) {
            useMainStore().changeTool("select");
          }
          event.preventDefault();
          event.stopPropagation();
          return;
        case "ArrowUp":
          useMainStore().moveSelected(
            0,
            -1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
          );
          event.preventDefault();
          event.stopPropagation();
          return;
        case "ArrowDown":
          useMainStore().moveSelected(
            0,
            1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
          );
          event.preventDefault();
          event.stopPropagation();
          return;
        case "ArrowLeft":
          useMainStore().moveSelected(
            0,
            -1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
          );
          event.preventDefault();
          event.stopPropagation();
          return;
        case "ArrowRight":
          useMainStore().moveSelected(
            0,
            1 * (event.shiftKey ? 100 : event.altKey ? 1 : 10)
          );
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
            if (tool.value === "seatselect") {
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
            if (tool.value === "seatselect") {
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
            if (tool.value === "rows") {
              this.rowSpacing += event.altKey ? 0.1 : 1;
              event.preventDefault();
              event.stopPropagation();
              return true;
            }
            break;
          case "-":
            if (tool.value === "rows" && event.ctrlKey) {
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
            if (["rows", "row"].includes(tool.value)) {
              this.rowSeatSpacing += event.altKey ? 0.1 : 1;
            }
            break;
          case "-":
            if (["rows", "row"].includes(tool.value)) {
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
    };

    window.addEventListener("resize", createZoom);
    window.addEventListener("keydown", hotkey);

    const unwatch = watch(planSize, (newValue, oldValue) => {
      if (
        !oldValue ||
        newValue.width !== oldValue.width ||
        newValue.height !== oldValue.height
      ) {
        nextTick(() => {
          createZoom(); // Make sure this.createZoom() is compatible with the composition API
        });
      }
    });
    const unwatchTool = watch([tool], (newValue, oldValue) => {
      if (!oldValue || newValue !== oldValue) {
        drawing.value = false;
        selecting.value = false;
        rowBlockDrawing.value = false;
        polygonDrawing.value = false;
        polygonPoints.value = [];
      }
    });

    return {
      plan,
      validationErrors,
      selection,
      tool,
      cursor,
      zoomTransform,
      selectedZone,
      lockedZones,
      grid,
      unwatch,
      unwatchTool,
      createZoom,
      hotkey,
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
      rowDrawing,
      rowSpacing,
      rowSeatSpacing,
      getSvgRect,
    };
  },
  computed: {
    mainclasses() {
      return {
        movable: this.tool === "select" || this.tool === "seatselect",
        "zoom-transform": true,
      };
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
              } else if (a.shape === "ellipse") {
                abox = ellipseBBox(a);
              } else if (a.shape === "rectangle") {
                abox = rectangleBBox(a);
              } else if (a.shape === "polygon") {
                abox = polygonBBox(a);
              } else if (a.shape === "text") {
                const s = a.text.size || 16;
                abox = textBBox(a, a.text.text, s);
              }
              abox.x += z.position.x;
              abox.y += z.position.y;
              abox.visible = true;
              res.push(abox);
            }
          }
        }
      }
      return res;
    },
    selectionBoundary() {
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
  mounted() {
    // this.createZoom();
  },

  unmounted() {
    // window.removeEventListener("resize", this.createZoom);
    window.removeEventListener("keydown", this.hotkey);
    this.unwatch();
    this.unwatchTool();
  },

  methods: {
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
      this.rotatingStartAngle = 0;
      this.rotatingHandleX = drawPos.x;
      this.rotatingHandleY = drawPos.y;
      return true;
    },

    startResizing(event, node) {
      if (!this.svg) return;
      console.log("resizing");
      console.log("Opps");

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
          this.resizingOriginX =
            this.selectionBoundary.x + this.selectionBoundary.width;
          this.resizingOriginY =
            this.selectionBoundary.y + this.selectionBoundary.height;
          break;
        case "ne":
          this.resizingOriginX = this.selectionBoundary.x;
          this.resizingOriginY =
            this.selectionBoundary.y + this.selectionBoundary.height;
          break;
        case "sw":
          this.resizingOriginX =
            this.selectionBoundary.x + this.selectionBoundary.width;
          this.resizingOriginY = this.selectionBoundary.y;
          break;
        case "se":
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
      return true;
    },

    startDragging(uuid, zone, event) {
      if (!this.svg) return;
      //   console.log("Plan works");
      //   console.log(event);
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
      if (!this.svg) return;
      console.log("Dragging works");
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
        zone.uuid
      );
    },

    mousedown(event) {
      if (!this.svg) return;

      console.log("Mouse Downed!", this.svg, this.getSvgRect());

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
      switch (this.tool) {
        case "select":
        case "seatselect": {
          let selPos = positionInZone(
            event.clientX - svgbox.x,
            event.clientY - svgbox.y,
            this.zoomTransform,
            null
          );
          console.log("Selected!", this.tool, selPos);
          // this.selecting = true;
          // this.selectingStartX = selPos.x;
          // this.selectingStartY = selPos.y;
          // this.selectingCurrentX = selPos.x;
          // this.selectingCurrentY = selPos.y;
          break;
        }
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
          if (event.shiftKey) {
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
          if (event.shiftKey) {
            targetPos = findClosestGridPoint({
              x: targetPos.x,
              y: targetPos.y,
            });
          }
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
              },
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
          if (event.shiftKey) {
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
          if (event.shiftKey)
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
          if (event.shiftKey)
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });

          this.rowBlockDrawing = true;
          this.drawingStartX = pos.x;
          this.drawingStartY = pos.y;
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        }
      }
    },
    mousemove(event) {
      if (!this.svg) return;
      const store = useMainStore();
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

      if (this.rotating) {
        let angle = -Math.atan(
          (this.rotatingOriginX - pos.x) / (this.rotatingOriginY - pos.y)
        );
        if (event.shiftKey) {
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
        store.moveResizing(
          this.resizingOriginX,
          this.resizingOriginY,
          distance / this.resizingStartDistance
        );
        this.resizingStartDistance = distance;
      }
      switch (this.tool) {
        case "select":
        case "seatselect":
          if (store.dragging) {
            store.moveDragging(
              pos.x,
              pos.y,
              event.shiftKey,
              this.zoomTransform.k
            );
          } else if (this.selecting) {
            this.selectingCurrentX = pos.x;
            this.selectingCurrentY = pos.y;
          } else {
            return false;
          }
          break;
        case "rectangle":
        case "circle":
        case "ellipse":
          if (!this.drawing) return false;
          if (event.shiftKey) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "rowCircle":
        case "rowCircleFixedCenter":
          if (this.tool !== "rowCircle" && this.tool !== "rowCircleFixedCenter")
            return false;
          if (event.shiftKey) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "row":
          if (!this.rowDrawing) return false;
          if (event.shiftKey) {
            // Snap to 5° intervals
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
          } else {
            this.drawingCurrentX = pos.x;
            this.drawingCurrentY = pos.y;
          }
          break;
        case "rows":
          if (!this.rowBlockDrawing) return false;
          if (event.shiftKey) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          this.drawingCurrentX = pos.x;
          this.drawingCurrentY = pos.y;
          break;
        case "polygon":
          if (store.dragging) {
            store.moveDragging(
              pos.x,
              pos.y,
              event.shiftKey,
              this.zoomTransform.k
            );
            break;
          }
          if (!this.polygonDrawing) return false;
          if (event.shiftKey) {
            // Snap to 5° intervals
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
          } else {
            this.drawingCurrentX = pos.x;
            this.drawingCurrentY = pos.y;
          }
          break;
      }
    },
    mouseup() {
      if (!this.svg) return;
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
        case "seatselect":
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
            }

            store.setSelection(uuids, this.selectedZone, event.shiftKey);
            return true;
          }
          return false;
        case "select":
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
                console.log("about r", r, z.rows);
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
                  uuids.push(a.uuid);
                }
              }
            }
            store.setSelection(uuids, this.selectedZone, event.shiftKey);
            return true;
          }
          return false;
        case "rectangle":
        case "circle":
        case "ellipse":
          if (!this.drawing) return false;
          if (event.shiftKey) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          if (this.tool === "rectangle") {
            const w = Math.abs(pos.x - this.drawingStartX);
            const h = Math.abs(pos.y - this.drawingStartY);
            if (w < 1 || h < 1) {
              this.drawing = false;
              return; // probably a misclick
            }
            usePlanStore()
              .createArea(this.selectedZone, {
                shape: "rectangle",
                color: "#cccccc", // todo: use previously used color
                border_color: "#000000", // todo: use previously used color
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
                console.log("HERE", "error", this.selectZone);

                this.$nextTick(() => {
                  store.toggleSelection([newId], this.selectedZone, false);
                });
              });
          } else if (this.tool === "circle") {
            if (event.shiftKey) {
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
            if (event.shiftKey) {
              pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
            }
            const w = Math.abs(pos.x - this.drawingStartX);
            const h = Math.abs(pos.y - this.drawingStartY);
            if (w < 1 || h < 1) {
              this.drawing = false;
              return; // probably a misclick
            }
            usePlanStore()
              .createArea(this.selectedZone, {
                shape: "ellipse",
                color: "#cccccc", // todo: use previously used color
                border_color: "#000000", // todo: use previously used color
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
            if (event.shiftKey) {
              pos = polysnap(pos, 1);
              if (pp.length > 1) {
                comparepos = polysnap(pos, 2);
              }
            }
            if (
              comparepos.x ===
                this.polygonPoints[this.polygonPoints.length - 1].x &&
              comparepos.y ===
                this.polygonPoints[this.polygonPoints.length - 1].y
            ) {
              // "Double click"
              this.finishPolygon();
            } else {
              this.polygonPoints.push(pos);
            }
          } else {
            this.polygonDrawing = true;
            if (event.shiftKey) {
              pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
            }
            this.polygonPoints = [pos];
          }
          break;
        case "rows":
          // if mouseup is in same spot as mousedown, keep drawing, as this
          // was the original behaviour with click-draw-click vs. mousedown-draw-mouseup
          if (event.shiftKey) {
            pos = findClosestGridPoint({ x: pos.x, y: pos.y, zone: zone });
          }
          if (this.drawingStartX === pos.x && this.drawingStartY === pos.y) {
            break;
          }
          if (this.rowBlockDrawing) {
            console.log(this.rowBlockRows, this.rowBlockSeats);
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
        case "row":
          // if mouseup is in same spot as mousedown, keep drawing, as this
          // was the original behaviour with click-draw-click vs. mousedown-draw-mouseup
          if (event.shiftKey) {
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

    testFunc() {
      console.log("This is the test Func");
    },
  },
};
</script>
<template>
  <svg
    :width="plan.size.width"
    :height="plan.size.height"
    preserveAspectRatio="none"
    v-if="plan.size"
    ref="svg"
    @mousemove="mousemove"
    @mouseup="mouseup"
    @mousedown="mousedown"
  >
    <g :transform="zoomTransform.toString()" :class="mainclasses">
      <rect
        :width="plan.size.width"
        :height="plan.size.height"
        fill="#fcfcfc"
        :cursor="cursor"
      ></rect>
      <image
        v-if="background"
        :width="backgroundWidth"
        :height="backgroundHeight"
        :href="background"
        :opacity="backgroundOpacity / 100"
        :x="backgroundX"
        :y="backgroundY"
      ></image>
      <defs>
        <pattern
          id="smallGrid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke="#ddd"
            stroke-width="0.5"
          ></path>
        </pattern>
        <pattern
          id="grid"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <rect width="100" height="100" fill="url(#smallGrid)"></rect>
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="#ccc"
            stroke-width="1"
          ></path>
        </pattern>
      </defs>
      <rect
        v-if="grid"
        :width="plan.size.width"
        :height="plan.size.height"
        fill="url(#grid)"
        :cursor="cursor"
      ></rect>
      <ZoneComponent
        v-for="z in plan.zones"
        :zone="z"
        :key="z.uuid"
        :startDragging="startDragging"
        :startDraggingPolygonPoint="startDraggingPolygonPoint"
      ></ZoneComponent>
      <rect
        class="selection-box"
        v-for="b in selectionBoxesVisible"
        :x="b.x - 1.5"
        :y="b.y - 1.5"
        :width="b.width + 3"
        :height="b.height + 3"
        :key="b"
        fill="none"
      ></rect>
      <line
        class="selection-rotate-handle-connector"
        v-if="selection.length && selectionBoundary"
        :x1="rotateHandle.x"
        :y1="rotateHandle.y"
        :x2="
          rotatingOriginX
            ? rotatingOriginX
            : selectionBoundary.x + selectionBoundary.width / 2
        "
        :y2="
          rotatingOriginY
            ? rotatingOriginY
            : selectionBoundary.y + selectionBoundary.height / 2
        "
      ></line>
      <circle
        class="selection-rotate-handle"
        v-if="selection.length && selectionBoundary"
        :cx="rotateHandle.x"
        :cy="rotateHandle.y"
        r="5"
        @mousedown="startRotating"
      ></circle>
      <circle
        class="selection-rotate-handle-end"
        v-if="selection.length && selectionBoundary"
        :cx="
          rotatingOriginX
            ? rotatingOriginX
            : selectionBoundary.x + selectionBoundary.width / 2
        "
        :cy="
          rotatingOriginY
            ? rotatingOriginY
            : selectionBoundary.y + selectionBoundary.height / 2
        "
        r="5"
      ></circle>
      <rect
        class="selection-boundary"
        v-if="selection.length && selectionBoundary"
        :x="selectionBoundary.x - 1.5"
        :y="selectionBoundary.y - 1.5"
        :width="selectionBoundary.width + 3"
        :height="selectionBoundary.height + 3"
        fill="none"
      ></rect>
      <rect
        class="selection-resize-handle-nw"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats"
        :x="selectionBoundary.x - 4.5"
        :y="selectionBoundary.y - 4.5"
        :width="6"
        :height="6"
        @mousedown="startResizing($event, 'nw')"
      ></rect>
      <rect
        class="selection-resize-handle-ne"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats"
        :x="selectionBoundary.x + selectionBoundary.width - 1.5"
        :y="selectionBoundary.y - 4.5"
        :width="6"
        :height="6"
        @mousedown="startResizing($event, 'ne')"
      ></rect>
      <rect
        class="selection-resize-handle-sw"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats"
        :x="selectionBoundary.x - 4.5"
        :y="selectionBoundary.y + selectionBoundary.height - 1.5"
        :width="6"
        :height="6"
        @mousedown="startResizing($event, 'sw')"
      ></rect>
      <rect
        class="selection-resize-handle-se"
        v-if="selection.length && selectionBoundary && selectionIncludesNoSeats"
        :x="selectionBoundary.x + selectionBoundary.width - 1.5"
        :y="selectionBoundary.y + selectionBoundary.height - 1.5"
        :width="6"
        :height="6"
        fill="none"
        @mousedown="startResizing($event, 'se')"
      ></rect>
      <rect
        class="preview"
        v-if="tool == 'rectangle' && drawing"
        :x="Math.min(drawingStartX, drawingCurrentX)"
        :y="Math.min(drawingStartY, drawingCurrentY)"
        :width="Math.abs(drawingStartX - drawingCurrentX)"
        :height="Math.abs(drawingStartY - drawingCurrentY)"
      ></rect>
      <circle
        class="preview"
        v-if="tool == 'circle' && drawing"
        :cx="drawingStartX"
        :cy="drawingStartY"
        :r="
          Math.sqrt(
            Math.pow(drawingStartX - drawingCurrentX, 2) +
              Math.pow(drawingStartY - drawingCurrentY, 2)
          )
        "
      ></circle>
      <ellipse
        class="preview"
        v-if="tool == 'ellipse' && drawing"
        :cx="drawingStartX"
        :cy="drawingStartY"
        :rx="Math.abs(drawingStartX - drawingCurrentX)"
        :ry="Math.abs(drawingStartY - drawingCurrentY)"
      ></ellipse>
      <polygon
        class="preview"
        v-if="tool === 'polygon' && polygonDrawing"
        x="0"
        y="0"
        :points="polygonPreviewPoints"
      ></polygon>
      <g
        class="row-circle-preview"
        v-if="tool === 'rowCircle' || tool === 'rowCircleFixedCenter'"
      >
        <circle
          class="preview"
          v-for="circ in rowCirclePreviews"
          :r="circ.radius"
          :cx="circ.cx"
          :cy="circ.cy"
          :key="circ"
        ></circle>
        <circle
          class="preview-center"
          v-for="circ in rowCirclePreviews"
          :r="2"
          :cx="circ.cx"
          :cy="circ.cy"
          :key="circ"
        ></circle>
      </g>
      <g class="row-preview" v-if="tool === 'row' && rowDrawing">
        <line
          class="preview"
          :x1="drawingStartX"
          :y1="drawingStartY"
          :x2="drawingCurrentX"
          :y2="drawingCurrentY"
        ></line>
        <line
          class="auxline"
          :x1="drawingStartX - (drawingCurrentX - drawingStartX) * 1000"
          :y1="drawingStartY - (drawingCurrentY - drawingStartY) * 1000"
          :x2="drawingCurrentX + (drawingCurrentX - drawingStartX) * 1000"
          :y2="drawingCurrentY + (drawingCurrentY - drawingStartY) * 1000"
        ></line>
        <circle
          class="seat-preview"
          v-for="(s, sid) in rowDrawingSeats"
          :key="sid"
          :cx="s.x"
          :cy="s.y"
          r="10"
        ></circle>
      </g>
      <g
        class="rows-preview"
        v-if="tool === 'rows' && rowBlockDrawing"
        :transform="rowBlockTransform"
      >
        <g v-for="rid in rowBlockRows" :key="rid">
          <circle
            class="seat-preview"
            v-for="sid in rowBlockSeats"
            :key="sid"
            :cx="rowSeatSpacing * (sid - 1)"
            :cy="rowSpacing * (rid - 1)"
            r="10"
          ></circle>
        </g>
        <rect
          v-if="rowBlockSeats + rowBlockRows >= 7"
          :x="(rowSeatSpacing * rowBlockSeats) / 2 - 25 - 12.5"
          :y="(rowSpacing * rowBlockRows) / 2 - 25"
          width="50"
          height="25"
          fill="#00c"
        ></rect>
        <text
          v-if="rowBlockSeats + rowBlockRows >= 7"
          :x="(rowSeatSpacing * rowBlockSeats) / 2 - 12.5"
          :y="(rowSpacing * rowBlockRows) / 2 - 12.5"
          text-anchor="middle"
          fill="#fff"
          dy=".3em"
        >
          {{ rowBlockRows }} × {{ rowBlockSeats }}
        </text>
      </g>
      <rect
        class="selection-area"
        v-if="(tool == 'select' || tool == 'seatselect') && selecting"
        :x="Math.min(selectingStartX, selectingCurrentX)"
        :y="Math.min(selectingStartY, selectingCurrentY)"
        :width="Math.abs(selectingStartX - selectingCurrentX)"
        :height="Math.abs(selectingStartY - selectingCurrentY)"
      ></rect>
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
  user-select: none;
}

svg .selection-area {
  stroke-width: 1.5px;
  fill: rgba(0, 0, 204, 0.3);
  stroke: rgba(0, 0, 204, 0.5);
}

svg .selection-box {
  stroke-width: 1.5px;
  stroke: #00c;
}

svg .selection-resize-handle-nw {
  fill: #00c;
  cursor: nw-resize;
}

svg .selection-resize-handle-ne {
  fill: #00c;
  cursor: ne-resize;
}

svg .selection-resize-handle-sw {
  fill: #00c;
  cursor: sw-resize;
}

svg .selection-resize-handle-se {
  fill: #00c;
  cursor: se-resize;
}

svg .selection-rotate-handle {
  fill: #00c;
  cursor: grab;
}

svg .selection-rotate-handle-connector,
svg .selection-rotate-handle-end {
  fill: #fff;
  stroke-width: 1.5px;
  stroke: #00c;
  pointer-events: none;
}

svg .selection-boundary {
  box-shadow: 0 0 5px 5px #00c;
  stroke: #00c;
  stroke-width: 1.5px;
  stroke-dasharray: 3, 3;
}

svg .preview {
  stroke: #00c;
  stroke-width: 2px;
  fill: rgba(0, 0, 204, 0.3);
}

svg .auxline {
  stroke: #00c;
  stroke-width: 1px;
  opacity: 0.5;
  fill: rgba(0, 0, 204, 0.3);
}

svg .seat-preview {
  stroke: #00c;
  stroke-width: 1px;
  fill: rgba(0, 0, 204, 0.3);
}

svg .row-circle-preview circle.preview {
  fill: rgba(0, 0, 204, 0.1);
  stroke-width: 2px;
  opacity: 0.5;
}

svg .row-circle-preview circle.preview-center {
  fill: rgba(0, 0, 204, 0.8);
  stroke-width: 0;
  opacity: 0.5;
}
</style>
