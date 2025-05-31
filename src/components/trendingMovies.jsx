import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  ArrowRight,
  ArrowLeft,
  Star
} from "lucide-react";

const API_KEY = "49e8f09b8364cf1348ed4f97e81039bb";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const MoviesPage = () => {
  const [genresWithImages, setGenresWithImages] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [newReleasesIndex, setNewReleasesIndex] = useState(0);

  const fetchMultiplePages = async (urlTemplate, totalPages = 3) => {
    const allResults = [];

    for (let page = 1; page <= totalPages; page++) {
      const res = await fetch(urlTemplate(page));
      const data = await res.json();
      allResults.push(...data.results);
    }

    return allResults;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Trending Movies (3 pages)
        const allTrending = await fetchMultiplePages(
          (page) =>
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=${page}`,
          3
        );
        setTrendingMovies(allTrending.slice(0, 60)); // Adjust number as needed
        console.log(allTrending);
        // New Releases (3 pages)
        const currentDate = new Date();
        const threeMonthsAgo = new Date(
          currentDate.setMonth(currentDate.getMonth() - 3)
        );
        const dateString = threeMonthsAgo.toISOString().split("T")[0];

        const allNewReleases = await fetchMultiplePages(
          (page) =>
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${dateString}&sort_by=release_date.desc&page=${page}`,
          3
        );
        setNewReleases(allNewReleases.slice(0, 60)); // Adjust number as needed

        // Genre Posters
        const genreRes = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
        );
        const genreData = await genreRes.json();
        const genres = genreData.genres;

        const results = await Promise.all(
          genres.map(async (genre) => {
            const movieRes = await fetch(
              `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genre.id}&sort_by=popularity.desc`
            );
            const movieData = await movieRes.json();

            const topMovies = movieData.results
              .filter((movie) => movie.poster_path)
              .slice(0, 4);

            const posterUrls = topMovies.map(
              (movie) => `${IMAGE_BASE}${movie.poster_path}`
            );
            return {
              ...genre,
              posters: posterUrls
            };
          })
        );

        setGenresWithImages(results.filter((g) => g.posters.length === 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatReleaseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const scrollCarousel = (direction, type) => {
    const itemsPerView = isMobile ? 2 : 5;
    const maxIndex =
      type === "trending"
        ? Math.max(0, trendingMovies.length - itemsPerView)
        : Math.max(0, newReleases.length - itemsPerView);

    if (type === "trending") {
      const newIndex =
        direction === "left"
          ? Math.max(0, trendingIndex - itemsPerView)
          : Math.min(maxIndex, trendingIndex + itemsPerView);
      setTrendingIndex(newIndex);
    } else {
      const newIndex =
        direction === "left"
          ? Math.max(0, newReleasesIndex - itemsPerView)
          : Math.min(maxIndex, newReleasesIndex + itemsPerView);
      setNewReleasesIndex(newIndex);
    }
  };

  const MovieCarousel = ({ title, movies, currentIndex, type }) => {
    const itemsPerView = isMobile ? 2 : 5;
    const visibleMovies = movies.slice(
      currentIndex,
      currentIndex + itemsPerView
    );
    const totalSlides = Math.ceil(movies.length / itemsPerView);
    const currentSlide = Math.floor(currentIndex / itemsPerView);
    const canScrollLeft = currentIndex > 0;
    const canScrollRight = currentIndex < movies.length - itemsPerView;

    return (
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold text-white mb-4 md:mb-0">
            {title}
          </h2>
          <div className="flex justify-center md:justify-end">
            <div className="flex items-center justify-center gap-2 sm:gap-3 bg-black border border-[#333333] p-2 sm:p-3 rounded">
              <button
                onClick={() => scrollCarousel("left", type)}
                disabled={!canScrollLeft}
                className={`p-1.5 sm:p-2 bg-[#1F1F1F] transition-all duration-300 rounded ${
                  canScrollLeft
                    ? "border border-gray-300 hover:border-[#333333] text-gray-300 hover:text-white hover:bg-[#333333]"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {/* Progress indicators */}
              <div className="flex items-center gap-1 px-1 sm:px-2">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-4 sm:w-6 bg-teal-500"
                        : "w-1 bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => scrollCarousel("right", type)}
                disabled={!canScrollRight}
                className={`p-1.5 sm:p-2 bg-[#1F1F1F] transition-all duration-300 rounded ${
                  canScrollRight
                    ? "border border-gray-300 hover:border-[#333333] text-gray-300 hover:text-white hover:bg-[#333333]"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-5"}`}
        >
          {visibleMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-[#1A1A1A] rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 border border-[#262626] hover:border-[#21A9A9] relative group cursor-pointer"
            >
              <div className="relative">
                {movie.poster_path ? (
                  <img
                    src={`${IMAGE_BASE}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full bg-white h-64 md:h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 md:h-72  flex items-center justify-center text-gray-400 text-sm">
                    No Image Available
                  </div>
                )}

                {/* <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#21A9A9] rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div> */}
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold text-sm md:text-base mb-2 line-clamp-2">
                  {movie.title}
                </h3>

                {/* Different info for trending vs new releases */}
                {type === "trending" ? (
                  // Show rating and views for trending movies
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{(movie.vote_count / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                  </div>
                ) : (
                  // Show release date for new releases
                  movie.release_date && (
                    <p className="text-xs text-[#999999]">
                      Released{" "}
                      <span className="text-[#BFBFBF] ">
                        {formatReleaseDate(movie.release_date)}
                      </span>
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (
    genresWithImages.length === 0 &&
    trendingMovies.length === 0 &&
    newReleases.length === 0
  ) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21A9A9] mx-auto mb-4"></div>
          <p>Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-[#999999] border-solid border-[1px] min-h-screen">
      {/* Header */}
      <div className=" mt-[-30px] p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white w-fit rounded-md py-1.5 px-3 bg-[#21A9A9] text-xl md:text-2xl font-bold">
            Movies
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <MovieCarousel
            title="Trending Now"
            movies={trendingMovies}
            currentIndex={trendingIndex}
            type="trending"
          />
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <MovieCarousel
            title="New Releases"
            movies={newReleases}
            currentIndex={newReleasesIndex}
            type="new"
          />
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
