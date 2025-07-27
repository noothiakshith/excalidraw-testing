import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./components/Homepage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:id" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
