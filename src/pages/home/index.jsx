import React from "react";
import desktop_background from "../../assets/backgrounds/desktop.png";
import logo from "../../assets/backgrounds/logo.svg";
import { Play, PlayIcon } from "lucide-react";
import { IoPlay } from "react-icons/io5";
import GenreGallery from "../../components/trendingGenres";
import MoviesPage from "../../components/trendingMovies";
import SeriesPage from "../../components/trendingSeries";

function Home() {
  return (
    <div className="min-h-screen font-man bg-black">
      {/* Hero Section with Background */}
      <div className="relative mt-[-50px] h-screen overflow-hidden">
        {/* Desktop Background */}

        {/* Mobile Background */}
        <div
          className=" absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${desktop_background})` }}
        />

        {/* Content Container */}
        <div className="relative z-20 flex items-center justify-center h-full">
          <div className="text-center text-white px-4">
            <div className="w-fit m-auto">
              <img src={logo} alt="" className="w-[60%] m-auto " />
            </div>
            <h1 className="text-3xl md:text-6xl font-bold mb-4">
              Oasis Plus: Your Streaming & Download Hub
            </h1>
            <div className="flex justify-center">
              <p className="text-sm md:text-base text-[#999999] md:w-4/5 text-center opacity-90 leading-relaxed">
                Stream and download movies, shows, and live matches—anytime,
                anywhere. From blockbusters to sports, Oasis Plus is your go-to
                for non-stop entertainment. Stay updated and dive into what you
                love.
              </p>
            </div>

            <button className=" cursor-pointer bg-[#21A9A9] items-center px-4 py-2 my-4 rounded-md flex m-auto ">
              <IoPlay />
              Explore The Oasis
            </button>
          </div>
        </div>
      </div>
      <GenreGallery />

      <MoviesPage />
      <SeriesPage />

      {/* Additional Content Section */}
      <div className="p-4 md:p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Featured Content
          </h2>
          <p className="text-gray-300 text-lg">
            Discover the latest movies, trending shows, and live gaming content
            all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
