import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import { Mic, LogOut, Compass, Trophy, User as UserIcon, Bell, Flame, Menu, X, Home } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout, fetchProfile } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchUnreadCount();
      
      // Poll for notifications every 30 seconds
      const intervalId = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, fetchProfile, fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Explore', path: '/explore', icon: <Compass size={18} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={18} /> },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="MindMinute Logo" className="w-9 h-9 rounded-lg shadow-sm object-cover" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">MindMinute</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                {/* Streak Badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full" title="Current Streak">
                  <Flame size={16} className="text-orange-500 fill-orange-500" />
                  <span className="text-sm font-bold text-orange-700">{user?.streak || 0}</span>
                </div>

                <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>

                <Link to="/notifications" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </Link>

                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                      <UserIcon size={16} className="text-indigo-600" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700 hidden lg:block">{user?.name}</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="hidden md:block p-2 text-gray-400 hover:text-red-600 transition-colors ml-2"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/signup" className="bg-gray-900 hover:bg-gray-800 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors ml-1"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                    isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>{link.icon}</span>
                    {link.name}
                  </div>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100 sm:hidden">
                <Link to="/signup" className="flex w-full items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl text-base font-bold transition-all shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
