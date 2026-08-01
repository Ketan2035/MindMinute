import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Star, MessageSquareQuote, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../store/useNotificationStore';
import useAuthStore from '../store/useAuthStore';

const Notifications = () => {
  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user, navigate, fetchNotifications]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.video) {
      navigate(`/video/${notification.video._id}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'star':
        return <Star size={20} className="text-amber-500 fill-amber-500" />;
      case 'review':
        return <MessageSquareQuote size={20} className="text-indigo-500" />;
      case 'streak':
        return <AlertCircle size={20} className="text-orange-500" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 pt-8 pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-gray-500 mt-1 font-medium">Stay updated with your latest interactions.</p>
          </div>
          <button 
            onClick={() => markAsRead('all')}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full"
          >
            Mark all as read
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">No new notifications right now. Check back later when people interact with your videos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition-all cursor-pointer flex gap-4 items-start ${
                    notification.isRead 
                      ? 'border-gray-100 opacity-70 hover:opacity-100' 
                      : 'border-indigo-100 ring-1 ring-indigo-50 hover:shadow-md'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notification.isRead ? 'bg-gray-50' : 'bg-indigo-50'}`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <p className="text-sm text-gray-900">
                        {notification.sender && (
                          <span className="font-bold text-gray-900 mr-1">{notification.sender.name}</span>
                        )}
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 mt-1"></span>
                      )}
                    </div>
                    
                    {notification.video && notification.video.topic && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded-md">
                        <Play size={12} className="text-indigo-400" /> 
                        <span className="truncate max-w-[200px]">{notification.video.topic.title}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 font-medium mt-3">
                      {new Date(notification.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
