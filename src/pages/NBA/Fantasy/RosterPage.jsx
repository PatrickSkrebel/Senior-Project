import React, { useState } from "react";
import NBAHeader from "../../../components/nbaHeader";

const TeamPage = () => {
  const [team, setTeam] = useState([
    {
      name: "Player 1",
      points: 25,
      rebounds: 10,
      assists: 5,
    },
    {
      name: "Player 2",
      points: 18,
      rebounds: 8,
      assists: 7,
    },
  ]);

  return (
    <>
    <NBAHeader />
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Your Team</h1>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Player</th>
            <th>Points</th>
            <th>Rebounds</th>
            <th>Assists</th>
          </tr>
        </thead>
        <tbody>
          {team.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.points}</td>
              <td>{player.rebounds}</td>
              <td>{player.assists}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default TeamPage;
