import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Oasis logo.svg";
import { Search, X } from "lucide-react";
import { HiMenuAlt3 } from "react-icons/hi";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const navigate = useNavigate();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    setIsMobileMenuOpen(false);
    navigate(link === "home" ? "/" : "/movies");
  };

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
                className="text-white w-6 h-6 cursor-pointer"
                onClick={toggleSearch}
              />
              <HiMenuAlt3
                onClick={toggleMenu}
                className="md:hidden border-[#1F1F1F] border cursor-pointer text-white w-6 h-6"
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
            <div className="absolute top-full left-0 right-0 bg-black border-t border-gray-600 p-4 z-50 shadow-lg">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-2">
                  <Search className="text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search movies, shows, live games..."
                    className="flex-1 px-4 py-3 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                    autoFocus
                  />
                  <button
                    onClick={toggleSearch}
                    className="text-white hover:text-gray-300 transition-colors p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
