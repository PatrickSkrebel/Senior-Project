import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/nbaLeaders.css';
import NBAHeader from '../../components/nbaHeader';

export default function LeagueLeaders() {
  const [leaders, setLeaders] = useState([]); // Store leaders data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [selectedCategory, setSelectedCategory] = useState(''); // Selected category
  const [perMode, setPerMode] = useState('total'); // Selected "Per Mode"

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/nba-leaders?per_mode=${perMode}`
        );
        const categories = response.data.categories || [];
        setLeaders(categories);
        if (categories.length > 0) setSelectedCategory(categories[0].name); // Default to first category
        setLoading(false);
      } catch (err) {
        console.error('Error fetching NBA leaders:', err.message);
        setError('Failed to fetch NBA leaders');
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [perMode]); // Refetch data when "Per Mode" changes

  if (loading) return <p>Loading league leaders...</p>;
  if (error) return <p>{error}</p>;

  // Find the selected category data
  const selectedCategoryData = leaders.find((category) => category.name === selectedCategory);

  return (
    <>
      <NBAHeader />
      <div className="league-leaders-container">
        <h1 className="page-title">NBA League Leaders</h1>

        {/* Filters: Per Mode and Category */}
        <div className="filters-container">
          {/* Dropdown for selecting "Per Mode" */}
          <div className="filter">
            <label htmlFor="per-mode-select">Per Mode:</label>
            <select
              id="per-mode-select"
              value={perMode}
              onChange={(e) => setPerMode(e.target.value)}
              className="dropdown-select"
            >
              <option value="total">Totals</option>
            </select>
          </div>

          {/* Dropdown for selecting category */}
          <div className="filter">
            <label htmlFor="category-select">Category:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="dropdown-select"
            >
              {leaders.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display table for selected category */}
        {selectedCategoryData && (
          <div className="leader-category">
            <table className="leaders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>GP</th>
                  <th>MIN</th>
                  <th>PTS</th>
                  <th>FGM</th>
                  <th>FGA</th>
                  <th>FG%</th>
                  <th>3PM</th>
                  <th>3PA</th>
                  <th>3P%</th>
                  <th>FTM</th>
                  <th>FTA</th>
                  <th>FT%</th>
                  <th>OREB</th>
                  <th>DREB</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TOV</th>
                  <th>EFF</th>
                </tr>
              </thead>
              <tbody>
                {selectedCategoryData.ranks.map((player) => (
                  <tr key={`${player.player.id}-${selectedCategoryData.name}`}>
                    <td>{player.rank}</td>
                    <td>{player.player.full_name}</td>
                    <td>{player.teams.map((team) => team.market + ' ' + team.name).join(', ')}</td>
                    <td>{player[perMode].games_played}</td>
                    <td>{player[perMode].minutes}</td>
                    <td>{player[perMode].points}</td>
                    <td>{player[perMode].field_goals_made}</td>
                    <td>{player[perMode].field_goals_att}</td>
                    <td>{(player[perMode].field_goals_pct * 100).toFixed(1)}%</td>
                    <td>{player[perMode].three_points_made}</td>
                    <td>{player[perMode].three_points_att}</td>
                    <td>{(player[perMode].three_points_pct * 100).toFixed(1)}%</td>
                    <td>{player[perMode].free_throws_made}</td>
                    <td>{player[perMode].free_throws_att}</td>
                    <td>{(player[perMode].free_throws_pct * 100).toFixed(1)}%</td>
                    <td>{player[perMode].offensive_rebounds}</td>
                    <td>{player[perMode].defensive_rebounds}</td>
                    <td>{player[perMode].rebounds}</td>
                    <td>{player[perMode].assists}</td>
                    <td>{player[perMode].steals}</td>
                    <td>{player[perMode].blocks}</td>
                    <td>{player[perMode].turnovers}</td>
                    <td>{player[perMode].efficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
