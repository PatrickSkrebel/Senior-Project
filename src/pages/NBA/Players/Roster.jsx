import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import NBAHeader from "../../../components/nbaHeader";
import "../../../css/rosterPage.css"; // Import the newly updated CSS

const Roster = () => {
  const { id } = useParams();
  const [roster, setRoster] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRosterAndTeam = async () => {
      setLoading(true);
      try {
        // ... same data fetching logic ...
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
    return <div className="roster-page-loading-spinner"></div>;
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
      {/* Use our new class names below */}
      <div className="roster-page-container">
        <Link to="/" className="roster-page-back-button">
          Back to Teams
        </Link>
        <div className="roster-page-header-banner">
          <h1>
            <img
              src={team.logo}
              alt={`${team.name} logo`}
              className="roster-page-team-logo"
            />
            {team.name} Roster
          </h1>
        </div>
        <div className="roster-page-player-grid">
          {roster.map((player) => (
            <div className="roster-page-player-card" key={player.id}>
              <Link
                to={`/nba/players/playerstats/${player.id}`}
                className="roster-page-details-link"
              >
                <h3>
                  {player.firstname} {player.lastname}
                </h3>
                <p>
                  <strong>Position:</strong>{" "}
                  {player.leagues?.standard?.pos || "N/A"}
                </p>
                <p>
                  <strong>Birth Date:</strong> {player.birth?.date || "N/A"}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Roster;
