import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Movies from "./pages/movies";
import Footer from "./components/footer";
import FootballMatchTracker from "./components/matchDetails";
import LiveSoccerDashboard from "./components/liveMatches";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/football" element={<LiveSoccerDashboard />} />
        <Route path="/live/match/:id" element={<FootballMatchTracker />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
