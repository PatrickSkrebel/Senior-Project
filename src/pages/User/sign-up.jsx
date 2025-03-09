import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import '../../css/auth.css';
import { useNavigate } from 'react-router-dom';
import NBAHeader from '../../components/NBAHeader';
import { useAuth } from '../../providers/AuthProvider'; // Import the useAuth hook

const SignUp = () => {
  const { session, loading } = useAuth(); // Access session and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // New state for username
  const [error, setError] = useState(null); // Removed TypeScript typing
  const navigate = useNavigate(); // Hook to navigate between routes

  // Redirect if the user is already signed in
  useEffect(() => {
    if (!loading && session) {
      navigate('/user/profile'); // Redirect to profile if authenticated
    }
  }, [loading, session, navigate]);

  const handleSignUp = async () => {
    setError(null); // Reset error state

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Insert a new profile into the "profiles" table
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user?.id,
          email,
          username, // Include the username in the profiles table
        },
      ]);

      if (profileError) {
        setError(profileError.message);
      } else {
        navigate('/user/profile'); // Redirect to profile page
      }
    }
  };

  const navigateToSignIn = () => {
    // Redirect to the Sign In page
    navigate('/user/signin');
  };

  return (
    <>
      <NBAHeader />
      <div className="auth-container">
        <h1>Sign Up</h1>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="button-group">
          <button onClick={handleSignUp}>Sign Up</button>
          <button onClick={navigateToSignIn}>Sign In</button>
        </div>
      </div>
    </>
  );
};

export default SignUp;
