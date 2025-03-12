import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../../../css/rosterPage.css"; // Import CSS for styling
import NBAHeader from '../../../components/nbaHeader';

const Roster = () => {
  const { id } = useParams(); // Get team ID from the URL
  const [roster, setRoster] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRosterAndTeam = async () => {
      setLoading(true);
      try {
        // Fetch roster
        const rosterResponse = await axios.get(
          `https://api-nba-v1.p.rapidapi.com/players?team=${id}&season=2024`,
          {
            headers: {
              "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
              "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
            },
          }
        );

        // Fetch team details
        const teamResponse = await axios.get(
          `https://api-nba-v1.p.rapidapi.com/teams?id=${id}`,
          {
            headers: {
              "x-rapidapi-key": "836d6f1bc0msh79bf5504688036bp1ea845jsne6c16f734e02",
              "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
            },
          }
        );

        setRoster(rosterResponse.data.response);
        setTeam(teamResponse.data.response[0]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchRosterAndTeam();
  }, [id]);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!roster.length || !team) {
    return <div>No data found for this team.</div>;
  }

  return (
    <>
      <NBAHeader />
      <div className="roster-container">
      <Link to="/" className="back-button">
        Back to Teams
      </Link>
      <div className="header-banner">
        <h1><img src={team.logo} alt={`${team.name} logo`} className="team-logo" />{team.name} Roster</h1>
      </div>        
          <div className="player-grid">
                {roster.map((player, index) => (
                  <div className="player-card" key={player.id}>
                    <Link to={`/nba/players/playerstats/${player.id}`} className="details-link">
                    <h3>{player.firstname} {player.lastname}</h3>
                    <p><strong>Position:</strong> {player.leagues?.standard?.pos || "N/A"}</p>
                    <p><strong>Birth Date:</strong> {player.birth.date || "N/A"}</p>
                    </Link>
                  </div>
                ))}
          </div>
      </div>
    </>
  );
};

export default Roster;
