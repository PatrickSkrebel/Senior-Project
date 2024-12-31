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
    return <div>Loading...</div>;
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
        <h1>{team.name} Roster</h1>
        <img src={team.logo} alt={`${team.name} logo`} className="team-logo" />
        <table className="roster-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Position</th>
              <th>Birth Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.firstname} {player.lastname}</td>
                <td>{player.leagues?.standard?.pos || "N/A"}</td>
                <td>{player.birth.date || "N/A"}</td>
                <td>
                  <Link to={`/nba/players/playerstats/${player.id}`} className="details-link">
                    View Stats
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Roster;
