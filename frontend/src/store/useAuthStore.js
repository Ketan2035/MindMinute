import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/auth';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      set({ error: msg, isLoading: false });
    }
  },

  googleLogin: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/google`, { token });
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      const msg = error.response?.data?.message || 'Google Login failed';
      toast.error(msg);
      set({ error: msg, isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/register`, { name, email, password });
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      set({ error: msg, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  checkAuth: () => {
    const user = localStorage.getItem('user');
    if (user) {
      set({ user: JSON.parse(user), isAuthenticated: true });
    }
  },

  fetchProfile: async () => {
    const { user } = useAuthStore.getState();
    if (!user || !user.token) return;
    
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const updatedUser = { ...response.data, token: user.token };
      set({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }
}));

export default useAuthStore;
