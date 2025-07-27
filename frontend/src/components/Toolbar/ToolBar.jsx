import React from "react";
import {
  FaSlash, FaRegCircle, FaArrowRight, FaPaintBrush,
  FaEraser, FaUndoAlt, FaRedoAlt, FaFont, FaDownload,
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";
import { TOOL_ITEMS } from "../../../constants";
import { useBoardStore } from "../../store/useboardstore";

const Toolbar = () => {
  const { activeToolItem, changeTool, undo, redo } = useBoardStore();

  const handleDownload = () => {
    const canvas = document.getElementById("canvas");
    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = data;
    link.download = "board.png";
    link.click();
  };

  const toolButtons = [
    { tool: TOOL_ITEMS.BRUSH, icon: <FaPaintBrush /> },
    { tool: TOOL_ITEMS.LINE, icon: <FaSlash /> },
    { tool: TOOL_ITEMS.RECTANGLE, icon: <LuRectangleHorizontal /> },
    { tool: TOOL_ITEMS.CIRCLE, icon: <FaRegCircle /> },
    { tool: TOOL_ITEMS.ARROW, icon: <FaArrowRight /> },
    { tool: TOOL_ITEMS.ERASER, icon: <FaEraser /> },
    { tool: TOOL_ITEMS.TEXT, icon: <FaFont /> },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white border border-gray-300 rounded-2xl p-2 shadow-md z-50">
      {toolButtons.map(({ tool, icon }) => (
        <button
          key={tool}
          onClick={() => changeTool(tool)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition ${
            activeToolItem === tool ? "bg-gray-200 border border-gray-400" : ""
          }`}
        >
          {icon}
        </button>
      ))}
      <button
        onClick={undo}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
      >
        <FaUndoAlt />
      </button>
      <button
        onClick={redo}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
      >
        <FaRedoAlt />
      </button>
      <button
        onClick={handleDownload}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
      >
        <FaDownload />
      </button>
    </div>
  );
};

export default Toolbar;
