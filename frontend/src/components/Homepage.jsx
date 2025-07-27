import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import ToolBar from "./Toolbar/ToolBar";
import ToolBox from "./Toolbox/ToolBox";
import Board from "./Board/Board";
export default function HomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        <div className="h-14 bg-white border-b shadow-sm flex items-center">
          <button
            onClick={() => navigate('/')}
            className="ml-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <div className="flex-1">
            <ToolBar />
          </div>
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
