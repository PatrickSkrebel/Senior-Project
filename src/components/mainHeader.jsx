// src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import '../css/mainHeader.css';

const Header = () => {
  return (
    <header className="header">
      <Link to="/">
        <div className="header__title">Statz</div>
      </Link>
      
      <nav className="header__nav">
        <Link to="/" className="header__link header__link--nfl">NFL</Link>
        <Link to="/" className="header__link header__link--mlb">MLB</Link>
        <Link to="/" className="header__link header__link--nba">NBA</Link>
      </nav>
      
      <div className="header__profile">
        <Link to="/user/signin">
          <FaUserCircle size={24} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
