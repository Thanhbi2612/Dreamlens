import axiosInstance from '../utils/api/axios';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Delete user account
  deleteAccount: async (password) => {
    const response = await axiosInstance.delete('/api/auth/account', {
      data: { password }
    });
    // Remove token after successful deletion
    localStorage.removeItem('access_token');
    return response.data;
  },
};

export default authService;
