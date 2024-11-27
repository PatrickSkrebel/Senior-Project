import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function NBAStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStandings = async () => {
        try {
          console.log("Fetching NBA standings...");
          const response = await axios.get('/api/nba-standings'); // Vercel's API route
          console.log("Response Data:", response.data);
          setStandings(response.data.conferences || []); // Handle undefined conferences
          setLoading(false);
        } catch (err) {
          console.error("Error fetching NBA standings:", err.message);
          setError("Failed to fetch NBA standings");
          setLoading(false);
        }
      };
      

    fetchStandings();
  }, []);

  if (loading) {
    return <p>Loading standings...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>NBA Standings</h1>
      {standings.map((conference) => (
        <div key={conference.id} style={{ marginBottom: '20px' }}>
          <h2>{conference.name}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                division.teams.map((team) => {
                  const winPercentage = (team.wins / (team.wins + team.losses)).toFixed(3);
                  return (
                    <tr key={team.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {team.market} {team.name}
                      </td>
                      <td style={styles.tableCell}>{team.wins}</td>
                      <td style={styles.tableCell}>{team.losses}</td>
                      <td style={styles.tableCell}>{winPercentage}</td>
                    </tr>
                  );
                })
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
  tableRow: {
    backgroundColor: '#f9f9f9',
  },
};
