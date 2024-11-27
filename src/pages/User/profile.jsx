import React, { useEffect, useState } from 'react';
import Header from '../../components/mainHeader';
import '../../css/profile.css';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Preset from '../../assets/Present-Icon.jpg';
import Icon1 from '../../assets/Default-Icon1.png';
import Icon2 from '../../assets/Default-Icon2.png';

const defaultIcons = [Icon1, Icon2]; // Replace with actual paths to your default icons

const Profile = () => {
  const { session, profile, loading, setProfile } = useAuth(); // Assuming setProfile is exposed in your AuthProvider
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup state

  // Refetch the profile after signing up or if the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
        } else {
          setProfile(data); // Update the profile in AuthProvider
        }
      }
    };

    fetchProfile();
  }, [session, setProfile]); // Trigger refetch when session changes

  // Redirect to sign-in if the user is not authenticated
  useEffect(() => {
    if (!loading && !session) {
      navigate('/user/signin');
    }
  }, [loading, session, navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/user/signin');
    }
  };

  const handleIconSelect = async (iconUrl) => {
    if (!profile) {
      console.error('Profile is null');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ user_icon: iconUrl })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating user icon:', error.message);
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
              src={profile.user_icon || Preset} // Ensure fallback icon
              alt="Profile Icon"
              className="avatar"
            />
          </div>
          <div className="profile-details">
            <div className="profile-item">{profile.username}</div>
            <div className="profile-item">
              Favorite Player: {profile.favorite_player || 'Not set'}
            </div>
            <div className="profile-item">
              Favorite Team:{' '}
              {Array.isArray(profile.favorite_teams)
                ? profile.favorite_teams.join(', ')
                : 'Not set'}
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
            <div className="stats-item"></div>
            <div className="stats-item"></div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="signout-container">
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

        {/* Popup Menu */}
        {isPopupOpen && (
          <div className="popup">
            <div className="popup-content">
              <h3>Select a Default Icon</h3>
              <div className="default-icons">
                {defaultIcons.map((icon) => (
                  <img
                    key={icon}
                    src={icon}
                    alt="Default Icon"
                    className="default-icon"
                    onClick={() => handleIconSelect(icon)}
                  />
                ))}
              </div>
              <button
                className="close-button"
                onClick={() => setIsPopupOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
