import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NBAHome from "./pages/NBA/Home";
import NFLHome from "./pages/NFL/Home";
import MLBHome from "./pages/MLB/Home";
import Profile from "./pages/User/profile";
import SignIn from "./pages/User/sign-in";
import SignUp from "./pages/User/sign-up";
import AuthProvider from "./providers/AuthProvider";
import ErrorBoundary from "./providers/ErrorBoundary";

import Standings from "./pages/NBA/Standings";
import LeagueLeaders from "./pages/NBA/LeagueLeaders";

const App = () => {
  return (
    <>
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Main Home Page screen to view all sports */}
          <Route path="/" element={<Home />} />

          {/* User Page screens */}
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/signup" element={<SignUp />} />
          <Route path="/user/signin" element={<SignIn />} />

          {/* Home page for each sport */}
          <Route path="/nba" element={<NBAHome />} />
          <Route path="/nfl" element={<NFLHome />} />
          <Route path="/mlb" element={<MLBHome />} />

          {/* All screens for NBA (Commented out for future implementation) */}
         
          <Route path="/nba/Standings" element={<Standings />} /> 
          <Route path="/nba/league-leaders" element={<LeagueLeaders />} />{/*
          <Route path="/nba/fantasy" element={<Fantasy />} />
          <Route path="/nba/games" element={<Games />} />
          <Route path="/nba/teams/:teamId" element={<Team />} />
          */}
        </Routes>
      </AuthProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;
