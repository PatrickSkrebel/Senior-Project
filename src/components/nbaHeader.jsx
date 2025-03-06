// src/components/NBAHeader.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../css/nbaHeader.css";

const NBAHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference to the dropdown

  const teamIdMap = {
    "Atlanta Hawks": 1,
    "Boston Celtics": 2,
    "Brooklyn Nets": 4,
    "Charlotte Hornets": 5,
    "Chicago Bulls": 6,
    "Cleveland Cavaliers": 7,
    "Dallas Mavericks": 8,
    "Denver Nuggets": 9,
    "Detroit Pistons": 10,
    "Golden State Warriors": 11,
    "Houston Rockets": 14,
    "Indiana Pacers": 15,
    "LA Clippers": 16,
    "Los Angeles Lakers": 17,
    "Memphis Grizzlies": 19,
    "Miami Heat": 20,
    "Milwaukee Bucks": 21,
    "Minnesota Timberwolves": 22,
    "New Orleans Pelicans": 23,
    "New York Knicks": 24,
    "Oklahoma City Thunder": 25,
    "Orlando Magic": 26,
    "Philadelphia 76ers": 27,
    "Phoenix Suns": 28,
    "Portland Trail Blazers": 29,
    "Sacramento Kings": 30,
    "San Antonio Spurs": 31,
    "Toronto Raptors": 38,
    "Utah Jazz": 40,
    "Washington Wizards": 41,
  };
  

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
        <Link to="/" className="nba-header__title-link">Statz</Link>
      </div>
      <nav className="nba-header__nav">
        <Link to="/nba/standings" className="nba-header__link">Standings</Link>
        <Link to="/nba/league-leaders" className="nba-header__link">League Leaders</Link>
        <Link to="/nba/fantasy/league" className="nba-header__link">Fantasy</Link>
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
                  {teams.map((team) => {
                    const teamId = teamIdMap[team]; // Get the correct team ID from the map
                    return (
                      <li key={team} className="nba-header__dropdown-item">
                        <Link
                          to={`/nba/Players/Roster/${teamId}`}
                          className="nba-header__dropdown-link"
                        >
                          {team}
                        </Link>
                      </li>
                    );
                  })}

                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="header__profile">
        <Link to="/user/signin">
          <FaUserCircle size={24} />
        </Link>
      </div>
    </header>
  );
};

export default NBAHeader;
