import React from "react";
import { useParams } from "react-router-dom";
import ToolBar from "./Toolbar/ToolBar";
import ToolBox from "./Toolbox/ToolBox";
import Board from "./Board/Board";
export default function HomePage() {
  const { id } = useParams();
  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Excalidraw</h1>
          <p className="text-gray-600">Please provide a canvas ID in the URL or create a new canvas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen">
   

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b shadow-sm">
          <ToolBar />
        </div>

        {/* Board and Toolbox */}
        <div className="flex flex-1 relative bg-white">
          {/* Board */}
          <Board id={id} className="flex-1" />

          {/* Toolbox */}
          <div className="w-64 border-l bg-gray-50">
            <ToolBox />
          </div>
        </div>
      </div>
    </div>
  );
}
