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
  Calendar,
  Play,
  Users
} from "lucide-react";

// Using football-data.org API (free tier)
const API_KEY = "5f2b903dcfd8475389072953dcd93f98";
const API_BASE = "https://api.football-data.org/v4";
const YOUTUBE_API_KEY = "AIzaSyBk5urSNPHmk0QbiBbsNnpp-pateaPwuCU";

const FootballPage = () => {
  const [liveGames, setLiveGames] = useState([]);
  const [matchHighlights, setMatchHighlights] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [liveIndex, setLiveIndex] = useState(0);
  const [highlightsIndex, setHighlightsIndex] = useState(0);
  const [upcomingIndex, setUpcomingIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightsLoading, setHighlightsLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDateString = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split("T")[0];
  };

  const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Fetch attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  const fetchYouTubeHighlights = async (homeTeam, awayTeam, matchDate) => {
    try {
      const query = `${homeTeam.name} vs ${awayTeam.name} highlights`;
      const youtubeRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=video&order=relevance&maxResults=1&key=${YOUTUBE_API_KEY}`
      );

      if (!youtubeRes.ok) {
        throw new Error(`YouTube API error: ${youtubeRes.status}`);
      }

      const data = await youtubeRes.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error("Error fetching YouTube highlights:", error);
      return null;
    }
  };

  const fetchHighlightsWithYouTube = async (matches) => {
    setHighlightsLoading(true);
    const highlightsWithYouTube = [];

    // Process matches in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < Math.min(matches.length, 15); i += batchSize) {
      const batch = matches.slice(i, i + batchSize);
      const batchPromises = batch.map(async (match) => {
        const youtubeData = await fetchYouTubeHighlights(
          match.homeTeam,
          match.awayTeam,
          match.utcDate
        );

        return {
          ...match,
          youtube: youtubeData,
          views: Math.floor(Math.random() * 200000) + 50000,
          thumbnail:
            youtubeData?.snippet?.thumbnails?.medium?.url ||
            youtubeData?.snippet?.thumbnails?.default?.url ||
            `https://via.placeholder.com/320x180/1a1a1a/ffffff?text=${match.homeTeam.name.charAt(
              0
            )}v${match.awayTeam.name.charAt(0)}`
        };
      });

      const batchResults = await Promise.all(batchPromises);
      highlightsWithYouTube.push(...batchResults);

      // Add small delay between batches
      if (i + batchSize < matches.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setHighlightsLoading(false);
    return highlightsWithYouTube;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = {
          "X-Auth-Token": API_KEY,
          "Content-Type": "application/json"
        };

        // Fetch live matches
        try {
          const liveData = await fetchWithRetry(
            `${API_BASE}/matches?status=LIVE`,
            { headers }
          );
          setLiveGames(liveData.matches || []);
        } catch (err) {
          console.error("Error fetching live matches:", err);
          setLiveGames([]);
        }

        // Fetch finished matches for highlights (last 7 days)
        try {
          const finishedData = await fetchWithRetry(
            `${API_BASE}/matches?status=FINISHED&dateFrom=${getDateString(
              -7
            )}&dateTo=${getDateString(0)}`,
            { headers }
          );

          const recentMatches = (finishedData.matches || []).slice(0, 15);
          if (recentMatches.length > 0) {
            const highlightsWithYouTube = await fetchHighlightsWithYouTube(
              recentMatches
            );
            setMatchHighlights(highlightsWithYouTube);
          } else {
            setMatchHighlights([]);
          }
        } catch (err) {
          console.error("Error fetching finished matches:", err);
          setMatchHighlights([]);
        }

        // Fetch upcoming matches (next 7 days)
        try {
          const upcomingData = await fetchWithRetry(
            `${API_BASE}/matches?status=SCHEDULED&dateFrom=${getDateString(
              0
            )}&dateTo=${getDateString(7)}`,
            { headers }
          );
          setUpcomingMatches(upcomingData.matches?.slice(0, 20) || []);
        } catch (err) {
          console.error("Error fetching upcoming matches:", err);
          setUpcomingMatches([]);
        }
      } catch (error) {
        console.error("Error fetching football data:", error);
        setError("Failed to load football data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up interval to refresh live matches every 30 seconds
    const interval = setInterval(() => {
      if (liveGames.length > 0) {
        fetchAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatMatchTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTimeUntilMatch = (dateString) => {
    const matchDate = new Date(dateString);
    const now = new Date();
    const diffMs = matchDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return "Soon";
  };

  const scrollCarousel = (direction, type) => {
    const itemsPerView = isMobile ? 2 : 5;
    let maxIndex, currentIndex, setIndex, dataLength;

    if (type === "live") {
      dataLength = liveGames.length;
      currentIndex = liveIndex;
      setIndex = setLiveIndex;
    } else if (type === "highlights") {
      dataLength = matchHighlights.length;
      currentIndex = highlightsIndex;
      setIndex = setHighlightsIndex;
    } else {
      dataLength = upcomingMatches.length;
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

  const handleHighlightClick = (match) => {
    if (match.youtube?.id?.videoId) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${match.youtube.id.videoId}`;
      window.open(youtubeUrl, "_blank");
    }
  };

  const MatchCarousel = ({ title, matches, currentIndex, type }) => {
    const itemsPerView = isMobile ? 2 : 5;
    const visibleMatches = matches.slice(
      currentIndex,
      currentIndex + itemsPerView
    );
    const totalSlides = Math.ceil(matches.length / itemsPerView);
    const currentSlide = Math.floor(currentIndex / itemsPerView);
    const canScrollLeft = currentIndex > 0;
    const canScrollRight = currentIndex < matches.length - itemsPerView;

    if (matches.length === 0 && !highlightsLoading) {
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

    if (type === "highlights" && highlightsLoading) {
      return (
        <div className="mb-12">
          <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold text-white mb-6">
            {title}
          </h2>
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21A9A9] mx-auto mb-4"></div>
            Loading YouTube highlights...
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
          className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-5"}`}
        >
          {visibleMatches.map((match) => (
            <div
              key={match.id}
              className={`bg-[#1A1A1A] rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 border border-[#262626] hover:border-[#21A9A9] relative group ${
                type === "highlights" ? "cursor-pointer" : ""
              }`}
              onClick={() =>
                type === "highlights" && handleHighlightClick(match)
              }
            >
              {/* YouTube Thumbnail for highlights */}
              {type === "highlights" && match.thumbnail && (
                <div className="relative">
                  <img
                    src={match.thumbnail}
                    alt={`${match.homeTeam?.name} vs ${match.awayTeam?.name} highlights`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/320x180/1a1a1a/ffffff?text=${
                        match.homeTeam?.name?.charAt(0) || "H"
                      }v${match.awayTeam?.name?.charAt(0) || "A"}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                    <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  {match.youtube?.snippet?.title && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs bg-black bg-opacity-70 rounded px-2 py-1 line-clamp-2">
                        {match.youtube.snippet.title}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4">
                {/* Match Status Badge */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-[#999999] bg-[#333333] px-2 py-1 rounded">
                    {match.competition?.name || "Unknown"}
                  </span>
                  {type === "live" && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-500 font-semibold">
                        {match.status === "IN_PLAY" ? "LIVE" : match.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Teams */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        match.homeTeam?.crest ||
                        `https://via.placeholder.com/24x24/333333/FFFFFF?text=${
                          match.homeTeam?.name?.charAt(0) || "H"
                        }`
                      }
                      alt={match.homeTeam?.name || "Home Team"}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/24x24/333333/FFFFFF?text=${
                          match.homeTeam?.name?.charAt(0) || "H"
                        }`;
                      }}
                    />
                    <span className="text-white text-sm font-medium flex-1 truncate">
                      {match.homeTeam?.name || "Home Team"}
                    </span>
                    {match.score?.fullTime && (
                      <span className="text-white font-bold text-lg">
                        {match.score.fullTime.home ?? "-"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={
                        match.awayTeam?.crest ||
                        `https://via.placeholder.com/24x24/333333/FFFFFF?text=${
                          match.awayTeam?.name?.charAt(0) || "A"
                        }`
                      }
                      alt={match.awayTeam?.name || "Away Team"}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/24x24/333333/FFFFFF?text=${
                          match.awayTeam?.name?.charAt(0) || "A"
                        }`;
                      }}
                    />
                    <span className="text-white text-sm font-medium flex-1 truncate">
                      {match.awayTeam?.name || "Away Team"}
                    </span>
                    {match.score?.fullTime && (
                      <span className="text-white font-bold text-lg">
                        {match.score.fullTime.away ?? "-"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Info */}
                {type === "live" && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{match.minute || 0}'</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 50) + 10}k</span>
                    </div>
                  </div>
                )}

                {type === "highlights" && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{Math.floor(match.views / 1000)}k views</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <Play className="w-4 h-4" />
                      <span>Watch</span>
                    </div>
                  </div>
                )}

                {type === "upcoming" && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatMatchTime(match.utcDate)}</span>
                    </div>
                    <div className="text-teal-400 font-medium">
                      {getTimeUntilMatch(match.utcDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21A9A9] mx-auto mb-4"></div>
          <p>Loading football matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#21A9A9] text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-md border-[#999999] border-solid border-[1px] min-h-screen">
      {/* Header */}
      <div className="mt-[-30px] p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white w-fit rounded-md py-1.5 px-3 bg-[#21A9A9] text-xl md:text-2xl font-bold">
            Football
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Live Games */}
        <MatchCarousel
          title="Trending Live Games"
          matches={liveGames}
          currentIndex={liveIndex}
          type="live"
        />

        {/* Match Highlights */}
        <MatchCarousel
          title="Match Highlights"
          matches={matchHighlights}
          currentIndex={highlightsIndex}
          type="highlights"
        />

        {/* Upcoming Matches */}
        <MatchCarousel
          title="Upcoming Matches"
          matches={upcomingMatches}
          currentIndex={upcomingIndex}
          type="upcoming"
        />
      </div>
    </div>
  );
};

export default FootballPage;
