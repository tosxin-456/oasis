import React from "react";
import MoviesPage from "../../components/trendingMovies";
import SeriesPage from "../../components/trendingSeries";

function Movies() {
  return (
    <div className="p-4 text-white">
      Welcome to the Movies Page
      <MoviesPage />
      <SeriesPage />
    </div>
  );
}

export default Movies;
