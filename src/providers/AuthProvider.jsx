import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({
  session: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Fetch profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
        } else {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching profile:', error.message);
            } else {
              setProfile(data);
            }
          });
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        profile,
        isAdmin: profile?.group === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
