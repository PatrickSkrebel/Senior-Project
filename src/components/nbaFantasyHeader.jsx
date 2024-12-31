import React from "react";
import { Link } from "react-router-dom";
import "../css/nbaFantasyHeader.css"; // Create a separate CSS file for styles if needed

const FantasyHeader = () => {
  return (
    <nav className="fantasy-header">
      <div className="logo">
        <Link to="/nba/fantasy/homepage">NBA Fantasy</Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/nba/fantasy/league">Create/Join League</Link>
        </li>
        <li>
          <Link to="/fantasy/teams">Teams</Link>
        </li>
        <li>
          <Link to="/fantasy/schedule">Schedule</Link>
        </li>
        <li>
          <Link to="/fantasy/standings">Standings</Link>
        </li>
        <li>
          <Link to="/fantasy/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
};

export default FantasyHeader;
