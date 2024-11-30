import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NBAHeader from "../../components/nbaHeader";
import '../../css/nbaStandings.css';

export default function NBAStandings() {
  const [teams, setTeams] = useState([]); // Flattened and sorted team data
  const [loading, setLoading] = useState(true);  // Tracks loading state
  const [error, setError] = useState('');        // Tracks any error messages
  const [view, setView] = useState('league');    // Tracks current view: league, conference, division
  const [filteredData, setFilteredData] = useState([]); // Holds filtered data for the selected view

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/nba-standings');

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

        setTeams({ all: sortedTeams, conferences: response.data.conferences });
        setFilteredData(sortedTeams); // Default to whole league
        setLoading(false);
      } catch (err) {
        console.error('Error fetching NBA standings:', err.message);
        setError('Failed to fetch NBA standings');
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  // Handle dropdown selection
  const handleViewChange = (selectedView) => {
    setView(selectedView);
    if (selectedView === 'league') {
      setFilteredData(teams.all);
    } else if (selectedView === 'conference') {
      setFilteredData(teams.conferences);
    } else if (selectedView === 'division') {
      setFilteredData(teams.conferences);
    }
  };

  if (loading) return <p className="loading-message">Loading standings...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <NBAHeader />
      <div className="standings-container">
        <h1 className="page-title">NBA Standings</h1>

        {/* Dropdown for selecting view */}
        <div className="dropdown">
          <label htmlFor="view-select">View by: </label>
          <select
            id="view-select"
            value={view}
            onChange={(e) => handleViewChange(e.target.value)}
          >
            <option value="league">Entire League</option>
            <option value="conference">Conference</option>
            <option value="division">Division</option>
          </select>
        </div>

        {/* Render data based on selected view */}
        {view === 'league' && (
          <table className="standings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Conference</th>
                <th>Division</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Win Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((team, index) => (
                <tr key={team.id}>
                  <td>{index + 1}</td>
                  <td>{team.name}</td>
                  <td>{team.conference}</td>
                  <td>{team.division}</td>
                  <td>{team.wins}</td>
                  <td>{team.losses}</td>
                  <td>{(team.winPercentage * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === 'conference' &&
          filteredData.map((conference) => (
            <div key={conference.id} className="conference">
              <h2>{conference.name}</h2>
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Wins</th>
                    <th>Losses</th>
                    <th>Win Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {conference.divisions.flatMap((division) =>
                    division.teams.map((team) => (
                      <tr key={team.id}>
                        <td>{team.market} {team.name}</td>
                        <td>{team.wins}</td>
                        <td>{team.losses}</td>
                        <td>{(team.wins / (team.wins + team.losses)).toFixed(3)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}

        {view === 'division' &&
          filteredData.map((conference) =>
            conference.divisions.map((division) => (
              <div key={division.id} className="division">
                <h2>{division.name} - {conference.name}</h2>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Wins</th>
                      <th>Losses</th>
                      <th>Win Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {division.teams.map((team) => (
                      <tr key={team.id}>
                        <td>{team.market} {team.name}</td>
                        <td>{team.wins}</td>
                        <td>{team.losses}</td>
                        <td>{(team.wins / (team.wins + team.losses)).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
      </div>
    </>
  );
}
