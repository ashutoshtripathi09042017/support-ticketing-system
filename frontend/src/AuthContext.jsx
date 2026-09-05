import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state directly from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('app_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify session in background on reload
    api.get('me/')
      .then(res => {
        setUser(res.data);
        localStorage.setItem('app_user', JSON.stringify(res.data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('app_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    await api.get('csrf/'); 
    const response = await api.post('login/', { username, password });
    setUser(response.data);
    localStorage.setItem('app_user', JSON.stringify(response.data));
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('logout/');
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      localStorage.removeItem('app_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);