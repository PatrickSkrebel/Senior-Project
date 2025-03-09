import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../../css/boxscore.css";
import NBAHeader from "../../../components/nbaHeader";

const BoxscorePage = () => {
  const { gameId } = useParams(); // Get the game ID from the URL
  const [gameDetails, setGameDetails] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch game details
  const fetchGameDetails = async () => {
    try {
      const response = await axios.get(
        "https://api-nba-v1.p.rapidapi.com/games",
        {
          params: { id: gameId },
          headers: {
            "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
            "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
          },
        }
      );

      if (response.data.response.length === 0) {
        throw new Error("Game not found");
      }

      setGameDetails(response.data.response[0]);
    } catch (err) {
      console.error("Failed to fetch game details:", err.message);
      setError("Failed to load game details. Please try again later.");
    }
  };

  // Fetch player stats for the game
  const fetchPlayerStats = async () => {
    try {
      const response = await axios.get(
        "https://api-nba-v1.p.rapidapi.com/players/statistics",
        {
          params: { game: gameId, season: "2024" },
          headers: {
            "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
            "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
          },
        }
      );

      setPlayerStats(response.data.response);
    } catch (err) {
      console.error("Failed to fetch player stats:", err.message);
      setError("Failed to load player stats. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchGameDetails();
      await fetchPlayerStats();
      setLoading(false);
    };

    fetchData();
  }, [gameId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!gameDetails) {
    return <div className="no-data">No game details available.</div>;
  }

  // Separate player stats by team
  const visitorTeamStats = playerStats.filter(
    (player) => player.team.id === gameDetails.teams.visitors.id
  );
  const homeTeamStats = playerStats.filter(
    (player) => player.team.id === gameDetails.teams.home.id
  );

  return (
    <>
    <NBAHeader />
    <div className="boxscore-page">
      <div className="game-header">
        <h1>Boxscore</h1>
        <h2>
          {gameDetails.teams.visitors.nickname} vs {gameDetails.teams.home.nickname}
        </h2>
        <p className="game-info">
          <span>Date: {new Date(gameDetails.date.start).toLocaleDateString()}</span>
          <span>Status: {gameDetails.status.long} ({gameDetails.status.short})</span>
          <span>
            Score: {gameDetails.scores.visitors.points} - {gameDetails.scores.home.points}
          </span>
        </p>
      </div>

      {/* Player Stats */}
      <div className="player-stats">
        <div className="stats-container">
          {/* Visitor Team Stats */}
          <div className="team-stats visitor">
            <h3>{gameDetails.teams.visitors.nickname}</h3>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TO</th>
                  <th>MIN</th>
                </tr>
              </thead>
              <tbody>
                {visitorTeamStats.map((player) => (
                  <tr key={player.player.id}>
                    <td>{player.player.firstname} {player.player.lastname}</td>
                    <td>{player.points || 0}</td>
                    <td>{player.totReb || 0}</td>
                    <td>{player.assists || 0}</td>
                    <td>{player.steals || 0}</td>
                    <td>{player.blocks || 0}</td>
                    <td>{player.turnovers || 0}</td>
                    <td>{player.min || "0:00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Home Team Stats */}
          <div className="team-stats home">
            <h3>{gameDetails.teams.home.nickname}</h3>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TO</th>
                  <th>MIN</th>
                </tr>
              </thead>
              <tbody>
                {homeTeamStats.map((player) => (
                  <tr key={player.player.id}>
                    <td>{player.player.firstname} {player.player.lastname}</td>
                    <td>{player.points || 0}</td>
                    <td>{player.totReb || 0}</td>
                    <td>{player.assists || 0}</td>
                    <td>{player.steals || 0}</td>
                    <td>{player.blocks || 0}</td>
                    <td>{player.turnovers || 0}</td>
                    <td>{player.min || "0:00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>

  );
};

export default BoxscorePage;