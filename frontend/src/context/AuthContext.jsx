import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth';

const AuthContext = createContext();

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

  useEffect(() => {
    // Проверяем наличие токена при загрузке приложения
    const token = authService.getToken();
    if (token) {
      const savedUser = authService.getUser();
      if (savedUser) {
        setUser(savedUser);
      } else {
        // Можно сделать запрос к API для получения данных пользователя
        // fetchUserProfile();
      }
    }
    setLoading(false);
  }, []);

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
        // Можно получить данные пользователя и установить
        setUser({ email });
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
    isAuthenticated: authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};