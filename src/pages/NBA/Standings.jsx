import React, { useEffect, useState } from "react";
import axios from "axios";
import NBAHeader from "../../components/nbaHeader";
import "../../css/nbaStandings.css";

export default function NBAStandings() {
  const [teams, setTeams] = useState({ league: [], conferences: {}, divisions: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("league");
  const [season, setSeason] = useState("2024");

  const fetchStandings = async (selectedSeason) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api-nba-v1.p.rapidapi.com/standings`,
        {
          params: {
            league: "standard",
            season: selectedSeason,
          },
          headers: {
            "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
            "x-rapidapi-key":
              "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02", // Replace with your actual RapidAPI key
          },
        }
      );

      const standings = response.data.response.map((team) => ({
        id: team.team.id,
        name: team.team.name,
        logo: team.team.logo,
        wins: team.win.total,
        losses: team.loss.total,
        winPercentage: parseFloat(team.win.percentage),
        conference: team.conference.name,
        division: team.division.name,
        gamesBehind: parseFloat(team.gamesBehind) || 0,
        streak: team.streak,
        winStreak: team.winStreak,
      }));

      // Organize data by conferences and divisions
      const conferences = standings.reduce((acc, team) => {
        const confName = team.conference;
        if (!acc[confName]) acc[confName] = [];
        acc[confName].push(team);
        return acc;
      }, {});

      const divisions = standings.reduce((acc, team) => {
        const divName = team.division;
        if (!acc[divName]) acc[divName] = [];
        acc[divName].push(team);
        return acc;
      }, {});

      setTeams({
        league: standings.sort((a, b) => b.winPercentage - a.winPercentage),
        conferences,
        divisions,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching NBA standings:", err.message);
      setError("Failed to fetch NBA standings");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings(season);
  }, [season]);

  const handleViewChange = (selectedView) => setView(selectedView);

  const handleSeasonChange = (e) => setSeason(e.target.value);

  if (loading) return <p className="loading-message">Loading standings...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <NBAHeader />
      <div className="standings-container">
        <h1 className="page-title">NBA Standings</h1>

        <div className="dropdown-container">
          <div className="dropdown">
            <label htmlFor="view-select" className="dropdown-label">
              View by:
            </label>
            <select
              id="view-select"
              value={view}
              onChange={(e) => handleViewChange(e.target.value)}
              className="dropdown-select"
            >
              <option value="league">Entire League</option>
              <option value="conference">Conferences</option>
              <option value="division">Divisions</option>
            </select>
          </div>
          <div className="dropdown">
            <label htmlFor="season-select" className="dropdown-label">
              Season:
            </label>
            <select
              id="season-select"
              value={season}
              onChange={handleSeasonChange}
              className="dropdown-select"
            >
              {Array.from({ length: 2024 - 2019 + 1 }, (_, i) => {
                const startYear = 2024 - i;
                const endYear = String(startYear + 1).slice(-2);
                return (
                  <option key={startYear} value={startYear}>
                    {startYear}-{endYear}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* League View */}
        {view === "league" && teams.league.length > 0 && (
          <table className="standings-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Win %</th>
                <th>Games Behind</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {teams.league.map((team, index) => (
                <tr key={team.id}>
                  <td>
                    {index + 1}
                    <img src={team.logo} className="team-logo" />
                    {team.name}
                  </td>
                  <td>{team.wins}</td>
                  <td>{team.losses}</td>
                  <td>{(team.winPercentage * 100).toFixed(1)}%</td>
                  <td>{team.gamesBehind.toFixed(1)}</td>
                  <td>
                    {team.winStreak ? `${team.streak} W` : `${team.streak} L`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Conference View */}
        {view === "conference" && Object.keys(teams.conferences).length > 0 && (
          <div>
            {Object.entries(teams.conferences).map(([confName, confTeams]) => (
              <div key={confName} className="conference-section">
                <h2>{confName.toUpperCase()} Conference</h2>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Wins</th>
                      <th>Losses</th>
                      <th>Win %</th>
                      <th>Games Behind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confTeams
                      .sort((a, b) => b.winPercentage - a.winPercentage)
                      .map((team, index) => (
                        <tr key={team.id}>
                          <td>
                            {index + 1}
                            <img src={team.logo} className="team-logo"/>
                            {team.name}
                          </td>
                          <td>{team.wins}</td>
                          <td>{team.losses}</td>
                          <td>{(team.winPercentage * 100).toFixed(1)}%</td>
                          <td>{team.gamesBehind.toFixed(1)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Division View */}
        {view === "division" && Object.keys(teams.divisions).length > 0 && (
          <div>
            {Object.entries(teams.divisions).map(([divName, divTeams]) => (
              <div key={divName} className="division-section">
                <h2>{divName.toUpperCase()} Division</h2>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Wins</th>
                      <th>Losses</th>
                      <th>Win %</th>
                      <th>Games Behind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divTeams
                      .sort((a, b) => b.winPercentage - a.winPercentage)
                      .map((team, index) => (
                        <tr key={team.id}>
                          <td>
                            {index + 1}
                            <img src={team.logo} className="team-logo"/>
                            {team.name}
                          </td>
                          <td>{team.wins}</td>
                          <td>{team.losses}</td>
                          <td>{(team.winPercentage * 100).toFixed(1)}%</td>
                          <td>{team.gamesBehind.toFixed(1)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
