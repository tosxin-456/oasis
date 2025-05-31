import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Star,
  Calendar,
  Tv,
  Film,
  Loader,
  Menu
} from "lucide-react";

// You'll need to replace this with your actual logo import
const logo =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IiMyMUE5QTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9BU0lTPC90ZXh0Pgo8L3N2Zz4K";

const API_KEY = "49e8f09b8364cf1348ed4f97e81039bb";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w200";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Opening search
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      // Closing search
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
    setIsMobileMenuOpen(false);
    // Replace with your navigation logic
    console.log(`Navigate to: ${link === "home" ? "/" : "/movies"}`);
  };

  // Search API function
  const searchMoviesAndTVShows = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&page=1`
      );
      const data = await response.json();

      // Filter out person results and only show movies/TV shows
      const filteredResults = data.results
        .filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        )
        .slice(0, 8); // Limit to 8 results

      setSearchResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debouncing
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchMoviesAndTVShows(query);
    }, 300);
  };

  // Format release date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.getFullYear();
  };

  // Get title based on media type
  const getTitle = (item) => {
    return item.media_type === "movie" ? item.title : item.name;
  };

  // Get release date based on media type
  const getReleaseDate = (item) => {
    return item.media_type === "movie"
      ? item.release_date
      : item.first_air_date;
  };

  // Handle search result click
  const handleResultClick = (item) => {
    // You can implement navigation to detail page here
    console.log("Selected item:", item);
    toggleSearch(); // Close search
  };

  // Clear search timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const linkClasses = (linkName) =>
    `px-4 py-2 font-medium rounded ${
      activeLink === linkName
        ? "text-white bg-[#1F1F1F]"
        : "text-white border-gray-400"
    }`;

  const mobileLinkClasses = (linkName) =>
    `w-full text-left px-6 py-4 text-lg font-medium transition-colors ${
      activeLink === linkName
        ? "text-white bg-[#1F1F1F]"
        : "text-white hover:bg-gray-800"
    }`;

  return (
    <>
      <nav className="bg-transparent font-man z-[80] text-white flex justify-between items-center p-4 relative">
        <img src={logo} alt="Oasis Logo" className="h-8" />

        {/* Desktop Menu */}
        <div className="hidden border border-[#1F1F1F] p-1 rounded-md md:flex gap-4 text-sm">
          <button
            onClick={() => handleLinkClick("home")}
            className={linkClasses("home")}
          >
            Home
          </button>
          <button
            onClick={() => handleLinkClick("movies")}
            className={linkClasses("movies")}
          >
            Movies | Shows | Live Games
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Only show hamburger menu and search icon when mobile menu is closed */}
          {!isMobileMenuOpen && (
            <>
              <Search
                className="text-white w-6 h-6 cursor-pointer hover:text-[#21A9A9] transition-colors"
                onClick={toggleSearch}
              />
              <Menu
                onClick={toggleMenu}
                className="md:hidden border-[#1F1F1F] border cursor-pointer text-white w-6 h-6 hover:text-[#21A9A9] transition-colors"
              />
            </>
          )}
        </div>

        {isSearchOpen && (
          <>
            {/* Search Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleSearch}
            />

            {/* Search Container */}
            <div className="absolute top-full left-0 right-0 bg-black border-t border-gray-600 z-50 shadow-2xl">
              <div className="max-w-4xl mx-auto p-4">
                {/* Search Input */}
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="text-gray-400 w-5 h-5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search movies, shows..."
                    className="flex-1 px-4 py-3 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-[#21A9A9] focus:ring-1 focus:ring-[#21A9A9] transition-colors"
                  />
                  {isSearching && (
                    <Loader className="w-5 h-5 text-[#21A9A9] animate-spin" />
                  )}
                  <button
                    onClick={toggleSearch}
                    className="text-white hover:text-gray-300 transition-colors p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Results */}
                {showResults && (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="grid gap-2">
                        {searchResults.map((item) => (
                          <div
                            key={`${item.media_type}-${item.id}`}
                            onClick={() => handleResultClick(item)}
                            className="flex items-center space-x-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#21A9A9]"
                          >
                            {/* Poster */}
                            <div className="flex-shrink-0">
                              {item.poster_path ? (
                                <img
                                  src={`${IMAGE_BASE}${item.poster_path}`}
                                  alt={getTitle(item)}
                                  className="w-12 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center">
                                  {item.media_type === "movie" ? (
                                    <Film className="w-6 h-6 text-gray-400" />
                                  ) : (
                                    <Tv className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-white font-medium truncate">
                                  {getTitle(item)}
                                </h3>
                                <span className="flex-shrink-0 px-2 py-1 text-xs bg-[#21A9A9] text-white rounded">
                                  {item.media_type === "movie" ? "Movie" : "TV"}
                                </span>
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                {getReleaseDate(item) && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {formatDate(getReleaseDate(item))}
                                    </span>
                                  </div>
                                )}

                                {item.vote_average > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span>{item.vote_average.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>

                              {item.overview && (
                                <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                                  {item.overview.length > 100
                                    ? `${item.overview.substring(0, 100)}...`
                                    : item.overview}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.trim() && !isSearching ? (
                      <div className="text-center py-8 text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No results found for "{searchQuery}"</p>
                        <p className="text-sm mt-1">
                          Try searching with different keywords
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Search Suggestions when no query */}
                {!searchQuery.trim() && !showResults && (
                  <div className="text-center py-6 text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Start typing to search movies and TV shows...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Full-Page Mobile Sidebar - Moved outside navbar */}
      <div
        className={`fixed inset-0 z-[99] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={toggleMenu}
        />

        {/* Sidebar */}
        <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-black shadow-xl">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <img src={logo} alt="Oasis Logo" className="h-8" />
            <button
              onClick={toggleMenu}
              className="text-white cursor-pointer hover:text-gray-300 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex flex-col pt-8">
            <button
              onClick={() => handleLinkClick("home")}
              className={mobileLinkClasses("home")}
            >
              Home
            </button>
            <button
              onClick={() => handleLinkClick("movies")}
              className={mobileLinkClasses("movies")}
            >
              Movies | Shows | Live Games
            </button>

            {/* Search Option in Mobile */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setTimeout(() => toggleSearch(), 300);
              }}
              className="w-full text-left px-6 py-4 text-lg font-medium text-white hover:bg-gray-800 transition-colors flex items-center space-x-3"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
