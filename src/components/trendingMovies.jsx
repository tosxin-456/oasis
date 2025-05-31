import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const API_KEY = "49e8f09b8364cf1348ed4f97e81039bb";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const GenreGallery = () => {
  const [genresWithImages, setGenresWithImages] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchGenresAndMovies = async () => {
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
    };

    fetchGenresAndMovies();
  }, []);

  const initialDisplayCount = isMobile ? 2 : 5;
  const displayedGenres = showAll
    ? genresWithImages
    : genresWithImages.slice(0, initialDisplayCount);
  const hasMoreGenres = genresWithImages.length > initialDisplayCount;

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  if (genresWithImages.length === 0) {
    return <div className="p-8 text-white text-center">Loading genres...</div>;
  }

  return (
    <div className="p-8 bg-black w-[95%] md:w-[90%] m-auto min-h-screen">
      <h3 className="m-2 text-lg text-white ">
        {" "}
        Explore our wide variety of categories
      </h3>
      <p className="m-2 text-sm mb-10 text-[#999999] ">
        {" "}
        Whether you're looking for a comedy to make you laugh, a drama to make
        you think, or a documentary to learn something new
      </p>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Genre grid */}
        <div className="grid grid-cols-5 gap-4">
          {displayedGenres.map((genre) => (
            <div
              key={genre.id}
              className="bg-[#1A1A1A] rounded-xl overflow-hidden p-3 hover:bg-gray-700 transition-colors border-solid border-[1px] border-[#262626] relative"
            >
              <div className="grid grid-cols-2 grid-rows-2">
                {genre.posters.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Poster ${i}`}
                    className="w-full h-20 object-cover"
                  />
                ))}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1A1A1A] via-[black]/80 to-transparent pointer-events-none"></div>

              {/* Genre name positioned over the fade */}
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <h2 className="text-base text-white font-semibold text-start drop-shadow-lg">
                  {genre.name}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {hasMoreGenres && (
          <div className="flex justify-center mt-6">
            <button
              onClick={toggleShowAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#21A9A9] hover:bg-[#1d9494] text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show More ({genresWithImages.length - initialDisplayCount})
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Genre grid */}
        <div className="grid grid-cols-2 gap-4">
          {displayedGenres.map((genre) => (
            <div
              key={genre.id}
              className="bg-[#1A1A1A] rounded-xl overflow- p-4 hover:bg-gray-700 transition-colors border-solid border-[1px] border-[#262626] relative"
            >
              <div className="grid grid-cols-2 grid-rows-2">
                {genre.posters.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Poster ${i}`}
                    className="w-full h-24 object-cover"
                  />
                ))}
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#1A1A1A] via-[black]/80 to-transparent pointer-events-none"></div>

              {/* Genre name positioned over the fade */}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <h2 className="text-lg text-white font-semibold text-start drop-shadow-lg">
                  {genre.name}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {hasMoreGenres && (
          <div className="flex justify-center mt-6">
            <button
              onClick={toggleShowAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#21A9A9] hover:bg-[#1d9494] text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show More ({genresWithImages.length - initialDisplayCount})
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenreGallery;
