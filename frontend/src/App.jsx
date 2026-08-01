import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Explore from './pages/Explore'
import TopicDetail from './pages/TopicDetail'
import TopicCommunity from './pages/TopicCommunity'
import VideoDetail from './pages/VideoDetail'
import Analyze from './pages/Result'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Notifications from './pages/Notifications'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import useAuthStore from './store/useAuthStore'

function App() {
  const { checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col">
      <Toaster position="top-center" toastOptions={{ className: 'font-medium shadow-lg rounded-xl text-sm mt-16' }} />
      <Navbar />
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/topics/:id" element={<TopicDetail />} />
          <Route path="/topics/:id/community" element={<TopicCommunity />} />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="/analyze/:id" element={<Analyze />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
      {location.pathname === '/' && <Footer />}
    </div>
  )
}

export default App
