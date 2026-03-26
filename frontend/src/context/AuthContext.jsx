import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      const result = await authService.getProfile();
      console.log(result);// Вызывает GET /auth/profile
      if (result.success) {
        setUser(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
      }
    } catch (err) {
      console.error("Не удалось загрузить профиль", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const savedUser = authService.getUser();
        if (savedUser) setUser(savedUser);

        await fetchProfile();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const result = await authService.updateProfile(profileData);
      if (result.success) {
        setUser(profileData);
        localStorage.setItem('user', JSON.stringify(profileData));
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const result = await authService.register(userData);

      if (result.success) {
        setUser(result.data);
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        await fetchProfile();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError("Ошибка сервера");
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};