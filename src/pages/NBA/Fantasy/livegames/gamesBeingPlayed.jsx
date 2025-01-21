import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GamesBeingPlayed = () => {
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [team1TotalScore, setTeam1TotalScore] = useState(0);
  const [team2TotalScore, setTeam2TotalScore] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('https://api-nba-v1.p.rapidapi.com/players/statistics'); // Replace 'API_ENDPOINT' with your actual API endpoint
      const players = response.data;
      // Assuming the API returns an array of players, split them into two teams
      const half = Math.ceil(players.length / 2);
      setTeam1(players.slice(0, half));
      setTeam2(players.slice(half));
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const updateScore = () => {
    // ...existing code...
    updatedTeam[randomPlayerIndex].score = calculateScore(updatedTeam[randomPlayerIndex]);
    setTeam2(updatedTeam);

    const totalScore = updatedTeam.reduce((total, player) => total + player.score, 0);
    setTeam2TotalScore(totalScore);
    // ...existing code...
  };

  const resetGame = () => {
    fetchPlayers();
  };

  return (
    <div className="live-game-container">
      <h1>NBA Live Game Simulation</h1>
      <div className="teams">
        <div className="team">
          <h2>Team 1</h2>
          <h3>Total Score: {team1TotalScore.toFixed(2)}</h3>
          {team1.map((player, index) => (
            <div key={index} className="player">
              <p>{player.name}</p>
              <p>PTS: {player.stats.PTS}</p>
              <p>REB: {player.stats.REB}</p>
              <p>AST: {player.stats.AST}</p>
              <p>BLK: {player.stats.BLK}</p>
              <p>ST: {player.stats.ST}</p>
              <p>TO: {player.stats.TO}</p>
              <p>Score: {player.score.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="team">
          <h2>Team 2</h2>
          <h3>Total Score: {team2TotalScore.toFixed(2)}</h3>
          {team2.map((player, index) => (
            <div key={index} className="player">
              <p>{player.name}</p>
              <p>PTS: {player.stats.PTS}</p>
              <p>REB: {player.stats.REB}</p>
              <p>AST: {player.stats.AST}</p>
              <p>BLK: {player.stats.BLK}</p>
              <p>ST: {player.stats.ST}</p>
              <p>TO: {player.stats.TO}</p>
              <p>Score: {player.score.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamesBeingPlayed;