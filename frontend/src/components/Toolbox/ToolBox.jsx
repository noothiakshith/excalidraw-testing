import React from "react";
import {
  COLORS, FILL_TOOL_TYPES, SIZE_TOOL_TYPES,
  STROKE_TOOL_TYPES, TOOL_ITEMS
} from "../../../constants";
import { useBoardStore } from "../../store/useboardstore";
import { usetoolstore } from "../../store/usetoolstore";

const Toolbox = () => {
  const { activeToolItem } = useBoardStore();
  const { toolboxstate, changestroke, changefill, changesize } = usetoolstore();

  const stroke = toolboxstate[activeToolItem]?.stroke;
  const fill = toolboxstate[activeToolItem]?.fill;
  const size = toolboxstate[activeToolItem]?.size;

  return (
    <div className="fixed top-24 left-4 bg-white rounded-xl p-4 shadow-md border border-gray-300 w-60 z-40">
      {STROKE_TOOL_TYPES.includes(activeToolItem) && (
        <div className="mb-4">
          <div className="font-medium text-sm mb-2">Stroke Color</div>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="color"
              value={stroke}
              onChange={(e) => changestroke(activeToolItem, e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
            />
            {Object.values(COLORS).map((c) => (
              <div
                key={c}
                onClick={() => changestroke(activeToolItem, c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  stroke === c ? "border-black" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {FILL_TOOL_TYPES.includes(activeToolItem) && (
        <div className="mb-4">
          <div className="font-medium text-sm mb-2">Fill Color</div>
          <div className="flex flex-wrap gap-2 items-center">
            <div
              onClick={() => changefill(activeToolItem, null)}
              className={`w-6 h-6 rounded-full border-2 border-dashed cursor-pointer ${
                fill === null ? "border-black" : "border-gray-400"
              }`}
            />
            {Object.values(COLORS).map((c) => (
              <div
                key={c}
                onClick={() => changefill(activeToolItem, c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  fill === c ? "border-black" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {SIZE_TOOL_TYPES.includes(activeToolItem) && (
        <div>
          <div className="font-medium text-sm mb-2">
            {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
          </div>
          <input
            type="range"
            min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
            max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
            step={1}
            value={size}
            onChange={(e) => changesize(activeToolItem, +e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default Toolbox;
