import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, X } from 'lucide-react';
import VideoRecorder from '../components/VideoRecorder';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/topics/${id}`);
        setTopic(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch topic', err);
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const handleUploadSuccess = (videoData) => {
    navigate(`/analyze/${videoData._id}`, { state: { message: 'Video uploaded successfully! Processing AI feedback...' } });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-xl mb-4">Topic not found.</p>
        <button onClick={() => navigate('/explore')} className="text-indigo-400 hover:text-indigo-300">Return to Library</button>
      </div>
    );
  }

  // If not authenticated, show a sleek login prompt overlay
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex bg-white">
        {/* Left Side: Image (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12 bg-indigo-50 overflow-hidden">
          
          {/* Subtle dot pattern background */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#a5b4fc 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}
          ></div>

          {/* Animated Background Blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

          {/* Floating Image */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            <img 
              src="/sticker-hero.png" 
              alt="MindMinute Platform" 
              className="w-full h-full object-contain drop-shadow-2xl scale-105"
            />
          </motion.div>
        </div>

        {/* Right Side: Action Card */}
        <div className="w-full lg:w-[45%] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16 relative overflow-hidden bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md relative z-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
              <span className="text-2xl drop-shadow-sm">🔒</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Studio Locked</h2>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed px-4">
              Create a free account or log in to access the full-screen recording studio and get instant AI feedback on your speech.
            </p>

            <div className="space-y-4">
              <button 
                onClick={() => navigate('/login', { state: { from: location.pathname } })}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex justify-center items-center"
              >
                Log In
              </button>
              
              <div className="flex items-center justify-center py-2">
                <div className="w-full h-px bg-gray-200"></div>
                <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              <button 
                onClick={() => navigate('/signup', { state: { from: location.pathname } })}
                className="w-full py-3.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex justify-center items-center"
              >
                Sign Up Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // FULL SCREEN IMMERSIVE STUDIO (Light Theme)
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-gray-50 overflow-hidden flex flex-col"
    >
      {/* Absolute Exit Button */}
      <button 
        onClick={() => navigate('/explore')}
        className="absolute top-6 left-6 z-[110] w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200 shadow-sm transition-colors"
        title="Exit Studio"
      >
        <X size={20} />
      </button>

      {/* The Recorder */}
      <VideoRecorder topic={topic} onUploadSuccess={handleUploadSuccess} />
    </motion.div>
  );
};

export default TopicDetail;
