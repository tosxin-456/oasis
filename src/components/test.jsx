import React, { useEffect, useState } from "react";
import {
  Play,
  RefreshCw,
  Calendar,
  Clock,
  Trophy,
  Users,
  ArrowLeft,
  ArrowRight,
  Eye,
  Star,
  BookOpen,
  TrendingUp,
  MapPin
} from "lucide-react";

const MatchPage = () => {
  const [matches, setMatches] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBlankPage, setShowBlankPage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);
  const [liveIndex, setLiveIndex] = useState(0);
  const [upcomingIndex, setUpcomingIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://cfapi.xdapiym5297.com/gate509519e3ed311bf857783474e0/api/getFocusMatch?category=1`
      );

      if (!response.ok) throw new Error("Failed to fetch matches");

      const data = await response.json();
      setMatches(data || []);
      console.log(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchNews = async () => {
    try {
      setNewsLoading(true);

      const response = await fetch(
        `https://newsapi.xdapiym5297.com/news/article/match/list?page=1&pageSize=12&sub=1`
      );

      if (!response.ok) throw new Error("Failed to fetch matches");

      const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNews(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchNews();
  }, []);

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  const getMatchStatus = (state, liveState) => {
    if (state === 0)
      return {
        text: "Upcoming",
        color: "text-blue-400",
        bg: "bg-blue-500/20",
        border: "border-blue-500/30"
      };
    if (state === 1 && liveState === 1)
      return {
        text: "Live",
        color: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500/30"
      };
    if (state === 2)
      return {
        text: "Half Time",
        color: "text-orange-400",
        bg: "bg-orange-500/20",
        border: "border-orange-500/30"
      };
    if (state === 3)
      return {
        text: "Finished",
        color: "text-green-400",
        bg: "bg-green-500/20",
        border: "border-green-500/30"
      };
    return {
      text: "Unknown",
      color: "text-gray-400",
      bg: "bg-gray-500/20",
      border: "border-gray-500/30"
    };
  };

  const getTimeUntilMatch = (timestamp) => {
    const matchDate = new Date(timestamp);
    const now = new Date();
    const diffMs = matchDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return "Soon";
  };

  const scrollCarousel = (direction, type) => {
    const itemsPerView = isMobile ? 1 : 3;
    let maxIndex, currentIndex, setIndex, dataLength;

    if (type === "news") {
      dataLength = news.length;
      currentIndex = newsIndex;
      setIndex = setNewsIndex;
    } else if (type === "live") {
      dataLength = matches.filter((m) => m.state === 1 || m.state === 2).length;
      currentIndex = liveIndex;
      setIndex = setLiveIndex;
    } else {
      dataLength = matches.filter((m) => m.state === 0).length;
      currentIndex = upcomingIndex;
      setIndex = setUpcomingIndex;
    }

    maxIndex = Math.max(0, dataLength - itemsPerView);

    const newIndex =
      direction === "left"
        ? Math.max(0, currentIndex - itemsPerView)
        : Math.min(maxIndex, currentIndex + itemsPerView);

    setIndex(newIndex);
  };

  const handlePlayClick = (matchId, teamLink) => {
    const fullURL = `https://afr.808ball2.com/football/${matchId}-${teamLink}.html`;
    window.open(fullURL, "_blank");
  };
  

  const handleBackClick = () => {
    setShowBlankPage(false);
  };

  const handleNewsClick = (article) => {
    console.log("Opening article:", article.title);
    // Add your news article navigation logic here
  };

  const NewsCarousel = ({ title, articles, currentIndex, type }) => {
    const itemsPerView = isMobile ? 1 : 3;
    const visibleArticles = articles.slice(
      currentIndex,
      currentIndex + itemsPerView
    );
    const totalSlides = Math.ceil(articles.length / itemsPerView);
    const currentSlide = Math.floor(currentIndex / itemsPerView);
    const canScrollLeft = currentIndex > 0;
    const canScrollRight = currentIndex < articles.length - itemsPerView;
    const randomViews = Math.floor(Math.random() * 50) + 1;

    if (articles.length === 0 && !newsLoading) {
      return (
        <div className="mb-12">
          <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold text-white mb-6">
            {title}
          </h2>
          <div className="text-center text-gray-400 py-8">
            No {title.toLowerCase()} available at the moment.
          </div>
        </div>
      );
    }

    if (newsLoading) {
      return (
        <div className="mb-12">
          <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold text-white mb-6">
            {title}
          </h2>
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21A9A9] mx-auto mb-4"></div>
            Loading news articles...
          </div>
        </div>
      );
    }

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
          className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}
        >
          {visibleArticles.map((article) => (
            <a
              href={`https://www.808onlivetv.com/news/${article.id}/${article.articleLink}.html`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                key={article.id}
                className="bg-[#1A1A1A] rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 border border-[#262626] hover:border-[#21A9A9] cursor-pointer group"
                onClick={() => handleNewsClick(article)}
              >
                {/* Article content */}
                <div className="relative">
                  <img
                    src={`https://cfcdn.xdapiym5297.com/prod${article.imageUrl}`}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200/1a1a1a/ffffff?text=News";
                    }}
                  />

                  <div className="absolute top-3 left-3">
                    <span className="bg-[#21A9A9] text-white px-2 py-1 rounded text-xs font-semibold">
                      TRENDING
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-black bg-opacity-70 rounded-full p-2">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#21A9A9] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{Math.floor(randomViews)}k views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const MatchCarousel = ({ title, matches, currentIndex, type }) => {
    const filteredMatches =
      type === "live"
        ? matches.filter((m) => m.state === 1 || m.state === 2)
        : matches.filter((m) => m.state === 0);

    const itemsPerView = isMobile ? 1 : 2;
    const visibleMatches = filteredMatches.slice(
      currentIndex,
      currentIndex + itemsPerView
    );
    const totalSlides = Math.ceil(filteredMatches.length / itemsPerView);
    const currentSlide = Math.floor(currentIndex / itemsPerView);
    const canScrollLeft = currentIndex > 0;
    const canScrollRight = currentIndex < filteredMatches.length - itemsPerView;

    if (filteredMatches.length === 0) {
      return (
        <div className="mb-12">
          {/* <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold text-white mb-6">
            {title}
          </h2>
          <div className="text-center text-gray-400 py-8">
            No {title.toLowerCase()} available at the moment.
          </div> */}
        </div>
      );
    }

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
          className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {visibleMatches.map((match) => {
            const status = getMatchStatus(match?.state, match?.liveState);
            const dateTime = formatDateTime(match?.matchTime_t);
            const correctedHomeLogoUrl = match?.homeLogoUrl.replace(
              "http://zq.win007.com",
              "https://cfcdn.xdapiym5297.com/zqwin007"
            );

            const correctedAwayLogoUrl = match?.awayLogoUrl.replace(
              "http://zq.win007.com",
              "https://cfcdn.xdapiym5297.com/zqwin007"
            );

            return (
              <div
                key={match?.matchId}
                className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 hover:bg-gray-700 hover:border-[#21A9A9] transition-all duration-300"
              >
                {/* <a
                  href={`https://www.808onlivetv.com/news/${match.id}/${match.articleLink}.html`}
                > */}
                {/* Header with league and status */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[#21A9A9] font-semibold text-sm uppercase tracking-wide">
                        {match?.leagueName}
                      </p>
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {dateTime.date}
                        <Clock className="w-4 h-4 ml-3 mr-1" />
                        {dateTime.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.color} ${status.border}`}
                    >
                      {status.text}
                      {type === "live" && match?.minute && ` ${match?.minute}'`}
                    </span>
                    <button
                      onClick={() =>
                        handlePlayClick(match.matchId, match.teamLink)
                      }
                      className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
                      title="Watch Match"
                    >
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Score Section */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-4xl font-bold text-white text-center">
                      {match?.homeScore}{" "}
                      <span className="text-gray-500 text-2xl">:</span>{" "}
                      {match?.awayScore}
                    </div>
                  </div>
                </div>

                {/* Teams Section */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {match?.homeLogoUrl ? (
                        <img
                          src={correctedHomeLogoUrl}
                          alt={`${match?.homeName} logo`}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <Users
                        className="w-6 h-6 text-gray-400"
                        style={{
                          display: match?.homeLogoUrl ? "none" : "flex"
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white">
                        {match?.homeName}
                      </p>
                      <p className="text-gray-400 text-sm">Home</p>
                    </div>
                  </div>

                  <div className="mx-8">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 font-bold">VS</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 flex-1 justify-end">
                    <div className="text-right">
                      <p className="font-bold text-lg text-white">
                        {match?.awayName}
                      </p>
                      <p className="text-gray-400 text-sm">Away</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {match?.awayLogoUrl ? (
                        <img
                          src={correctedAwayLogoUrl}
                          alt={`${match?.awayName} logo`}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <Users
                        className="w-6 h-6 text-gray-400"
                        style={{
                          display: match?.awayLogoUrl ? "none" : "flex"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Match Info */}
                <div className="flex justify-between items-center text-sm text-gray-400">
                  {type === "live" && (
                    <>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Live Updates</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {Math.floor(Math.random() * 50) + 10}k watching
                        </span>
                      </div>
                    </>
                  )}
                  {type === "upcoming" && (
                    <>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Stadium TBA</span>
                      </div>
                      <div className="text-[#21A9A9] font-medium">
                        {getTimeUntilMatch(match?.matchTime_t)}
                      </div>
                    </>
                  )}
                </div>

                {/* Match Preview Image */}
                {match?.picture && (
                  <div className="mt-6 rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={match?.picture}
                      alt="Match preview"
                      className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.parentNode.style.display = "none";
                      }}
                    />
                  </div>
                )}
                {/* </a> */}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (showBlankPage) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Match Player
          </h2>
          <p className="text-gray-400 mb-8">Ready to watch the match</p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#21A9A9] mb-4"></div>
          <p className="text-gray-400">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <RefreshCw className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-red-400">
            Error Loading Matches
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchMatches}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black mt-[100px] border-[#999999] border-solid rounded-md border-[1px] min-h-screen">
      {/* Header */}
      <div className="mt-[-30px] p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white w-fit rounded-md py-1.5 px-3 bg-[#21A9A9] text-xl md:text-2xl font-bold">
            Football Matches
          </h1>
        </div>

        {/* Live Matches */}
        <MatchCarousel
          title="Live Matches"
          matches={matches}
          currentIndex={liveIndex}
          type="live"
        />

        {/* Upcoming Matches */}
        <MatchCarousel
          title="Upcoming Matches"
          matches={matches}
          currentIndex={upcomingIndex}
          type="upcoming"
        />

        {/* News Section */}
        <NewsCarousel
          title="Latest Football News"
          articles={news}
          currentIndex={newsIndex}
          type="news"
        />

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            Stay connected for more updates and live match coverage
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchPage;
