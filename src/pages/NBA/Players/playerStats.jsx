import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NBAHeader from "../../../components/nbaHeader";

const PlayerStats = () => {
  const { id } = useParams(); // Get player ID from the URL
  const [playerStats, setPlayerStats] = useState([]);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [gameDates, setGameDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setPlayerInfo(infoResponse.data.response[0]);
        setPlayerStats(stats);
        setGameDates(dateMap);
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
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        {playerInfo && (
          <div style={{ marginBottom: "20px" }}>
            <h1>
              {playerInfo.firstname} {playerInfo.lastname}
            </h1>
            <p>
              <strong>Team:</strong>{" "}
              {playerInfo.team?.fullname || "Team information not available"}
            </p>
            <p>
              <strong>Position:</strong>{" "}
              {playerInfo.leagues?.standard?.pos || "Position not available"}
            </p>
          </div>
        )}
        <h2>Game Statistics</h2>
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Points</th>
              <th>Rebounds</th>
              <th>Assists</th>
              <th>Minutes Played</th>
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
                    <td>{game.points || "N/A"}</td>
                    <td>{game.totReb || "N/A"}</td>
                    <td>{game.assists || "N/A"}</td>
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
