import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NBAHeader from "../../components/nbaHeader";

export default function NBAStandings() {
  const [standings, setStandings] = useState([]); // Holds standings data
  const [loading, setLoading] = useState(true);  // Tracks loading state
  const [error, setError] = useState('');        // Tracks any error messages

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/nba-standings');

        setStandings(response.data.conferences || []); // Extract conferences data
        setLoading(false);
      } catch (err) {
        console.error('Error fetching NBA standings:', err.message);
        setError('Failed to fetch NBA standings');
        setLoading(false);
      }
    };

    fetchStandings();
  }, []); // Run once on component mount

  if (loading) return <p>Loading standings...</p>; // Display while loading
  if (error) return <p>{error}</p>;               // Display error message if fetch fails

  return (
    <div>
      <NBAHeader />
      <h1>NBA Standings</h1>
      {standings.map((conference) => (
        <div key={conference.id}>
          <h2>{conference.name}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Team</th>
                <th style={styles.tableHeader}>Wins</th>
                <th style={styles.tableHeader}>Losses</th>
                <th style={styles.tableHeader}>Win Percentage</th>
              </tr>
            </thead>
            <tbody>
              {conference.divisions.map((division) =>
                division.teams.map((team) => (
                  <tr key={team.id}>
                    <td style={styles.tableCell}>
                      {team.market} {team.name}
                    </td>
                    <td style={styles.tableCell}>{team.wins}</td>
                    <td style={styles.tableCell}>{team.losses}</td>
                    <td style={styles.tableCell}>{(team.wins / (team.wins + team.losses)).toFixed(3)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

const styles = {
  tableHeader: {
    borderBottom: '2px solid black',
    padding: '10px',
    textAlign: 'left',
  },
  tableCell: {
    borderBottom: '1px solid #ccc',
    padding: '10px',
  },
};
