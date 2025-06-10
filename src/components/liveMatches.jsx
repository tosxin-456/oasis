import React, { useEffect, useState } from "react";
import {
  Clock,
  Zap,
  Square,
  Play,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Circle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye
} from "lucide-react";

const LiveSoccerDashboard = () => {
  // Matches state
  const [matches, setMatches] = useState([]);
  const [groupedMatches, setGroupedMatches] = useState({});
  const [collapsedLeagues, setCollapsedLeagues] = useState({});
  const [matchesLastUpdate, setMatchesLastUpdate] = useState(new Date());
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState(null);

  // News state
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch matches
  const fetchMatches = async () => {
    setMatchesLoading(true);
    setMatchesError(null);

    try {
      const response = await fetch(
        `https://dapiab.xdapiym5297.com/api/merge/schedules?d=afr.808ball2.com&_t=${Date.now()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const matchList = data.matchList || [];
      setMatches(matchList);

      const grouped = groupMatchesByLeague(matchList);
      setGroupedMatches(grouped);
      setMatchesLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatchesError("Failed to load matches. Please try again.");
    } finally {
      setMatchesLoading(false);
    }
  };

  // Fetch news
  const fetchNews = async () => {
    try {
      setNewsLoading(true);

      const response = await fetch(
        `https://newsapi.xdapiym5297.com/news/article/match/list?page=1&pageSize=21&sub=1`
      );

      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNews(data.items || []);
    } catch (err) {
      console.error("Error fetching news:", err);
      setNewsError("Failed to load news");
    } finally {
      setNewsLoading(false);
    }
  };

  const groupMatchesByLeague = (matchList) => {
    const grouped = {};

    matchList.forEach((match) => {
      const leagueKey = match.leagueEn || "Unknown League";
      const isLive = match.state === 1 || match.state === 3;
      const isUpcoming = match.state === 0;

      const groupKey = `${leagueKey}_${
        isLive ? "live" : isUpcoming ? "upcoming" : "other"
      }`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          leagueName: leagueKey,
          status: isLive ? "live" : isUpcoming ? "upcoming" : "other",
          matches: []
        };
      }

      grouped[groupKey].matches.push(match);
    });

    const sortedGroups = {};
    const sortOrder = ["live", "upcoming", "other"];

    Object.keys(grouped)
      .sort((a, b) => {
        const statusA = grouped[a].status;
        const statusB = grouped[b].status;
        const indexA = sortOrder.indexOf(statusA);
        const indexB = sortOrder.indexOf(statusB);

        if (indexA !== indexB) {
          return indexA - indexB;
        }

        return grouped[a].leagueName.localeCompare(grouped[b].leagueName);
      })
      .forEach((key) => {
        sortedGroups[key] = grouped[key];
      });

    return sortedGroups;
  };

  const toggleLeague = (leagueKey) => {
    setCollapsedLeagues((prev) => ({
      ...prev,
      [leagueKey]: !prev[leagueKey]
    }));
  };

  const scrollCarousel = (direction) => {
    const itemsPerView = isMobile ? 1 : 2;
    if (direction === "left") {
      setCurrentNewsIndex(Math.max(0, currentNewsIndex - itemsPerView));
    } else {
      setCurrentNewsIndex(
        Math.min(news.length - itemsPerView, currentNewsIndex + itemsPerView)
      );
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchNews();

    // Auto-refresh matches every 2 minutes
    const interval = setInterval(fetchMatches, 60000);

    return () => clearInterval(interval);
  }, []);

  const getMatchStatus = (state) => {
    switch (state) {
      case 0:
        return {
          text: "Upcoming",
          color: "text-blue-400",
          bgColor: "bg-blue-500/10"
        };
      case 1:
        return {
          text: "Live",
          color: "text-red-500",
          bgColor: "bg-red-500/10"
        };
      case 3:
        return {
          text: "Live",
          color: "text-green-400",
          bgColor: "bg-green-500/10"
        };
      default:
        return {
          text: "Unknown",
          color: "text-gray-400",
          bgColor: "bg-gray-500/10"
        };
    }
  };

  const getLeagueHeaderStyle = (status) => {
    switch (status) {
      case "live":
        return "bg-gradient-to-r from-red-600 to-red-700 text-white";
      case "upcoming":
        return "bg-gradient-to-r from-blue-600 to-blue-700 text-white";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-700 text-white";
    }
  };

  const formatMatchTime = (match) => {
    if (match.state === 0) {
      const matchDate = new Date(match.matchTime_t);
      return matchDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return match.remainTime || "Live";
  };

  const correctLogoUrl = (logoUrl) => {
    if (!logoUrl) return null;
    return logoUrl.replace(
      "http://zq.win007.com",
      "https://cfcdn.xdapiym5297.com/zqwin007"
    );
  };

  const handlePlayClick = (matchId, teamLink) => {
    const fullURL = `https://afr.808ball2.com/football/${matchId}-${teamLink}.html`;
    window.open(fullURL, "_blank");
  };

  const handleArticleClick = (matchId, teamLink) => {
    const fullURL = `https://afr.808ball2.com/football/${matchId}-${teamLink}.html`;
    window.open(fullURL, "_blank");
  };

  const handleNewsClick = (article) => {
    // Handle news click - could open article or track analytics
    console.log("News article clicked:", article.title);
  };

  const BlinkingIndicator = ({ isLive }) => {
    const [blink, setBlink] = useState(true);

    useEffect(() => {
      if (!isLive) return;

      const interval = setInterval(() => {
        setBlink((prev) => !prev);
      }, 1000);

      return () => clearInterval(interval);
    }, [isLive]);

    if (!isLive) return null;

    return (
      <div
        className={`w-2 h-2 bg-red-500 rounded-full transition-opacity duration-500 ${
          blink ? "opacity-100" : "opacity-30"
        }`}
      />
    );
  };

  const CardIndicator = ({ yellow, red }) => {
    if (yellow === 0 && red === 0) return null;

    return (
      <div className="flex gap-1 items-center text-xs">
        {yellow > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-sm"></div>
            <span className="text-yellow-400 font-medium">{yellow}</span>
          </div>
        )}
        {red > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
            <span className="text-red-500 font-medium">{red}</span>
          </div>
        )}
      </div>
    );
  };

  // News Carousel Component
  const NewsCarousel = () => {
    const itemsPerView = isMobile ? 1 : 4; // Changed from 2 to 4 for desktop
    const visibleArticles = news.slice(
      currentNewsIndex,
      currentNewsIndex + itemsPerView
    );
    const totalSlides = Math.ceil(news.length / itemsPerView);
    const currentSlide = Math.floor(currentNewsIndex / itemsPerView);
    const canScrollLeft = currentNewsIndex > 0;
    const canScrollRight = currentNewsIndex < news.length - itemsPerView;

    if (news.length === 0 && !newsLoading) {
      return (
        <div className="text-center text-gray-400 py-8">
          No news available at the moment.
        </div>
      );
    }

    if (newsLoading) {
      return (
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21A9A9] mx-auto mb-4"></div>
          Loading news articles...
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Latest News</h2>
          <div className="flex items-center gap-2 bg-black border border-[#333333] p-2 rounded">
            <button
              onClick={() => scrollCarousel("left")}
              disabled={!canScrollLeft}
              className={`p-1.5 bg-[#1F1F1F] transition-all duration-300 rounded ${
                canScrollLeft
                  ? "border border-gray-300 hover:border-[#333333] text-gray-300 hover:text-white hover:bg-[#333333]"
                  : "text-gray-500 cursor-not-allowed"
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-4 bg-teal-500"
                      : "w-1 bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollCarousel("right")}
              disabled={!canScrollRight}
              className={`p-1.5 bg-[#1F1F1F] transition-all duration-300 rounded ${
                canScrollRight
                  ? "border border-gray-300 hover:border-[#333333] text-gray-300 hover:text-white hover:bg-[#333333]"
                  : "text-gray-500 cursor-not-allowed"
              }`}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div
          className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-rows-4"}`} // Changed from grid-cols-1 to grid-cols-4 for desktop
        >
          {visibleArticles.map((article) => {
            const randomViews = Math.floor(Math.random() * 50) + 1;
            return (
              <div
                key={article.id}
                className="bg-[#1A1A1A] rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 border border-[#262626] hover:border-[#21A9A9] cursor-pointer group"
                onClick={() => handleNewsClick(article)}
              >
                <a
                  href={`https://www.808onlivetv.com/news/${article.id}/${article.articleLink}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative">
                    <img
                      src={`https://cfcdn.xdapiym5297.com/prod${article.imageUrl}`}
                      alt={article.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x200/1a1a1a/ffffff?text=News";
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#21A9A9] text-white px-2 py-1 rounded text-xs font-semibold">
                        TRENDING
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-black bg-opacity-70 rounded-full p-1.5">
                        <BookOpen className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-[#21A9A9] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{randomViews}k views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime || "5 min"}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (matchesError && newsError) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-white text-lg mb-2">Failed to Load Content</h2>
          <p className="text-gray-400 mb-4 text-sm">
            Unable to load matches and news
          </p>
          <button
            onClick={() => {
              fetchMatches();
              fetchNews();
            }}
            className="bg-[#21A9A9] hover:bg-[#1a8a8a] text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-black min-h-screen">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] sticky top-0 z-10">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                ⚽ <span className="hidden sm:inline">Football Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </h1>
              <p className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" />
                {matchesLastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  matchesLoading || newsLoading
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-[#21A9A9]/20 text-[#21A9A9]"
                }`}
              >
                <Zap
                  className={`w-3 h-3 ${
                    matchesLoading || newsLoading ? "animate-pulse" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {matchesLoading || newsLoading ? "Updating..." : "Live"}
                </span>
              </div>
              <button
                onClick={() => {
                  fetchMatches();
                  fetchNews();
                }}
                disabled={matchesLoading || newsLoading}
                className="bg-[#21A9A9] hover:bg-[#1a8a8a] disabled:opacity-50 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <Clock className="w-3 h-3" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-4 sm:px-4 sm:py-6">
        <div
          className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {/* Matches Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Live Matches</h2>
            {matchesLoading && matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-[#21A9A9] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Loading matches...</p>
              </div>
            ) : Object.keys(groupedMatches).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-4xl mb-4">📅</div>
                <h3 className="text-white text-lg mb-2">No Matches</h3>
                <p className="text-gray-400 text-sm">Check back later</p>
              </div>
            ) : (
              Object.entries(groupedMatches).map(([leagueKey, leagueData]) => (
                <div
                  key={leagueKey}
                  className="bg-[#1A1A1A] rounded-lg border border-[#262626] overflow-hidden"
                >
                  <div
                    className={`${getLeagueHeaderStyle(
                      leagueData.status
                    )} px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => toggleLeague(leagueKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <h3 className="font-semibold text-sm truncate">
                          {leagueData.leagueName}
                        </h3>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                          {leagueData.matches.length}
                        </span>
                        {leagueData.status === "live" && (
                          <BlinkingIndicator isLive={true} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {collapsedLeagues[leagueKey] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {!collapsedLeagues[leagueKey] && (
                    <div className="divide-y divide-[#333333]">
                      {leagueData.matches.slice(0, 3).map((match) => {
                        const isLive = match.state === 1 || match.state === 3;
                        const isUpcoming = match.state === 0;
                        const homeLogoUrl = correctLogoUrl(match.homeLogoUrl);
                        const awayLogoUrl = correctLogoUrl(match.awayLogoUrl);

                        return (
                          <div
                            key={match.matchId}
                            className="p-3 hover:bg-[#262626] transition-colors"
                          >
                            <div className="space-y-2">
                              <div className="grid grid-cols-5 gap-2 items-center">
                                <div className="col-span-2 flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 bg-[#333333] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {homeLogoUrl ? (
                                      <img
                                        src={homeLogoUrl}
                                        alt={match.homeName}
                                        className="w-4 h-4 object-contain"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="text-gray-400 text-xs font-bold">
                                        {match.homeName
                                          ?.slice(0, 2)
                                          .toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-white text-xs font-semibold truncate">
                                    {match.homeName}
                                  </span>
                                </div>

                                <div className="col-span-1 text-center">
                                  {!isUpcoming ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="text-sm font-bold text-white">
                                        {match.homeScore || 0}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        -
                                      </span>
                                      <span className="text-sm font-bold text-white">
                                        {match.awayScore || 0}
                                      </span>
                                    </div>
                                  ) : (
                                    <Calendar className="w-4 h-4 text-gray-400 mx-auto" />
                                  )}
                                </div>

                                <div className="col-span-2 flex items-center gap-2 min-w-0 flex-row-reverse">
                                  <div className="w-5 h-5 bg-[#333333] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {awayLogoUrl ? (
                                      <img
                                        src={awayLogoUrl}
                                        alt={match.awayName}
                                        className="w-4 h-4 object-contain"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="text-gray-400 text-xs font-bold">
                                        {match.awayName
                                          ?.slice(0, 2)
                                          .toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-white text-xs font-semibold truncate text-right">
                                    {match.awayName}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isLive && (
                                    <Circle className="w-2 h-2 text-red-500 fill-current" />
                                  )}
                                  <span
                                    className={`text-xs font-medium ${
                                      isLive ? "text-red-400" : "text-gray-400"
                                    }`}
                                  >
                                    {formatMatchTime(match)}
                                  </span>
                                </div>

                                <button
                                  onClick={() =>
                                    handlePlayClick(
                                      match.matchId,
                                      match.teamLink
                                    )
                                  }
                                  className="bg-[#21A9A9] hover:bg-[#1a8a8a] text-white px-2 py-1 rounded text-xs font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  Watch
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* News Section */}
          <div>
            <NewsCarousel />
          </div>
        </div>

        {/* Footer Stats */}
        {(matches.length > 0 || news.length > 0) && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-3 bg-[#1A1A1A] backdrop-blur-sm px-4 py-2 rounded-full border border-[#333333] text-xs">
              <div className="flex items-center gap-1 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>
                  {matches.filter((m) => m.state === 1 || m.state === 3).length}{" "}
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <Calendar className="w-3 h-3" />
                <span>
                  {matches.filter((m) => m.state === 0).length} Upcoming
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <BookOpen className="w-3 h-3" />
                <span>{news.length} News</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSoccerDashboard;
