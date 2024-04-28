import { circleBox, polygonBox, polygonEllipse } from "intersects";

const positionInZone = (x, y, zoomTransform, zone) => {
  x = (x - zoomTransform.x) / zoomTransform.k - (zone ? zone.position.x : 0);
  y = (y - zoomTransform.y) / zoomTransform.k - (zone ? zone.position.y : 0);
  return { x: x, y: y };
};

const estimateTextWidth = (text, size) => {
  /*
  There is no native way to get the width of an SVG text, short of rendering it and calling getBBox(), which in our
  case turned out to be unfeasibly complex due to the rendering cycle of vue. So we just use HTML5 canvas to get a
  rough idea. In our experiments, this works perfectly fine in Chrome and Firefox.
  */
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = size + "px " + "sans-serif";
  return context.measureText(text).width;
};

const rotateRectangluarBox = (area, abox) => {
  let ox = area.position.x;
  let oy = area.position.y;
  const rotated_points_x = [
    Math.cos((area.rotation / 180) * Math.PI) * (abox.x - ox) -
    Math.sin((area.rotation / 180) * Math.PI) * (abox.y - oy) +
    ox,
    Math.cos((area.rotation / 180) * Math.PI) * (abox.x + abox.width - ox) -
    Math.sin((area.rotation / 180) * Math.PI) * (abox.y - oy) +
    ox,
    Math.cos((area.rotation / 180) * Math.PI) * (abox.x - ox) -
    Math.sin((area.rotation / 180) * Math.PI) * (abox.y + abox.height - oy) +
    ox,
    Math.cos((area.rotation / 180) * Math.PI) * (abox.x + abox.width - ox) -
    Math.sin((area.rotation / 180) * Math.PI) * (abox.y + abox.height - oy) +
    ox,
  ];
  const rotated_points_y = [
    Math.sin((area.rotation / 180) * Math.PI) * (abox.x - ox) +
    Math.cos((area.rotation / 180) * Math.PI) * (abox.y - oy) +
    oy,
    Math.sin((area.rotation / 180) * Math.PI) * (abox.x + abox.width - ox) +
    Math.cos((area.rotation / 180) * Math.PI) * (abox.y - oy) +
    oy,
    Math.sin((area.rotation / 180) * Math.PI) * (abox.x - ox) +
    Math.cos((area.rotation / 180) * Math.PI) * (abox.y + abox.height - oy) +
    oy,
    Math.sin((area.rotation / 180) * Math.PI) * (abox.x + abox.width - ox) +
    Math.cos((area.rotation / 180) * Math.PI) * (abox.y + abox.height - oy) +
    oy,
  ];
  const minx = Math.min(...rotated_points_x);
  const miny = Math.min(...rotated_points_y);
  const maxx = Math.max(...rotated_points_x);
  const maxy = Math.max(...rotated_points_y);
  return {
    x: minx,
    y: miny,
    width: maxx - minx,
    height: maxy - miny,
  };
};

const rectangleBBox = (area) => {
  let abox = {
    x: area.position.x,
    y: area.position.y,
    width: area.rectangle.width,
    height: area.rectangle.height,
  };
  if (area.rotation) {
    abox = rotateRectangluarBox(area, abox);
  }
  return abox;
};

const roundTableBBox = (area) => {
  let abox = {
    x: area.position.x - area.radius - 20,
    y: area.position.y - area.radius - 20,
    width: (area.radius + 20) * 2,
    height: (area.radius + 20) * 2,
  };
  if (area.rotation) {
    // abox = {
    //   x: (area.position.x - area.radius - 20) * Math.cos(area.rotation / 180 * Math.PI),
    //   y: (area.position.y - area.radius - 20) * Math.sin(area.rotation / 180 * Math.PI),
    //   width: (area.radius + 20) * 2,
    // height: (area.radius + 20) * 2
    // }
  }
  return abox;
}

const rectangleTableBBox = (area) => {
  let abox = {
    x: area.position.x,
    y: area.position.y - 40,
    width: 120,
    height: 100,
  };
  if (area.rotation) {
    abox = rotateRectangluarBox(area, abox);
  }
  return abox;
}

const textBBox = (area, text, size) => {
  const width = estimateTextWidth(text, size);
  let abox = {
    x: area.position.x + area.text.position.x - width / 2,
    y: area.position.y + area.text.position.y - size / 2,
    width: width,
    height: size,
  };
  if (area.rotation) {
    abox = rotateRectangluarBox(area, abox);
  }
  return abox;
};

const polygonBBox = (area) => {
  const points = area.rotation
    ? area.polygon.points.map((p) => ({
      x:
        Math.cos((area.rotation / 180) * Math.PI) * p.x -
        Math.sin((area.rotation / 180) * Math.PI) * p.y,
      y:
        Math.sin((area.rotation / 180) * Math.PI) * p.x +
        Math.cos((area.rotation / 180) * Math.PI) * p.y,
    }))
    : area.polygon.points;
  const minx = Math.min(...points.map((s) => s.x));
  const miny = Math.min(...points.map((s) => s.y));
  const maxx = Math.max(...points.map((s) => s.x));
  const maxy = Math.max(...points.map((s) => s.y));
  return {
    x: area.position.x + minx,
    y: area.position.y + miny,
    width: maxx - minx,
    height: maxy - miny,
  };
};

const ellipseBBox = (area) => {
  // See https://math.stackexchange.com/a/91304 for math
  const thetha = ((area.rotation || 0) / 180) * Math.PI;
  const a = area.ellipse.radius.x;
  const b = area.ellipse.radius.y;
  const width =
    2 *
    Math.sqrt(
      Math.pow(a * Math.cos(thetha), 2) + Math.pow(b * Math.sin(thetha), 2)
    );
  const height =
    2 *
    Math.sqrt(
      Math.pow(a * Math.sin(thetha), 2) + Math.pow(b * Math.cos(thetha), 2)
    );
  return {
    x: area.position.x - width / 2,
    y: area.position.y - height / 2,
    width: width,
    height: height,
  };
};

const findClosestGridPoint = ({ x, y, zone }) => {
  if (zone) {
    x += zone.position.x;
    y += zone.position.y;
  }
  // grid-size was 10, but 5 fits better with default seating distance of 25
  x = Math.round(x / 20) * 20;
  y = Math.round(y / 20) * 20;
  if (zone) {
    x -= zone.position.x;
    y -= zone.position.y;
  }
  return {
    x,
    y,
  };
};

const rotatePolygon = (points, rotation, ox, oy) => {
  return rotation
    ? points.map((p) => ({
      x:
        Math.cos((rotation / 180) * Math.PI) * (p.x - ox) -
        Math.sin((rotation / 180) * Math.PI) * (p.y - oy) +
        ox,
      y:
        Math.sin((rotation / 180) * Math.PI) * (p.x - ox) +
        Math.cos((rotation / 180) * Math.PI) * (p.y - oy) +
        oy,
    }))
    : points;
};

const testOverlap = (area, zone, xmin, ymin, xmax, ymax) => {
  // Check if an area should be selected by the selection box [xmin, ymin, xmax, ymax]
  // For text, circle, and ellipse, we return true as soon as the object is touched
  // For polygons and rectangles, we return true when a *point* of the object is in the box
  // Yes, this is inconsistent, but it makes sense with how things are used in seating plans. Polygons and rectangles
  // are very commonly used as "background" objects (e.g. to mark an area of the plan) and it would be absolutely
  // annoying if you'd always select them when selecting any seats within them. Also, intersection of arbitrary
  // non-convex polygons is really hard.
  if (area.shape === "circle") {
    return circleBox(
      zone.position.x + area.position.x,
      zone.position.y + area.position.y,
      area.circle.radius,
      xmin,
      ymin,
      xmax - xmin,
      ymax - ymin
    );
  } else if (area.shape === "ellipse" || area.shape === "gaCircle") {
    // the intersection library only does axis-oriented ellipses… so what do we do? we rotate our rectangle instead…
    return polygonEllipse(
      rotatePolygon(
        [
          { x: xmin, y: ymin },
          { x: xmax, y: ymin },
          { x: xmax, y: ymax },
          { x: xmin, y: ymax },
        ],
        -area.rotation,
        zone.position.x + area.position.x,
        zone.position.y + area.position.y
      ).flatMap((p) => [p.x, p.y]),
      zone.position.x + area.position.x,
      zone.position.y + area.position.y,
      area.ellipse.radius.x,
      area.ellipse.radius.y
    );
  } else if (area.shape === "rectangle" || area.shape === "gaSquare") {
    return rotatePolygon(
      [
        {
          x: zone.position.x + area.position.x,
          y: zone.position.y + area.position.y,
        },
        {
          x: zone.position.x + area.position.x + area.rectangle.width,
          y: zone.position.y + area.position.y,
        },
        {
          x: zone.position.x + area.position.x + area.rectangle.width,
          y: zone.position.y + area.position.y + area.rectangle.height,
        },
        {
          x: zone.position.x + area.position.x,
          y: zone.position.y + area.position.y + area.rectangle.height,
        },
      ],
      area.rotation,
      zone.position.x + area.position.x,
      zone.position.y + area.position.y
    ).some((p) => p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax);
  } else if (area.shape === "polygon" || area.shape === "gaPolygon") {
    return rotatePolygon(
      area.polygon.points.map((p) => ({
        x: zone.position.x + area.position.x + p.x,
        y: zone.position.y + area.position.y + p.y,
      })),
      area.rotation,
      zone.position.x + area.position.x,
      zone.position.y + area.position.y
    ).some((p) => p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax);
  } else if (area.shape === "text") {
    const s = area.text.size || 16;
    const width = estimateTextWidth(area.text.text, s);
    return polygonBox(
      rotatePolygon(
        [
          {
            x: zone.position.x + area.position.x - width / 2,
            y: zone.position.y + area.position.y - s / 2,
          },
          {
            x: zone.position.x + area.position.x + width / 2,
            y: zone.position.y + area.position.y - s / 2,
          },
          {
            x: zone.position.x + area.position.x + width / 2,
            y: zone.position.y + area.position.y + s / 2,
          },
          {
            x: zone.position.x + area.position.x - width / 2,
            y: zone.position.y + area.position.y + s / 2,
          },
        ],
        area.rotation,
        zone.position.x + area.position.x,
        zone.position.y + area.position.y
      ).flatMap((p) => [p.x, p.y]),
      xmin,
      ymin,
      xmax - xmin,
      ymax - ymin
    );
  } else if (area.shape === "roundTable") {
    return circleBox(
      zone.position.x + area.position.x,
      zone.position.y + area.position.y,
      area.radius + 20,
      xmin,
      ymin,
      xmax - xmin,
      ymax - ymin
    );
  }
};

const findCircleCenter = ({ x1, y1, x2, y2, radius, sign }) => {
  // See https://math.stackexchange.com/a/1781546 for reasoning
  const centerx = 0.5 * (x1 + x2);
  const centery = 0.5 * (y1 + y2);
  const distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  const b = Math.sqrt(radius * radius - (distance / 2) * (distance / 2));
  const cx = centerx + ((b * (centery - y1)) / (distance / 2)) * sign;
  const cy = centery - ((b * (centerx - x1)) / (distance / 2)) * sign;

  return { cx, cy };
};

let degreeInCircle = (y, x) => {
  // Finds the position a point relative to the circle in polar coordinates
  let theta = Math.atan2(-y, x); // y goes up in math, but our y goes down!
  if (theta < 0) {
    // We don't want negative angles for consistency
    theta += 2 * Math.PI;
  }
  return theta;
};

export {
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
};
