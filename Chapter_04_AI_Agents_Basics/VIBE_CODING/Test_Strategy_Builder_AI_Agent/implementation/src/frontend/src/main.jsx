import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import MainPage from "./pages/MainPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles.css";

function Nav() {
  const loc = useLocation();
  return (
    <nav className="nav">
      <h1>🎯 AI Test Strategy Builder</h1>
      <div>
        <Link to="/" className={loc.pathname === "/" ? "active" : ""}>Home</Link>
        <Link to="/settings" className={loc.pathname === "/settings" ? "active" : ""}>Settings</Link>
      </div>
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Nav />
    <main className="container">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </main>
  </BrowserRouter>
);
