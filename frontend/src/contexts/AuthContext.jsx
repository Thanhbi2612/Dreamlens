import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      // Check for Google OAuth callback token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const loginSuccess = urlParams.get('login');
      const loginError = urlParams.get('error');

      if (token && loginSuccess === 'success') {
        // Save token from Google OAuth (use same key as normal login)
        localStorage.setItem('access_token', token);

        // Remove token from URL (without page reload)
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // Load user data with the new token
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          toast.success('Đăng nhập với Google thành công!', {
            position: "top-right",
            autoClose: 2000,
          });
        } catch (err) {
          console.error('Failed to load user after Google login:', err);
          localStorage.removeItem('access_token');
          toast.error('Không thể tải thông tin người dùng', {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else if (loginError) {
        // Handle Google OAuth error
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        toast.error('Đăng nhập với Google thất bại!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (authService.isAuthenticated()) {
        // Normal authentication check
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Failed to load user:', err);
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const data = await authService.login(credentials);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return data;
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const newUser = await authService.register(userData);
      return newUser;
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
