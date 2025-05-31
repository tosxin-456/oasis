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
  Star,
  Calendar
} from "lucide-react";

const API_KEY = "49e8f09b8364cf1348ed4f97e81039bb";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const SeriesPage = () => {
  const [genresWithImages, setGenresWithImages] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [newReleasesIndex, setNewReleasesIndex] = useState(0);
  const [mustWatch, setMustWatch] = useState([]);
  const [mustWatchIndex, setMustWatchIndex] = useState(0); // Added missing state

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
        // Trending TV Series (3 pages)
        const allTrending = await fetchMultiplePages(
          (page) =>
            `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&page=${page}`,
          3
        );
        setTrendingSeries(allTrending.slice(0, 60));

        // New TV Series Releases (3 pages)
        const currentDate = new Date();
        const threeMonthsAgo = new Date(
          currentDate.setMonth(currentDate.getMonth() - 3)
        );
        const dateString = threeMonthsAgo.toISOString().split("T")[0];

        const allNewReleases = await fetchMultiplePages(
          (page) =>
            `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&first_air_date.gte=${dateString}&sort_by=first_air_date.desc&page=${page}`,
          3
        );
        setNewReleases(allNewReleases.slice(0, 60));

        // Must Watch Shows (high rating + popular)
        const mustWatchRes = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000&page=1`
        );
        const mustWatchData = await mustWatchRes.json();
        setMustWatch(mustWatchData.results.slice(0, 20)); // Top 20 must-watch shows

        // TV Genre Posters
        const genreRes = await fetch(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=en-US`
        );
        const genreData = await genreRes.json();
        const genres = genreData.genres;

        const results = await Promise.all(
          genres.map(async (genre) => {
            const seriesRes = await fetch(
              `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genre.id}&sort_by=popularity.desc`
            );
            const seriesData = await seriesRes.json();

            const topSeries = seriesData.results
              .filter((series) => series.poster_path)
              .slice(0, 4);

            const posterUrls = topSeries.map(
              (series) => `${IMAGE_BASE}${series.poster_path}`
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

  const formatReleaseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getSeriesStatus = (series) => {
    if (series.in_production) return "Ongoing";
    if (series.status === "Ended") return "Ended";
    if (series.status === "Canceled") return "Canceled";
    return series.status || "Unknown";
  };

  const scrollCarousel = (direction, type) => {
    const itemsPerView = isMobile ? 2 : 5;
    let maxIndex, currentIndex, setIndex;

    // Fixed: Properly handle different carousel types
    if (type === "trending") {
      maxIndex = Math.max(0, trendingSeries.length - itemsPerView);
      currentIndex = trendingIndex;
      setIndex = setTrendingIndex;
    } else if (type === "mustwatch") {
      maxIndex = Math.max(0, mustWatch.length - itemsPerView);
      currentIndex = mustWatchIndex;
      setIndex = setMustWatchIndex;
    } else {
      maxIndex = Math.max(0, newReleases.length - itemsPerView);
      currentIndex = newReleasesIndex;
      setIndex = setNewReleasesIndex;
    }

    const newIndex =
      direction === "left"
        ? Math.max(0, currentIndex - itemsPerView)
        : Math.min(maxIndex, currentIndex + itemsPerView);

    setIndex(newIndex);
  };

  const SeriesCarousel = ({ title, series, currentIndex, type }) => {
    const itemsPerView = isMobile ? 2 : 5;
    const visibleSeries = series.slice(
      currentIndex,
      currentIndex + itemsPerView
    );
    const totalSlides = Math.ceil(series.length / itemsPerView);
    const currentSlide = Math.floor(currentIndex / itemsPerView);
    const canScrollLeft = currentIndex > 0;
    const canScrollRight = currentIndex < series.length - itemsPerView;

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
          {visibleSeries.map((show) => (
            <div
              key={show.id}
              className="bg-[#1A1A1A] rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 border border-[#262626] hover:border-[#21A9A9] relative group cursor-pointer"
            >
              <div className="relative">
                {show.poster_path ? (
                  <img
                    src={`${IMAGE_BASE}${show.poster_path}`}
                    alt={show.name}
                    className="w-full bg-white h-64 md:h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 md:h-72 flex items-center justify-center text-gray-400 text-sm">
                    No Image Available
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold text-sm md:text-base mb-2 line-clamp-2">
                  {show.name}
                </h3>

                {/* Different info for trending vs new releases vs must watch */}
                {type === "trending" ? (
                  // Show rating and popularity for trending series
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{(show.vote_count / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{show.vote_average.toFixed(1)}/10</span>
                    </div>
                  </div>
                ) : type === "mustwatch" ? (
                  // Show rating for must-watch shows
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{show.vote_average.toFixed(1)}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{(show.vote_count / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                ) : (
                  // Show air date for new releases
                  show.first_air_date && (
                    <p className="text-xs text-[#999999]">
                      First aired{" "}
                      <span className="text-[#BFBFBF]">
                        {formatReleaseDate(show.first_air_date)}
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
    trendingSeries.length === 0 &&
    newReleases.length === 0
  ) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21A9A9] mx-auto mb-4"></div>
          <p>Loading series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-[#999999] border-solid border-[1px] min-h-screen">
      {/* Header */}
      <div className="mt-[-30px] p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white w-fit rounded-md py-1.5 px-3 bg-[#21A9A9] text-xl md:text-2xl font-bold">
            TV Series
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Trending Series */}
        {trendingSeries.length > 0 && (
          <SeriesCarousel
            title="Trending Shows Now"
            series={trendingSeries}
            currentIndex={trendingIndex}
            type="trending"
          />
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <SeriesCarousel
            title="New Released Shows"
            series={newReleases}
            currentIndex={newReleasesIndex}
            type="new"
          />
        )}

        {/* Must Watch - Fixed props */}
        {mustWatch.length > 0 && (
          <SeriesCarousel
            title="Must - Watch Shows"
            series={mustWatch}
            currentIndex={mustWatchIndex}
            type="mustwatch"
          />
        )}
      </div>
    </div>
  );
};

export default SeriesPage;
