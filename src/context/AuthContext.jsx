import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/api';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const decoded = jwt_decode(token);
      setUser({
        id: decoded.user_id,
        username: decoded.username,
        role: decoded.role
      });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await apiLogin({ username, password });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};