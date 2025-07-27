import React from "react";
import {
  FaSlash,
  FaRegCircle,
  FaArrowRight,
  FaPaintBrush,
  FaEraser,
  FaUndoAlt,
  FaRedoAlt,
  FaFont,
  FaDownload,
  FaSquareFull,
} from "react-icons/fa";
import { TOOL_ITEMS } from "../../../constants";
import { useBoardStore } from "../../store/useboardstore";

const tools = [
  { id: TOOL_ITEMS.BRUSH, icon: <FaPaintBrush /> },
  { id: TOOL_ITEMS.LINE, icon: <FaSlash /> },
  { id: TOOL_ITEMS.RECTANGLE, icon: <FaSquareFull /> },
  { id: TOOL_ITEMS.CIRCLE, icon: <FaRegCircle /> },
  { id: TOOL_ITEMS.ARROW, icon: <FaArrowRight /> },
  { id: TOOL_ITEMS.ERASER, icon: <FaEraser /> },
  { id: TOOL_ITEMS.TEXT, icon: <FaFont /> },
];

function ToolBar() {
  const { activeToolItem, undo, redo, changeTool } = useBoardStore();

  const handleDownload = () => {
    console.log("Download triggered");
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white p-2 rounded-lg shadow-md flex items-center gap-4">
      {/* Tool Buttons */}
      <div className="flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => changeTool(tool.id)}
            className={`p-2 rounded cursor-pointer text-lg ${
              activeToolItem === tool.id
                ? "border-2 border-black bg-gray-200"
                : "border border-gray-300 bg-white"
            }`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Undo / Redo / Download */}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={undo}
          className="p-2 border border-gray-300 rounded cursor-pointer"
          title="Undo"
        >
          <FaUndoAlt />
        </button>
        <button
          onClick={redo}
          className="p-2 border border-gray-300 rounded cursor-pointer"
          title="Redo"
        >
          <FaRedoAlt />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 border border-gray-300 rounded cursor-pointer"
          title="Download"
        >
          <FaDownload />
        </button>
      </div>
    </div>
  );
}

export default ToolBar;
