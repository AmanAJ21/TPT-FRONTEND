"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        // First, try to get user data from local storage
        const cachedUser = apiClient.getUserData();
        if (cachedUser) {
          setUser(cachedUser);
          setIsLoading(false);
          
          // Check if cached data is recent (less than 5 minutes old)
          const lastUpdate = localStorage.getItem('user_data_timestamp');
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          
          if (lastUpdate && (now - parseInt(lastUpdate)) < fiveMinutes) {
            // Use cached data, no need to fetch from server
            return;
          }
        }

        // Fetch fresh data from server if no cache or cache is old
        try {
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            apiClient.setUserData(response.data);
            // Store timestamp for cache validation
            localStorage.setItem('user_data_timestamp', Date.now().toString());
          } else {
            // Token is invalid, remove it
            apiClient.removeToken();
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          // If we have cached data, keep using it even if server fails
          if (!cachedUser) {
            apiClient.removeToken();
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data as any);
        // Store timestamp for cache validation
        localStorage.setItem('user_data_timestamp', Date.now().toString());
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data as any);
        // Store timestamp for cache validation
        localStorage.setItem('user_data_timestamp', Date.now().toString());
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const logout = () => {
    try {
      // Clear all authentication data
      apiClient.logout();
      setUser(null);
      
      // Clear cache timestamp
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_data_timestamp');
      }
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const refreshUser = async () => {
    try {
      // Check if we should use cached data
      const cachedUser = apiClient.getUserData();
      const lastUpdate = localStorage.getItem('user_data_timestamp');
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (cachedUser && lastUpdate && (now - parseInt(lastUpdate)) < fiveMinutes) {
        // Use cached data, no need to fetch from server
        setUser(cachedUser);
        return;
      }

      // Fetch fresh data from server
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        apiClient.setUserData(response.data);
        // Store timestamp for cache validation
        localStorage.setItem('user_data_timestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If we have cached data, keep using it even if server fails
      const cachedUser = apiClient.getUserData();
      if (cachedUser) {
        setUser(cachedUser);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};