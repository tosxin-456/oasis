import React from "react";
import MoviesPage from "../../components/trendingMovies";
import SeriesPage from "../../components/trendingSeries";
import FootballPage from "../../components/trendingMatches";
import MatchPage from "../../components/test";
import FootballMatchTracker from "../../components/matchDetails";
import LiveSoccerDashboard from "../../components/liveMatches";

function Movies() {
  return (
    <div className="p-4 text-white">
      {/* Welcome to the Movies Page */}
      <MoviesPage />
      <SeriesPage />
      <MatchPage />
      {/* <LiveSoccerDashboard /> */}
    </div>
  );
}

export default Movies;
