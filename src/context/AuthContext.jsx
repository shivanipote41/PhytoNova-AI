import { createContext, useContext, useEffect, useState } from 'react';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  supabase,
} from '../services/supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Grab the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    error,
    signIn: async (email, password) => {
      setError(null);
      const { error: err } = await authSignIn(email, password);
      if (err) setError(err.message);
      return { error: err };
    },
    signUp: async (email, password) => {
      setError(null);
      const { error: err } = await authSignUp(email, password);
      if (err) setError(err.message);
      return { error: err };
    },
    signOut: async () => {
      setError(null);
      const { error: err } = await authSignOut();
      if (err) setError(err.message);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}