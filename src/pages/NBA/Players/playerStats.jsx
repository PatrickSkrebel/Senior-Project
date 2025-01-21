import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NBAHeader from "../../../components/nbaHeader";
import '../../../css/playerStats.css';
//import defaultIcon from "../../../assets/Present-icon.jpg";

const PlayerStats = () => {
  const { id } = useParams(); // Get player ID from the URL
  const [playerStats, setPlayerStats] = useState([]);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [gameDates, setGameDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [averages, setAverages] = useState({
    PPG: 0,
    APG: 0,
    RPG: 0,
  });

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        // Fetch player info
        const infoResponse = await axios.get(
          "https://api-nba-v1.p.rapidapi.com/players",
          {
            params: { id },
            headers: {
              "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
              "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
            },
          }
        );

        // Fetch player game stats
        const statsResponse = await axios.get(
          "https://api-nba-v1.p.rapidapi.com/players/statistics",
          {
            params: { id, season: "2024" },
            headers: {
              "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
              "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
            },
          }
        );

        const stats = statsResponse.data.response;


        // Extract unique game IDs from the stats
        const gameIds = [...new Set(stats.map((game) => game.game.id))];

        // Fetch game dates for each game ID
        const gameDatePromises = gameIds.map((gameId) =>
          axios
            .get("https://api-nba-v1.p.rapidapi.com/games", {
              params: { id: gameId },
              headers: {
                "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
                "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
              },
            })
            .then((response) => ({
              gameId,
              date: response.data.response[0]?.date.start,
            }))
        );

        const gameDateResults = await Promise.all(gameDatePromises);

        // Map game IDs to their dates
        const dateMap = gameDateResults.reduce((acc, { gameId, date }) => {
          acc[gameId] = date;
          return acc;
        }, {});

        // Calculate averages
        const totalGames = stats.length;
        const totalPoints = stats.reduce((sum, game) => sum + (game.points || 0), 0);
        const totalRebounds = stats.reduce((sum, game) => sum + (game.totReb || 0), 0);
        const totalAssists = stats.reduce((sum, game) => sum + (game.assists || 0), 0);

        const calculatedAverages = {
          PPG: totalGames ? (totalPoints / totalGames).toFixed(1) : 0,
          RPG: totalGames ? (totalRebounds / totalGames).toFixed(1) : 0,
          APG: totalGames ? (totalAssists / totalGames).toFixed(1) : 0,
        };

        setPlayerInfo(infoResponse.data.response[0]);
        setPlayerStats(stats);
        setGameDates(dateMap);
        setAverages(calculatedAverages);
      } catch (err) {
        console.error("Error fetching player data:", err.message);
        setError("Failed to load player data");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;


  return (
    <>
      <NBAHeader />
      <div className="player-stats-container">
        <div className="player-card-container">
          <div className="card">
            <div className="card-overlay"></div>
            <div className="card-inner">

            </div>
          </div>
          <div className="player-details">
            <div className="row">
              <div className="name-box">{`${playerInfo.firstname} ${playerInfo.lastname}`}</div>
            </div>
            <div className="row">
              <div className="info-box">
                <p>College</p>
                <p>{playerInfo.college || "N/A"}</p>
              </div>
              <div className="info-box">
                <p>Draft</p>
                <p>
                  {`${playerInfo.nba.start}`}                  
                </p>
                <p>
                  Pro: {playerInfo.nba.pro}
                </p>
              </div>
            </div>
            <div className="row">
              <div className="info-box">
                <p>PPG</p>
                <p>{averages.PPG}</p>
              </div>
              <div className="info-box">
                <p>APG</p>
                <p>{averages.APG}</p>
              </div>
              <div className="info-box">
                <p>RPG</p>
                <p>{averages.RPG}</p>
              </div>
            </div>


          </div>
        </div>


        <h2 className="game-stats-header">Game Statistics</h2>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Points</th>
              <th>Rebounds</th>
              <th>Assists</th>
              <th>Minutes</th>
            </tr>
          </thead>
          <tbody>
            {playerStats.length > 0 ? (
              playerStats.map((game, index) => {
                const gameDate = gameDates[game.game.id]
                  ? new Date(gameDates[game.game.id]).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "N/A";
                return (
                  <tr key={index}>
                    <td>{gameDate}</td>
                    <td>{game.points || 0}</td>
                    <td>{game.totReb || 0}</td>
                    <td>{game.assists || 0}</td>
                    <td>{game.min || "N/A"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5">No statistics available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PlayerStats;
