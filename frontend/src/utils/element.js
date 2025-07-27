import { ARROW_LENGTH, TOOL_ITEMS } from "../../constants";
import getStroke from "perfect-freehand";
import rough from 'roughjs';
import { getArrowHeadsCoordinates, isPointCloseToLine } from "./math";

const gen = rough.generator();

export const createnewlement = (id, x1, y1, x2, y2, { type, stroke, fill, size }) => {
  const element = { id, x1, y1, x2, y2, type, stroke, fill, size };
  const options = {
    seed: id + 1,
    fill: "solid"
  };

  if (stroke) options.stroke = stroke;
  if (fill) options.fill = fill;
  if (size) options.strokeWidth = size;

  switch (type) {
    case TOOL_ITEMS.BRUSH:
      const brushPoints = [{ x: x1, y: y1 }];
      const path = new Path2D(getSvgPathFromStroke(getStroke(brushPoints)));
      return {
        id,
        points: brushPoints,
        path,
        type,
        stroke
      };

    case TOOL_ITEMS.LINE:
      element.roughele = gen.line(x1, y1, x2, y2, options);
      return element;

    case TOOL_ITEMS.RECTANGLE:
      element.roughele = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options);
      return element;

    case TOOL_ITEMS.CIRCLE:
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      element.roughele = gen.ellipse(cx, cy, width, height, options);
      return element;

    case TOOL_ITEMS.ARROW:
      const { x3, y3, x4, y4 } = getArrowHeadsCoordinates(x1, y1, x2, y2, ARROW_LENGTH);
      const points = [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x2, y2],
        [x4, y4]
      ];
      element.roughele = gen.linearPath(points, options);
      return element;

    case TOOL_ITEMS.TEXT:
      element.text = "";
      element.width = 200; // Default width for text box
      element.height = size || 16; // Height based on font size
      return element;

    default:
      throw new Error("Type not recognized");
  }
};

export const isPointNearElement = (element, pointX, pointY) => {
  const { x1, y1, x2, y2, type } = element;
  const context = document.getElementById("canvas").getContext("2d");

  switch (type) {
    case TOOL_ITEMS.LINE:
    case TOOL_ITEMS.ARROW:
      return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);

    case TOOL_ITEMS.RECTANGLE:
    case TOOL_ITEMS.CIRCLE:
      return (
        isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
        isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
        isPointCloseToLine(x2, y2, x1, y2, pointX, pointY) ||
        isPointCloseToLine(x1, y2, x1, y1, pointX, pointY)
      );

    case TOOL_ITEMS.BRUSH:
      const elPath = new Path2D(getSvgPathFromStroke(getStroke(element.points)));
      return context.isPointInPath(elPath, pointX, pointY);

    case TOOL_ITEMS.TEXT:
      if (!element.text || element.text.trim() === '') return false;
      
      context.save();
      context.font = `${element.size || 16}px Arial, sans-serif`;
      
      // Calculate text bounds
      const lines = element.text.split('\n');
      const lineHeight = (element.size || 16) * 1.2;
      const maxWidth = Math.max(...lines.map(line => context.measureText(line).width));
      const totalHeight = lines.length * lineHeight;
      
      context.restore();
      
      // Check if point is within text bounds
      return (
        pointX >= x1 && 
        pointX <= x1 + maxWidth && 
        pointY >= y1 && 
        pointY <= y1 + totalHeight
      );

    default:
      throw new Error("Type not recognized");
  }
};

export const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};
