import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const res = await api.get('/user/profile');
        if (isMounted) setUser(res.data?.data || res.data?.user || null);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (credentials) => {
    const res = await api.post('/user/signin', credentials);
    // Fetch user profile after successful sign in
    try {
      const profileRes = await api.get('/user/profile');
      setUser(profileRes.data?.data || profileRes.data?.user || null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
    return res;
  };

  const signUp = async (data) => {
    const res = await api.post('/user/signup', data);
    // Fetch user profile after successful sign up
    try {
      const profileRes = await api.get('/user/profile');
      setUser(profileRes.data?.data || profileRes.data?.user || null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
    return res;
  };

  const signOut = async () => {
    try {
      await api.post('/user/signout');
    } finally {
      setUser(null);
    }
  };

  const setDemoUser = () => {
    // Set a demo user without authentication for demo purposes
    const demoUser = {
      _id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@securelms.com',
      role: 'student'
    };
    setUser(demoUser);
    setLoading(false);
  };

  const value = { user, loading, signIn, signUp, signOut, setDemoUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


