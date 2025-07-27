import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./components/Homepage";
import CanvasDashboard from "./components/CanvasDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CanvasDashboard />} />
        <Route path="/canvas/:id" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
