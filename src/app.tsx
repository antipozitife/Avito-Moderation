import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage";
import ModerationPage from "./pages/ModerationPage/ModerationPage";
//import StatsPage from "./pages/StatsPage/StatsPage";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/list" element={<MainPage />} />
      <Route path="/item/:id" element={<ModerationPage />} />
    </Routes>
  </Router>
);

export default App;
