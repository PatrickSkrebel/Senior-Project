import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/mainHeader';
import { useAuth } from '../../providers/AuthProvider';
import '../../css/auth.css';

const SignIn = () => {
  const { session, loading } = useAuth(); // Access session and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Removed TypeScript-specific typing
  const navigate = useNavigate();

  // Redirect if the user is already signed in
  useEffect(() => {
    if (!loading && session) {
      navigate('/user/profile'); // Redirect to profile if authenticated
    }
  }, [loading, session, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    setError(null); // Clear any previous error

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message); // Display the error
      } else {
        navigate('/user/profile'); // Redirect to profile page
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const navigateToSignUp = () => {
    navigate('/user/signup'); // Redirect to sign-up page
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <h1>Sign In</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignIn} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="button-group">
            <button type="submit" className="auth-button">
              Sign In
            </button>
            <button type="button" onClick={navigateToSignUp} className="auth-button auth-button--secondary">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignIn;
