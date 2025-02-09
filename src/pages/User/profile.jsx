import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/mainHeader";
import "../../css/profile.css";
import { useAuth } from "../../providers/AuthProvider";
import { supabase } from "../../lib/supabaseClient";
import Preset from "../../assets/Present-Icon.jpg";
import Icon1 from "../../assets/Default-Icon1.png";
import Icon2 from "../../assets/Default-Icon2.png";

const defaultIcons = [Icon1, Icon2];

const Profile = () => {
  const { session, profile, loading, setProfile } = useAuth();
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userLeagues, setUserLeagues] = useState([]);

  // Fetch user profile
  useEffect(() => {
    console.log("Fetching profile...");
    const fetchProfile = async () => {
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [session, setProfile]);

  // Fetch user leagues (created and joined)
  const fetchUserLeagues = async () => {
    try {
      const userId = session.user.id;

      // Fetch leagues created by the user
      const { data: createdLeagues, error: createdLeaguesError } = await supabase
        .from("FantasyLeagues")
        .select("id, leagueName, leagueCode")
        .eq("user_id", userId);

      if (createdLeaguesError) throw createdLeaguesError;

      // Fetch leagues joined by the user
      const { data: joinedLeagues, error: joinedLeaguesError } = await supabase
        .from("FantasyLeague")
        .select("league_id")
        .eq("userId", userId);

      if (joinedLeaguesError) throw joinedLeaguesError;

      // Get full details of joined leagues
      const joinedLeagueIds = joinedLeagues.map((entry) => entry.league_id);
      const { data: joinedLeagueDetails, error: joinedLeagueDetailsError } = await supabase
        .from("FantasyLeagues")
        .select("id, leagueName, leagueCode")
        .in("id", joinedLeagueIds);

      if (joinedLeagueDetailsError) throw joinedLeagueDetailsError;

      // Combine created and joined leagues, removing duplicates
      const combinedLeagues = [
        ...createdLeagues,
        ...joinedLeagueDetails.filter(
          (joined) => !createdLeagues.some((created) => created.id === joined.id)
        ),
      ];

      setUserLeagues(combinedLeagues);
    } catch (err) {
      console.error("Error fetching user leagues:", err.message);
    }
  };


  useEffect(() => {
    if (session?.user?.id) {
      fetchUserLeagues();
    }
  }, [session]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/user/signin");
    }
  };

  const handleIconSelect = async (iconUrl) => {
    if (!profile) {
      console.error("Profile is null");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ user_icon: iconUrl })
      .eq("id", profile.id);

    if (error) {
      console.error("Error updating user icon:", error.message);
    } else {
      setIsPopupOpen(false);
    }
  };

  if (loading || !profile) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-container">
        {/* Profile Info Section */}
        <div className="profile-info">
          <div
            className="profile-avatar"
            onClick={() => setIsPopupOpen((prev) => !prev)}
          >
            <img
              src={profile.user_icon || Preset}
              alt="Profile Icon"
              className="avatar"
            />
          </div>
          <div className="profile-details">
            <div className="profile-item">{profile.username}</div>
            <div className="profile-item">
              Favorite Player: {profile.favorite_player || "Not set"}
            </div>
            <div className="profile-item">
              Favorite Team:{" "}
              {Array.isArray(profile.favorite_teams)
                ? profile.favorite_teams.join(", ")
                : "Not set"}
            </div>
          </div>
        </div>

        {/* Following Section */}
        <div className="profile-following">
          <span>Following: {profile.following_count || 0}</span>
          <span>Followers: {profile.follower_count || 0}</span>
        </div>

        {/* Stats Sections */}
        <div className="stats-container">
          <div className="stats-card">
            <h3>Player Stats</h3>
            <div className="stats-item"></div>
            <div className="stats-item"></div>
          </div>
          <div className="stats-card">
            <h3>Team Stats</h3>
            <div className="stats-item"></div>
            <div className="stats-item"></div>
          </div>
          <div className="stats-card">
            <h3>Fantasy Stats</h3>
            <div className="stats-item">
              {userLeagues.length > 0 ? (
                <div className="league-list">
                  {userLeagues.map((league) => (
                    <div key={league.leagueCode} className="league-item">
                      <Link
                        to={`/nba/fantasy/draft/${league.id}`}
                        className="league-name"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {league.leagueName}
                      </Link>
                      <span className="league-code">{league.leagueCode}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No leagues created yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="signout-container">
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
