// src/components/NBAHeader.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../css/nbaHeader.css";

const NBAHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference to the dropdown

  const divisions = {
    Atlantic: [
      "Boston Celtics",
      "Brooklyn Nets",
      "New York Knicks",
      "Philadelphia 76ers",
      "Toronto Raptors",
    ],
    Central: [
      "Chicago Bulls",
      "Cleveland Cavaliers",
      "Detroit Pistons",
      "Indiana Pacers",
      "Milwaukee Bucks",
    ],
    Southeast: [
      "Atlanta Hawks",
      "Charlotte Hornets",
      "Miami Heat",
      "Orlando Magic",
      "Washington Wizards",
    ],
    Northwest: [
      "Denver Nuggets",
      "Minnesota Timberwolves",
      "Oklahoma City Thunder",
      "Portland Trail Blazers",
      "Utah Jazz",
    ],
    Pacific: [
      "Golden State Warriors",
      "LA Clippers",
      "Los Angeles Lakers",
      "Phoenix Suns",
      "Sacramento Kings",
    ],
    Southwest: [
      "Dallas Mavericks",
      "Houston Rockets",
      "Memphis Grizzlies",
      "New Orleans Pelicans",
      "San Antonio Spurs",
    ],
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <header className="nba-header">
      <div className="nba-header__title">
        <Link to="/" className="nba-header__title-link">Statz</Link> -{" "}
        <Link to="/nba" className="nba-header__title-link">NBA</Link>
      </div>
      <nav className="nba-header__nav">
        <Link to="/nba/standings" className="nba-header__link">Standings</Link>
        <Link to="/nba/league-leaders" className="nba-header__link">League Leaders</Link>
        <Link to="/nba/fantasy" className="nba-header__link">Fantasy</Link>
        <Link to="/nba/games" className="nba-header__link">Games</Link>
        <div className="nba-header__dropdown" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="nba-header__dropdown-button">
            Teams ▾
          </button>
          {dropdownOpen && (
            <div className="nba-header__dropdown-menu">
              {Object.entries(divisions).map(([division, teams]) => (
                <div key={division} className="nba-header__division">
                  <h4 className="nba-header__division-title">{division}</h4>
                  <ul className="nba-header__team-list">
                    {teams.map((team) => (
                      <li key={team} className="nba-header__dropdown-item">
                        <Link
                          to={`/nba/teams/${team.toLowerCase().replace(/\s+/g, "-")}`}
                          className="nba-header__dropdown-link"
                        >
                          {team}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="nba-header__profile">
        <Link to="/user/profile">
          <FaUserCircle size={24} />
        </Link>
      </div>
    </header>
  );
};

export default NBAHeader;
