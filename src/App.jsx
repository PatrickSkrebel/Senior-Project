import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NBAHome from "./pages/NBA/Home";
import Profile from "./pages/User/profile";
import SignIn from "./pages/User/sign-in";
import SignUp from "./pages/User/sign-up";
import AuthProvider from "./providers/AuthProvider";
import ErrorBoundary from "./providers/ErrorBoundary";

import Boxscore from "./pages/NBA/Players/boxscores";

// Common nba pages
import Standings from "./pages/NBA/Standings";
import LeagueLeaders from "./pages/NBA/LeagueLeaders";

// Player pages
import Roster from './pages/NBA/Players/Roster';
import PlayerStats from './pages/NBA/Players/playerStats';

// Fantasy pages
import Fantasy from './pages/NBA/Fantasy/HomePage';
import League from './pages/NBA/Fantasy/League';
import FantasyRoster from './pages/NBA/Fantasy/RosterPage';
import DraftScreen from './pages/NBA/Fantasy/Draft';
import LeagueHome from './pages/NBA/Fantasy/LeagueHome';

// Test
import Test from './pages/NBA/Fantasy/livegames/gamesBeingPlayed';
import Excel from './pages/Test';

const App = () => {
  return (
    <>
    <AuthProvider>
    <ErrorBoundary>
        <Routes>
          {/* Main Home Page screen to view all sports */}

          {/* User Page screens */}
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/signup" element={<SignUp />} />
          <Route path="/user/signin" element={<SignIn />} />

          {/* Home page for each sport */}
          <Route path="/" element={<NBAHome />} />
          <Route path="/nba/boxscore/:gameId" element={<Boxscore />} />

          {/* All screens for NBA (Commented out for future implementation) */}
         
          <Route path="/nba/Standings" element={<Standings />} /> 
          <Route path="/nba/league-leaders" element={<LeagueLeaders />} />

          <Route path="/nba/fantasy/HomePage" element={<Fantasy />} />
          <Route path="/nba/fantasy/league" element={<League />} />
          <Route path="/nba/fantasy/rosterpage" element={<FantasyRoster />} />
          <Route path="nba/fantasy/draft/:leagueId" element={<DraftScreen />} />
          <Route path="/nba/fantasy/leagueHome/:leagueId" element={<LeagueHome />} />

          <Route path="/nba/players/roster/:id" element={<Roster />}/>
          <Route path="/nba/players/playerStats/:id" element={<PlayerStats />}/>


          <Route path="/test" element={<Test />} />
          <Route path="/excel" element={<Excel />} />


          { /* All screens for NFL */}

          
        </Routes>
      </ErrorBoundary>
      </AuthProvider>
    </>
  );
};

export default App;
