import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, MessageCircle, Code, Briefcase } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm">
                <Timer size={24} />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">MindMinute</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Speak with clarity. Think with precision. Get instant AI feedback on your communication skills.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="#" className="hover:text-indigo-600 transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Code size={20} /></a>
              <a href="#" className="hover:text-indigo-600 transition-colors"><Briefcase size={20} /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-gray-900 font-bold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Explore Topics</Link></li>
              <li><Link to="/leaderboard" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Leaderboard</Link></li>
              <li><Link to="/login" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">AI Analysis</Link></li>
              <li><Link to="/signup" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Get Started</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-gray-900 font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Communication Tips</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">API Documentation</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-gray-900 font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">Contact Us</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} MindMinute. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Made with</span>
            <span className="text-red-500">❤️</span>
            <span>for better communication.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
