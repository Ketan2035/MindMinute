import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      set({ notifications: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch notifications', isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      const response = await axios.get('http://localhost:5000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      set({ unreadCount: response.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id = 'all') => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      if (id === 'all') {
        set((state) => ({
          unreadCount: 0,
          notifications: state.notifications.map(n => ({ ...n, isRead: true }))
        }));
      } else {
        set((state) => {
          const updatedNotifications = state.notifications.map(n => 
            n._id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updatedNotifications,
            unreadCount: Math.max(0, state.unreadCount - 1)
          };
        });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }
}));

export default useNotificationStore;
