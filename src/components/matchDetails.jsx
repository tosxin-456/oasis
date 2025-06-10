import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  MapPin,
  Thermometer,
  Trophy,
  User,
  UserMinus,
  UserPlus,
  RotateCcw
} from "lucide-react";
import { BiBall } from "react-icons/bi";
import { GiSoccerBall } from "react-icons/gi";
import { useParams } from "react-router-dom";

const FootballMatchTracker = () => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState({
    events: true,
    lineup: false,
    stats: false
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const API_URL = `https://cfapi.xdapiym5297.com/gated6a74ea91118d22af34db811e4a2b1d0ab0b97d2666a2e4576457db308/api/ftb/detail?d=ppdd02.dtfjinikdinbiframe.shop&lang=1&id=${id}`;

  const fetchMatchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setMatchData(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();
    const interval = setInterval(fetchMatchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getMatchStatus = (state) => {
    const statuses = {
      0: "Not Started",
      1: "First Half",
      2: "Half Time",
      3: "Full Time",
      4: "Extra Time",
      5: "Penalties"
    };
    return statuses[state] || "Unknown";
  };

  const getEventIcon = (kind) => {
    switch (kind) {
      case 3:
        return (
          <div className="w-4 h-6 bg-yellow-400 rounded-sm border border-yellow-500"></div>
        );
      case 4:
        return (
          <div className="w-4 h-6 bg-red-500 rounded-sm border border-red-600"></div>
        );
      case 1:
        return <GiSoccerBall className="text-[#a4a3c5]" />;
      case 7:
        return <GiSoccerBall className="text-[#a4a3c5]" />;
      case 11:
        return <UserPlus className="w-4 h-4 text-[#21A9A9]" />;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>;
    }
  };

  const getEventText = (kind) => {
    switch (kind) {
      case 3:
        return "Yellow Card";
      case 4:
        return "Red Card";
      case 1:
        return "Goal";
      case 7:
        return "Penalty Goal";
      case 11:
        return "Substitution";
      default:
        return "Event";
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const parseTechnicCount = (technicString) => {
    if (!technicString) return {};
    const parts = technicString.split(";");
    return {
      shots: parts[0]?.split(",") || [],
      possession: parts[6]?.split(",") || [],
      corners: parts[2]?.split(",") || [],
      fouls: parts[3]?.split(",") || [],
      offside: parts[4]?.split(",") || []
    };
  };

  if (loading && !matchData) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
            <div className="flex items-center justify-center h-32">
              <RotateCcw className="w-8 h-8 animate-spin text-[#21A9A9]" />
              <span className="ml-2 text-gray-300">Loading match data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6">
            <div className="text-center text-red-400">
              <p>Error: {error}</p>
              <button
                onClick={fetchMatchData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!matchData) return null;

  const { match, event = [], lineup, technicCount } = matchData;
  const stats = parseTechnicCount(technicCount);
  const correctedHomeLogoUrl = match?.homeLogoUrl.replace(
    "http://zq.win007.com",
    "https://cfcdn.xdapiym5297.com/zqwin007"
  );
//   console.log(matchData)
  const correctedAwayLogoUrl = match?.awayLogoUrl.replace(
    "http://zq.win007.com",
    "https://cfcdn.xdapiym5297.com/zqwin007"
  );

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] mb-6 overflow-hidden">
          <div className="bg-[#21A9A9] text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">{match?.leagueEn}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            </div>
            <div className="text-sm opacity-90">Season: {match?.season}</div>
          </div>

          {/* Score Section */}
          <div className="p-6 bg-[#1A1A1A]">
            <div className="flex items-center justify-between mb-4">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <img
                  src={correctedHomeLogoUrl}
                  alt={match?.homeName}
                  className="w-16 h-16 mx-auto mb-2"
                />
                <h2 className="text-xl font-bold text-white">
                  {match?.homeName}
                </h2>
              </div>

              {/* Score */}
              <div className="flex-1 text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {match?.homeScore} - {match?.awayScore}
                </div>
                {/* <div className="text-sm text-gray-400">
                  {getMatch?Status(match?.state)}
                </div> */}
                {match?.state !== 3 && (
                  <div className="text-xs text-gray-100 mt-1">
                    HT: {match?.homeHalfScore} - {match?.awayHalfScore}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <img
                  src={correctedAwayLogoUrl}
                  alt={match?.awayName}
                  className="w-16 h-16 mx-auto mb-2"
                />
                <h2 className="text-xl font-bold text-white">
                  {match?.awayName}
                </h2>
              </div>
            </div>

            {/* Match? Info */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 border-t border-[#333333] pt-4">
              {match?.weather && (
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-4 h-4" />
                  <span>{match?.weather}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(match?.startTime_t)}</span>
              </div>
              {match?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{match?.location}</span>
                </div>
              )}
            </div>

            {/* Cards Summary */}
            <div className="flex justify-center space-x-8 mt-4 pt-4 border-t border-[#333333]">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                  <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                </div>
                <div className="text-sm text-gray-300">
                  {match?.homeYellow} - {match?.homeRed}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                  <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                </div>
                <div className="text-sm text-gray-300">
                  {match?.awayYellow} - {match?.awayRed}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] mb-6">
          <button
            onClick={() => toggleSection("events")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#262626] transition-colors rounded-xl"
          >
            <h3 className="text-lg font-semibold text-white">Match Events</h3>
            {expandedSections.events ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.events && (
            <div className="p-4 border-t border-[#333333]">
              {event?.length > 0 ? (
                <div className="space-y-3">
                  {event?.map((evt) => (
                    <div
                      key={evt.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        evt.isHome
                          ? "bg-[#0D1B2A] border-blue-800"
                          : "bg-[#2A0D0D] border-red-800"
                      }`}
                    >
                      <div className="text-sm font-semibold w-8 text-[#21A9A9]">
                        {evt.time}'
                      </div>
                      <div className="flex-shrink-0">
                        {getEventIcon(evt.kind)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {evt.nameEn}
                        </div>
                        <div className="text-sm text-gray-400">
                          {getEventText(evt.kind)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {evt.isHome ? match.homeName : match.awayName}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No events recorded yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        {stats.shots && (
          <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] mb-6">
            <button
              onClick={() => toggleSection("stats")}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#262626] transition-colors rounded-xl"
            >
              <h3 className="text-lg font-semibold text-white">
                Match Statistics
              </h3>
              {expandedSections.stats ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.stats && (
              <div className="p-4 border-t border-[#333333] space-y-4">
                {stats.possession.length >= 3 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-gray-300">
                      <span>Possession</span>
                      <span>
                        {stats.possession[1]} - {stats.possession[2]}
                      </span>
                    </div>
                    <div className="w-full bg-[#333333] rounded-full h-2">
                      <div
                        className="bg-[#21A9A9] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.possession[1]}` }}
                      ></div>
                    </div>
                  </div>
                )}

                {stats.shots.length >= 3 && (
                  <div className="flex justify-between py-2 border-b border-[#333333] text-gray-300">
                    <span>Shots</span>
                    <span>
                      {stats.shots[1]} - {stats.shots[2]}
                    </span>
                  </div>
                )}

                {stats.corners.length >= 3 && (
                  <div className="flex justify-between py-2 border-b border-[#333333] text-gray-300">
                    <span>Corners</span>
                    <span>
                      {stats.corners[1]} - {stats.corners[2]}
                    </span>
                  </div>
                )}

                {stats.fouls.length >= 3 && (
                  <div className="flex justify-between py-2 border-b border-[#333333] text-gray-300">
                    <span>Fouls</span>
                    <span>
                      {stats.fouls[1]} - {stats.fouls[2]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lineup Section */}
        {lineup && (
          <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] mb-6">
            <button
              onClick={() => toggleSection("lineup")}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#262626] transition-colors rounded-xl"
            >
              <h3 className="text-lg font-semibold text-white">
                Starting Lineups
              </h3>
              {expandedSections.lineup ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.lineup && (
              <div className="p-4 border-t border-[#333333]">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Home Team Lineup */}
                  <div>
                    <h4 className="font-semibold mb-3 text-center text-white">
                      {match.homeName}
                    </h4>
                    <div className="text-xs text-gray-400 text-center mb-2">
                      Formation: {lineup.homeArray}
                    </div>
                    <div className="space-y-2">
                      {lineup.homeLineup?.map((player) => (
                        <div
                          key={player.playerId}
                          className="flex items-center space-x-2 p-2 bg-[#0D1B2A] border border-blue-800 rounded-lg"
                        >
                          <div className="w-6 h-6 bg-[#21A9A9] text-black rounded-full flex items-center justify-center text-xs font-bold">
                            {player.number}
                          </div>
                          <span className="text-sm text-white">
                            {player.nameEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Away Team Lineup */}
                  <div>
                    <h4 className="font-semibold mb-3 text-center text-white">
                      {match.awayName}
                    </h4>
                    <div className="text-xs text-gray-400 text-center mb-2">
                      Formation: {lineup.awayArray}
                    </div>
                    <div className="space-y-2">
                      {lineup.awayLineup?.map((player) => (
                        <div
                          key={player.playerId}
                          className="flex items-center space-x-2 p-2 bg-[#2A0D0D] border border-red-800 rounded-lg"
                        >
                          <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {player.number}
                          </div>
                          <span className="text-sm text-white">
                            {player.nameEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 bg-[#1A1A1A] rounded-xl border border-[#262626] p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 bg-[#21A9A9] rounded-full animate-pulse"></div>
            <span className="text-gray-300">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <span className="text-gray-400">
            Updates every second automatically
          </span>
        </div>
      </div>
    </div>
  );
};

export default FootballMatchTracker;
