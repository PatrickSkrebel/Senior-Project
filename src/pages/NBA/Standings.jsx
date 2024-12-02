import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NBAHeader from "../../components/nbaHeader";
import '../../css/nbaStandings.css';

export default function NBAStandings() {
  const [teams, setTeams] = useState([]); // Flattened and sorted team data
  const [loading, setLoading] = useState(true);  // Tracks loading state
  const [error, setError] = useState('');        // Tracks any error messages
  const [view, setView] = useState('league');    // Tracks current view: league, conference, division
  const [season, setSeason] = useState('2024'); 

  
  const fetchStandings = async (selectedSeason) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/nba-standings`);
      
      // Flatten all teams across divisions and conferences
      const allTeams = response.data.conferences.flatMap((conference) =>
        conference.divisions.flatMap((division) =>
          division.teams.map((team) => ({
            id: team.id,
            name: `${team.market} ${team.name}`,
            wins: team.wins,
            losses: team.losses,
            winPercentage: team.wins / (team.wins + team.losses),
            conference: conference.name,
            division: division.name,
          }))
        )
      );

      // Sort teams globally by win percentage (descending)
      const sortedTeams = allTeams.sort((a, b) => b.winPercentage - a.winPercentage);

      // Add conference and division groupings
      const conferences = response.data.conferences.map((conference) => ({
        ...conference,
        teams: conference.divisions.flatMap((division) =>
          division.teams.map((team) => ({
            ...team,
            winPercentage: team.wins / (team.wins + team.losses),
          }))
        ).sort((a, b) => b.winPercentage - a.winPercentage), // Sort within conference
      }));

      const divisions = response.data.conferences.flatMap((conference) =>
        conference.divisions.map((division) => ({
          ...division,
          teams: division.teams.map((team) => ({
            ...team,
            winPercentage: team.wins / (team.wins + team.losses),
          })).sort((a, b) => b.winPercentage - a.winPercentage), // Sort within division
        }))
      );

      setTeams({ league: sortedTeams, conferences, divisions });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching NBA standings:', err.message);
      setError('Failed to fetch NBA standings');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings(season);
  }, [season]); // Refetch standings when the season changes

  const handleViewChange = (selectedView) => {
    setView(selectedView);
  };

  const handleSeasonChange = (e) => {
    setSeason(e.target.value);
  };

  if (loading) return <p className="loading-message">Loading standings...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <NBAHeader />
      <div className="standings-container">
        <h1 className="page-title">NBA Standings</h1>

        {/* Dropdown for selecting view */}
        <div className="dropdown-container">
          {/* Dropdown for selecting view */}
          <div className="dropdown">
            <label htmlFor="view-select" className="dropdown-label">View by: </label>
            <select
              id="view-select"
              value={view}
              onChange={(e) => handleViewChange(e.target.value)}
              className="dropdown-select"
            >
              <option value="league">Entire League</option>
              <option value="conference">Conference</option>
              <option value="division">Division</option>
            </select>
          </div>

          {/* Dropdown for selecting season */}
          <div className="dropdown">
            <label htmlFor="season-select" className="dropdown-label">Season: </label>
            <select
              id="season-select"
              value={season}
              onChange={handleSeasonChange}
              className="dropdown-select"
            >
              {/* Generate dropdown options dynamically */}
              {Array.from({ length: 2024 - 2013 + 1 }, (_, i) => {
                const startYear = 2024 - i;
                const endYear = String(startYear + 1).slice(-2); // Get last 2 digits of the next year
                return (
                  <option key={startYear} value={startYear}>
                    {startYear}-{endYear}
                  </option>
                );
              })}
            </select>
          </div>
        </div>




        {/* Render League View */}
        {view === 'league' && (
          <table className="standings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Win Percentage</th>
                <th>GB</th>
              </tr>
            </thead>
            <tbody>
              {teams.league.map((team, index, array) => {
                const topTeam = array[0]; // Top-ranked team
                const gamesBehind = ((topTeam.wins - team.wins) + (team.losses - topTeam.losses)) / 2;

                return (
                  <tr key={team.id}>
                    <td>{index + 1}</td>
                    <td>{team.name}</td>
                    <td>{team.wins}</td>
                    <td>{team.losses}</td>
                    <td>{(team.winPercentage * 100).toFixed(1)}%</td>
                    <td>{index === 0 ? "0.0" : gamesBehind.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Render Conference View */}
        {view === 'conference' &&
          teams.conferences.map((conference) => (
            <div key={conference.id} className="conference">
              <h2>{conference.name}</h2>
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Win Percentage</th>
                    <th>GB</th>
                  </tr>
                </thead>
                <tbody>
                  {conference.teams.map((team, index, array) => {
                    const topTeam = array[0]; // Top-ranked team in conference
                    const gamesBehind = ((topTeam.wins - team.wins) + (team.losses - topTeam.losses)) / 2;

                    return (
                      <tr key={team.id}>
                        <td>{index + 1}</td>
                        <td>{team.market} {team.name}</td>
                        <td>{team.wins}</td>
                        <td>{team.losses}</td>
                        <td>{(team.winPercentage * 100).toFixed(1)}%</td>
                        <td>{index === 0 ? "0.0" : gamesBehind.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

        {/* Render Division View */}
        {view === 'division' &&
          teams.divisions.map((division) => (
            <div key={division.id} className="division">
              <h2>{division.name} Division</h2>
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Win Percentage</th>
                    <th>GB</th>
                  </tr>
                </thead>
                <tbody>
                  {division.teams.map((team, index, array) => {
                    const topTeam = array[0]; // Top-ranked team in division
                    const gamesBehind = ((topTeam.wins - team.wins) + (team.losses - topTeam.losses)) / 2;

                    return (
                      <tr key={team.id}>
                        <td>{index + 1}</td>
                        <td>{team.market} {team.name}</td>
                        <td>{team.wins}</td>
                        <td>{team.losses}</td>
                        <td>{(team.winPercentage * 100).toFixed(1)}%</td>
                        <td>{index === 0 ? "0.0" : gamesBehind.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </>
  );
}
