import React, { useEffect, useState } from "react";
import axios from "axios";
import NBAHeader from "../../components/nbaHeader";

const Fantasy = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playerInfo, setPlayerInfo] = useState(null);

  // Player Game Stats
  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        const response = await axios.get(
          "https://api-nba-v1.p.rapidapi.com/players/statistics",
          {
            params: {
              id: "236",
              season: "2024",
            },
            headers: {
              "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
              "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
            },
          }
        );

        setData(response.data.response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching game stats:", err.message);
        setError("Failed to load game statistics");
        setLoading(false);
      }
    };

    fetchGameStats();
  }, []);

  // Player Info
  useEffect(() => {
    const fetchPlayerInfo = async () => {
      try {
        const response = await axios.get(
          "https://api-nba-v1.p.rapidapi.com/players",
          {
            params: {
              id: "236",
              team: "30",
              season: "2024",
            },
            headers: {
              "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
              "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
            },
          }
        );

        setPlayerInfo(response.data.response[0]); // Assuming the response is an array with the player's info
        console.log(response.data.response[1])
      } catch (err) {
        console.error("Error fetching player info:", err.message);
        setError("Failed to load player information");
      }
    };

    fetchPlayerInfo();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <NBAHeader />
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Player Statistics</h1>
        {playerInfo && (
          <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px", borderRadius: "10px" }}>
            <h2>
              {playerInfo.firstname} {playerInfo.lastname}
            </h2>
            <p>
              <strong>Team:</strong> {playerInfo.team.fullname}
            </p>
            <p>
              <strong>Position:</strong> {playerInfo.leagues.standard.pos}
            </p>
            <p>
              <strong>Height:</strong> {playerInfo.height.feets || "N/A"}' {playerInfo.height.inches || "N/A"}"
            </p>
            <p>
              <strong>Weight:</strong> {playerInfo.weight.pounds || "N/A"} lbs
            </p>
          </div>
        )}
        <h2>Player Stats</h2>
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Game ID</th>
              <th>Points</th>
              <th>Position</th>
              <th>Minutes Played</th>
              <th>Field Goals (Made/Attempted)</th>
              <th>3PT (Made/Attempted)</th>
              <th>Total Rebounds</th>
              <th>Assists</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {data.map((game, index) => (
              <tr key={index}>
                <td>{game.game.id}</td>
                <td>{game.points}</td>
                <td>{game.pos}</td>
                <td>{game.min}</td>
                <td>
                  {game.fgm}/{game.fga} ({game.fgp}%)
                </td>
                <td>
                  {game.tpm}/{game.tpa} ({game.tpp}%)
                </td>
                <td>{game.totReb}</td>
                <td>{game.assists}</td>
                <td>
                  <img
                    src={game.team.logo}
                    alt={`${game.team.name} logo`}
                    style={{ width: "30px", verticalAlign: "middle", marginRight: "10px" }}
                  />
                  {game.team.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Fantasy;
