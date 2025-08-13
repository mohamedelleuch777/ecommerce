import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { AuthContext } from './AuthContext';
import { API_BASE_URL } from '../config/api.js';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token set in API headers:', token.substring(0, 20) + '...');
    } else {
      delete api.defaults.headers.common['Authorization'];
      console.log('Auth token removed from API headers');
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('Auth initialization - stored token:', storedToken ? 'found' : 'not found');
      if (storedToken) {
        try {
          // Set token first before making the API call
          setToken(storedToken);
          const response = await api.get('/auth/profile');
          console.log('Auth profile loaded:', response.data.user.email);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
      console.log('Auth initialization complete');
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password change failed' 
      };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const response = await api.post('/auth/addresses', addressData);
      setUser(prev => ({ ...prev, addresses: response.data.addresses }));
      return { success: true, addresses: response.data.addresses };
    } catch (error) {
      console.error('Add address error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add address' 
      };
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await api.put(`/auth/addresses/${addressId}`, addressData);
      setUser(prev => ({ ...prev, addresses: response.data.addresses }));
      return { success: true, addresses: response.data.addresses };
    } catch (error) {
      console.error('Update address error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update address' 
      };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const response = await api.delete(`/auth/addresses/${addressId}`);
      setUser(prev => ({ ...prev, addresses: response.data.addresses }));
      return { success: true, addresses: response.data.addresses };
    } catch (error) {
      console.error('Delete address error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete address' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    api // Expose api instance for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;