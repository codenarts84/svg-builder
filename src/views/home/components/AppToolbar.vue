<template>
  <v-toolbar flat class="app-toolbar-container">
    <FileTool :importSVG="importSVG" />
    <MainTools />
    <v-toolbar-title :style="toolbarTitleStyle">{{
      boardName
    }}</v-toolbar-title>
    <v-toolbar-items class="border-left">
      <MagnifierComponent />
    </v-toolbar-items>
    <v-toolbar-items class="border-left">
      <GridView />
    </v-toolbar-items>
    <v-toolbar-items class="border-left">
      <SettingModal />
      <CheckModal />
      <ExportModal :export="exportSVG" />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script setup>
import { computed, ref, defineProps } from "vue";
import MagnifierComponent from "./utils/MagnifierView.vue";
import { useBoardStore } from "../../../stores/svgStore";

import SettingModal from "./utils/SettingModal.vue";
import CheckModal from "./utils/CheckModal.vue";
import ExportModal from "./utils/ExportModal.vue";
import MainTools from "./tools/MainTools.vue";
import FileTool from "./tools/FileTool.vue";
import GridView from "./utils/GridView.vue";
import sampleplan from "@/sampleplan";
import { usePlanStore } from "@/stores/plan";
import { useMainStore } from "@/stores";
import { v4 as uuid } from "uuid";

const planStore = usePlanStore();
const boardStore = useBoardStore();
const boardName = ref(computed(() => planStore.plan.name));
const plan = ref(computed(() => planStore.plan))

const extractTexts = (svgDoc) => {
  const gElements = svgDoc.querySelectorAll('g.area-text');
  const texts = []
  gElements.forEach(gElement => {
    const transform = gElement.getAttribute('transform');
    const translateMatch = transform.match(/translate\((\d+),\s*(\d+)\)/);
    const rotateMatch = transform.match(/rotate\((\d+)/);
    const textElement = gElement.querySelector('text');
    const textContent = textElement.textContent;
    const fontSize = textElement.getAttribute('font-size');
    const fillColor = textElement.getAttribute('fill');
    const data = {
      position: { x: parseInt(translateMatch[1], 10), y: parseInt(translateMatch[2], 10) },
      rotation: rotateMatch ? parseInt(rotateMatch[1], 10) : 0,
      shape: "text",
      text: {
        position: { x: 0, y: 0 }, // Assuming position is always (0,0) as in the example
        color: fillColor,
        text: textContent,
        size: parseInt(fontSize, 10)
      },
      uuid: uuid() // This needs to be dynamically generated if it changes
    };
    texts.push(data);
  })
  return texts;
}

const extractRectangle = svgDoc => {
  const rectElements = svgDoc.querySelectorAll('g.area-rectangle');
  const rectangleData = [];

  rectElements.forEach(gElement => {
    // Extract transform data (translation and rotation)
    const transform = gElement.getAttribute('transform');
    const translateMatch = transform.match(/translate\(([\d.]+),\s*([\d.]+)\)/);
    const rotateMatch = transform.match(/rotate\((\d+)/);

    // Extract rectangle attributes
    const rect = gElement.querySelector('rect');
    const fillColor = rect.getAttribute('fill');
    const strokeColor = rect.getAttribute('stroke');
    const strokeWidth = parseInt(rect.getAttribute('stroke-width'), 10);
    const width = parseFloat(rect.getAttribute('width'));
    const height = parseFloat(rect.getAttribute('height'));

    const textElement = gElement.querySelector('text');
    const textContent = textElement ? textElement.textContent : "";
    const textColor = textElement ? textElement.getAttribute('fill') : "#333333";
    const fontSize = textElement ? parseInt(textElement.getAttribute('font-size'), 10) : 16;
    // Construct the data object for each rectangle
    const data = {
      border_color: strokeColor,
      border_width: strokeWidth,
      color: fillColor,
      position: {
        x: parseFloat(translateMatch[1]),
        y: parseFloat(translateMatch[2])
      },
      rectangle: { width, height },
      rotation: rotateMatch ? parseInt(rotateMatch[1], 10) : 0,
      shape: "rectangle",
      text: {
        position: { x: width / 2, y: height / 2 }, // Center of the circle
        color: textColor,
        text: textContent,
        size: fontSize
      },
      uuid: uuid() // This should be dynamically generated if it changes
    };

    rectangleData.push(data);
  });

  return rectangleData;
}

const extractCircle = svgDoc => {
  const circleElements = svgDoc.querySelectorAll('g.area-circle');
  const circleData = [];

  circleElements.forEach(gElement => {
    // Extract transform data for position (no rotation in example)
    const transform = gElement.getAttribute('transform');
    const translateMatch = transform.match(/translate\(([\d.]+),\s*([\d.]+)\)/);

    // Extract circle attributes
    const circle = gElement.querySelector('circle');
    const fillColor = circle.getAttribute('fill');
    const strokeColor = circle.getAttribute('stroke');
    const strokeWidth = parseInt(circle.getAttribute('stroke-width'), 10);
    const radius = parseFloat(circle.getAttribute('r'));

    // Extract text if present
    const textElement = gElement.querySelector('text');
    const textContent = textElement ? textElement.textContent : "";
    const textColor = textElement ? textElement.getAttribute('fill') : "#333333";
    const fontSize = textElement ? parseInt(textElement.getAttribute('font-size'), 10) : 16;

    // Construct the data object for each circle
    const data = {
      areas: [{
        shape: "circle",
        color: fillColor,
        border_color: strokeColor,
        border_width: strokeWidth,
        rotation: 0,  // No rotation in the provided example
        position: {
          x: parseFloat(translateMatch[1]),
          y: parseFloat(translateMatch[2])
        },
        radius: radius,
        text: {
          position: { x: 0, y: 0 }, // Center of the circle
          color: textColor,
          text: textContent,
          size: fontSize
        }
      }],
      name: "Ground floor", // Static data; update as needed
      position: { x: 0, y: 0 }, // Static data; update if dynamic
      rows: [], // Assuming no data; update as needed
      uuid: uuid(), // Should be dynamically generated if it changes
      zone_id: "Groundfloor" // Static data; update as needed
    };

    circleData.push(data);
  });

  return circleData;
}

const extractEllipse = svgDoc => {
  const ellipses = svgDoc.querySelectorAll('g.area-ellipse');
  let data = [];

  ellipses.forEach(area => {
    const transformData = parseTransform(area.getAttribute('transform'));
    const ellipse = area.querySelector('ellipse');

    data.push({
      border_color: ellipse.getAttribute('stroke'),
      border_width: parseInt(ellipse.getAttribute('stroke-width'), 10),
      color: ellipse.getAttribute('fill'),
      ellipse: {
        radius: {
          x: parseFloat(ellipse.getAttribute('rx')),
          y: parseFloat(ellipse.getAttribute('ry'))
        }
      },
      position: {
        x: transformData.e,
        y: transformData.f
      },
      rotation: transformData.rotation,
      shape: "ellipse",
      text: {
        position: { x: 0, y: 0 }, // Default values since text is not specified
        color: "#A72929", // Assuming default since text is not specified
        text: ""
      },
      uuid: uuid()// Assuming static UUID, adjust as needed
    });
  });

  return data;
}

const extractGARect = (svgDoc) => {
  const areas = svgDoc.querySelectorAll('g.area-gaSquare');
  let data = [];

  areas.forEach(area => {
    const transformData = parseTransform(area.getAttribute('transform'));
    const rect = area.querySelector('rect');
    const textElement = area.querySelector('text');

    data.push({
      abbreviation: "GA", // Assuming static abbreviation, adjust as needed
      border_color: rect.getAttribute('stroke'),
      border_width: parseInt(rect.getAttribute('stroke-width'), 10),
      capacity: 0, // Assuming static capacity, adjust as needed
      color: rect.getAttribute('fill'),
      position: {
        x: transformData.e,
        y: transformData.f
      },
      rectangle: {
        width: parseFloat(rect.getAttribute('width')),
        height: parseFloat(rect.getAttribute('height'))
      },
      rotation: transformData.rotation,
      shape: "gaSquare", // Assuming static shape type, adjust as needed
      text: {
        position: {
          x: parseFloat(textElement.getAttribute('x')),
          y: parseFloat(textElement.getAttribute('y'))
        },
        color: textElement.getAttribute('fill'),
        text: textElement.textContent.trim()
      },
      uuid: uuid() // Static UUID, adjust as needed
    });
  });

  return data;
}

const extractGACircle = (svgDoc) => {
  const areas = svgDoc.querySelectorAll('g.area-gaCircle');
  let data = [];

  areas.forEach(area => {
    const transformData = parseTransform(area.getAttribute('transform'));
    const ellipse = area.querySelector('ellipse');
    const textElement = area.querySelector('text');

    data.push({
      abbreviation: "GA", // Typically derived from data-section-abv or similar attribute
      border_color: ellipse.getAttribute('stroke'),
      border_width: parseInt(ellipse.getAttribute('stroke-width'), 10),
      capacity: 0, // If dynamically set, you need another method to determine this
      color: ellipse.getAttribute('fill'),
      ellipse: {
        radius: {
          x: parseFloat(ellipse.getAttribute('rx')),
          y: parseFloat(ellipse.getAttribute('ry'))
        }
      },
      position: {
        x: transformData.e,
        y: transformData.f
      },
      rotation: transformData.rotation,
      shape: "gaCircle", // This is static; adjust if your SVG has different shapes
      text: {
        position: {
          x: parseFloat(textElement.getAttribute('x')),
          y: parseFloat(textElement.getAttribute('y'))
        },
        color: textElement.getAttribute('fill'),
        text: textElement.textContent.trim()
      },
      uuid: uuid() // Assuming UUID is static; adjust as needed
    });
  });

  return data;
}

const extractPolygon = svgDoc => {
  const polygons = svgDoc.querySelectorAll('g.area-polygon');
  let data = [];

  polygons.forEach(area => {
    const transformData = parseTransform(area.getAttribute('transform'));
    const polygon = area.querySelector('polygon');
    const pointsString = polygon.getAttribute('points').trim();
    const pointsArray = pointsString.split(' ').map(point => {
      const coords = point.split(',');
      return {
        x: parseFloat(coords[0]),
        y: parseFloat(coords[1])
      };
    });

    data.push({
      border_color: polygon.getAttribute('stroke'),
      border_width: parseInt(polygon.getAttribute('stroke-width'), 10),
      color: polygon.getAttribute('fill'),
      polygon: {
        points: pointsArray
      },
      position: {
        x: transformData.e,
        y: transformData.f
      },
      rotation: transformData.rotation,
      shape: "polygon",
      text: {
        // This assumes there's text data somewhere to extract; adjust accordingly.
        position: { x: 0, y: 0 }, // Placeholder values
        color: "#333333", // Default placeholder, adjust as needed
        text: ""
      },
      uuid: uuid()
    });
  });

  return data;
}

const extractGAPolygon = svgDoc => {
  const polygons = svgDoc.querySelectorAll('g.area-gaPolygon');
  let data = [];

  polygons.forEach(area => {
    const transformData = parseTransform(area.getAttribute('transform'));
    const polygon = area.querySelector('polygon');
    const pointsString = polygon.getAttribute('points').trim();
    const pointsArray = pointsString.split(' ').map(point => {
      const coords = point.split(',');
      return {
        x: parseFloat(coords[0]),
        y: parseFloat(coords[1])
      };
    });

    // Extract text data if available
    const textElement = area.querySelector('text');
    const textData = textElement ? {
      position: {
        x: parseFloat(textElement.getAttribute('x')),
        y: parseFloat(textElement.getAttribute('y'))
      },
      color: textElement.getAttribute('fill'),
      text: textElement.textContent
    } : { position: { x: 0, y: 0 }, color: "", text: "" };

    data.push({
      abbreviation: "GA", // You can adjust or dynamically extract if needed
      border_color: polygon.getAttribute('stroke'),
      border_width: parseInt(polygon.getAttribute('stroke-width'), 10),
      capacity: 0, // Static capacity, adjust as needed
      color: polygon.getAttribute('fill'),
      polygon: {
        points: pointsArray
      },
      position: {
        x: transformData.e,
        y: transformData.f
      },
      rotation: transformData.rotation,
      shape: "gaPolygon",
      text: textData,
      uuid: uuid() // Static UUID, adjust as needed
    });
  });

  return data;
}


const parseTransform = (transformString) => {
  const result = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, rotation: 0 }; // Include rotation in the matrix components
  if (!transformString) return result;
  const translate = transformString.match(/translate\(([\d.+-]+),\s*([\d.+-]+)\)/);
  const rotate = transformString.match(/rotate\(([\d.+-]+)\)/);
  if (translate) {
    result.e = parseFloat(translate[1]);
    result.f = parseFloat(translate[2]);
  }
  if (rotate) {
    result.rotation = parseFloat(rotate[1]);
  }
  return result;
}


const extractRoundTable = (svgDoc) => {
  const tables = svgDoc.querySelectorAll('g.area-roundTable');
  let data = [];

  tables.forEach(area => {
    const table = area.querySelector('.table');
    const circle = table.querySelector('.table_circle');
    const label = table.querySelector('.table_label');
    const seats = table.querySelectorAll('.table_seat_group');
    let seatData = [];

    seats.forEach(seat => {
      const seatLabel = seat.querySelector('text');
      const seatCircle = seat.querySelector('circle');
      console.log(seat)
      seatData.push({
        seat_number: seatLabel.textContent,
        position: {
          x: parseFloat(seatCircle.getAttribute('cx')),
          y: parseFloat(seatCircle.getAttribute('cy'))
        },
        r: parseFloat(seatCircle.getAttribute('r')),
        guid: seatCircle.id
      });
    });

    data.push({
      capacity: seats.length,
      label: {
        position: {
          x: parseFloat(label.getAttribute('x')),
          y: parseFloat(label.getAttribute('y'))
        },
        // name: label.textContent,
        abv: "", // No abbreviation in your SVG; adjust if needed
        color: label.getAttribute('fill'),
        size: parseFloat(label.getAttribute('font-size'))
      },
      position: {
        x: parseFloat(area.getAttribute('transform').match(/translate\(([\d.+-]+),\s*([\d.+-]+)\)/)[1]),
        y: parseFloat(area.getAttribute('transform').match(/translate\(([\d.+-]+),\s*([\d.+-]+)\)/)[2])
      },
      radius: parseFloat(circle.getAttribute('r')),
      rotation: parseFloat(area.getAttribute('transform').match(/rotate\(([\d.+-]+)\)/) ? area.getAttribute('transform').match(/rotate\(([\d.+-]+)\)/)[1] : 0),
      seats: seatData,
      shape: "roundTable",
      space: 0, // No spacing data; adjust if necessary
      uuid: uuid() // Static UUID, adjust as needed
    });
  });

  return data;
}

const extractRectangleTable = svgDoc => {
  const tables = svgDoc.querySelectorAll('g.area-rectangleTable');
  let data = [];

  tables.forEach(area => {
    const tableTransform = parseTransform(area.getAttribute('transform'));
    const table = area.querySelector('.table');
    const rect = table.querySelector('.table_rect');
    const seats = table.querySelectorAll('.table_seat_group');
    let seatData = [];

    seats.forEach((seat, index) => {
      const seatCircle = seat.querySelector('circle');
      const seatText = seat.querySelector('text');
      seatData.push({
        position: {
          x: parseFloat(seatCircle.getAttribute('cx')),
          y: parseFloat(seatCircle.getAttribute('cy'))
        },
        seat_number: seatText.textContent,
        radius: parseFloat(seatCircle.getAttribute('r')),
        color: seatText.getAttribute('fill'),
        guid: seatCircle.id
      });
    });

    data.push({
      capacity: {
        top: seatData.slice(0, 4).length,
        bottom: seatData.slice(4).length,
        left: 0,
        right: 0
      },
      label: {
        name: "",
        abv: "",
        position: { x: parseFloat(rect.getAttribute('x')) + 70, y: parseFloat(rect.getAttribute('y')) + 30 }, // Center of the rectangle
        color: "#333333",
        text: "",
        size: 16
      },
      position: {
        x: tableTransform.e,
        y: tableTransform.f
      },
      rectangleTable: {
        width: parseFloat(rect.getAttribute('width')),
        height: parseFloat(rect.getAttribute('height'))
      },
      rotation: 0, // Assuming no rotation; adjust if necessary
      seats: seatData,
      shape: "rectangleTable",
      uuid: uuid() // Example UUID; adjust as needed
    });
  });

  return data;
}

const importSVG = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.svg'
  input.onchange = (e) => {
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.onload = function (e) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(e.target.result, "image/svg+xml");
      const zoneGroup = doc.querySelector('g.zone');
      if (zoneGroup) {
        const mySvg = document.getElementById('svg');
        const texts = extractTexts(doc)
        const rects = extractRectangle(doc)
        const circles = extractCircle(doc)
        const polygons = extractPolygon(doc)
        const ellipses = extractEllipse(doc)
        const gaCircle = extractGACircle(doc)
        const gaSquare = extractGARect(doc)
        const gaPolygon = extractGAPolygon(doc)
        const rectangleTable = extractRectangleTable(doc)
        const roundTable = extractRoundTable(doc)
        const zone = {
          areas: [...texts, ...rects, ...circles, ...polygons, ...ellipses, ...gaCircle, ...gaSquare, ...gaPolygon, ...roundTable, ...rectangleTable],
          name: "Zone",
          position: { x: 0, y: 0 },
          uuid: uuid(),
          zone_id: "G"
        }
        plan.value.zones[0].areas = zone.areas;
      } else {
        alert("No seats found in the SVG.");
      }
    };
    reader.readAsText(file);
  }
  input.click()
}

const exportSVG = () => {
  let svgElement = document.getElementsByClassName('zone')[0];
  let metadata = document.getElementsByTagName('metadata');
  let newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  newSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  newSvg.setAttribute("version", "1.1");
  newSvg.setAttribute("width", "900");  // Set as per your requirement
  newSvg.setAttribute("height", "900"); // Set as per your requirement
  for (let i = 0; i < metadata.length; i++) {
    newSvg.appendChild(metadata[i].cloneNode(true));
  }
  newSvg.appendChild(svgElement.cloneNode(true));
  const filename = 'SVG Map'
  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(newSvg);
  var blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

}

const toolbarTitleStyle = computed(() => {
  return {
    fontSize: "16px",
    fontWeight: "bold",
    lineHeight: "1.2",
    height: boardName.value.length < 50 ? "20px" : "38.4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    whiteSpace: "normal",
  };
});
</script>

<style>
.app-toolbar-container {
  position: fixed;
  opacity: 1;
  height: 50px;
  z-index: 999;
}

.app-toolbar {
  background-color: #eee;
  padding: 10px;
  display: flex;
  gap: 10px;
}

.v-toolbar__content {
  height: 50px !important;
}

.border-both {
  border-right: 2px solid rgba(255, 255, 255, 0.5);
  border-left: 2px solid rgb(255, 255, 255, 0.5);
}

.border-left {
  border-left: 2px solid rgb(255, 255, 255, 0.5);
}

.v-toolbar-title__placeholder {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
  height: 38.4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}
</style>
