import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, refreshToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Try to refresh token
        try {
          await refreshToken();
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (refreshError) {
          // Clear invalid tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      if (response.access_token) {
        // Get user data after successful login
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, data: response };
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (registrationData) => {
    try {
      const response = await registerUser(registrationData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear tokens from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear user state
    setUser(null);
    setIsAuthenticated(false);
    
    // Optional: Call logout endpoint if backend has one
    // await apiCall('/auth/logout', { method: 'POST' });
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};