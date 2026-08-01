import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Play, BrainCircuit, MessageSquare, Star } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const TopicCommunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const [topic, setTopic] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Topic Details
        const topicRes = await axios.get(`http://localhost:5000/api/topics/${id}`);
        setTopic(topicRes.data);

        // Fetch Community Videos for this topic
        const videosRes = await axios.get(`http://localhost:5000/api/videos/topic/${id}/community`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setVideos(videosRes.data);
      } catch (err) {
        console.error('Failed to fetch community data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!topic) {
    return <div className="p-8 text-center text-gray-500">Topic not found.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/explore')}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Topics
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="max-w-3xl">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3 inline-block">
                {topic.category}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{topic.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{topic.description}</p>
            </div>
            
            <button 
              onClick={() => navigate(`/topics/${id}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold transition-colors shrink-0 shadow-sm"
            >
              Practice This Topic
            </button>
          </div>
        </div>
      </div>

      {/* Community Feed */}
      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="flex items-center mb-8 gap-3">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <Users className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Community Thoughts</h2>
            <p className="text-gray-500 text-sm">See how others approached this topic and compare your arguments.</p>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share your thoughts on this topic!</p>
            <button 
              onClick={() => navigate(`/topics/${id}`)}
              className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-2.5 rounded-full font-bold transition-colors"
            >
              Start Recording
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <motion.div 
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Media Section */}
                <div className="relative aspect-video bg-gray-900 group">
                  {video.videoUrl?.includes('audio') || video.videoUrl?.endsWith('.mp3') || video.videoUrl?.endsWith('.wav') ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <Users className="text-white opacity-50" size={32} />
                      </div>
                      <span className="text-white/50 font-medium">Audio Recording</span>
                    </div>
                  ) : (
                    <video 
                      src={video.videoUrl} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <button 
                      onClick={() => setActiveVideo(video)}
                      className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-indigo-600 shadow-xl hover:scale-110 transition-transform"
                    >
                      <Play size={24} className="ml-1" fill="currentColor" />
                    </button>
                  </div>

                  {/* Top Stats */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium border border-white/10 flex items-center gap-2">
                      <Star size={14} className="text-yellow-400" fill="currentColor" />
                      Score: {video.analysis?.overallScore || 0}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 border border-indigo-200">
                      {(video.user?.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{video.user?.name || 'Anonymous User'}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Core Argument Snippet */}
                  {video.analysis?.thoughtAnalysis?.userCoreArgument && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <BrainCircuit size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Core Argument</span>
                      </div>
                      <p className="text-gray-700 text-sm italic line-clamp-3">
                        "{video.analysis.thoughtAnalysis.userCoreArgument}"
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => setActiveVideo(video)}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors text-sm border border-gray-200"
                  >
                    View Full Analysis
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative my-auto">
            
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-gray-700 transition-colors"
            >
              ✕
            </button>

            {/* Left: Video */}
            <div className="md:w-1/2 bg-gray-900 flex flex-col justify-center min-h-[300px]">
              {activeVideo.videoUrl?.includes('audio') || activeVideo.videoUrl?.endsWith('.mp3') || activeVideo.videoUrl?.endsWith('.wav') ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-24 h-24 bg-indigo-900 rounded-full flex items-center justify-center mb-6">
                    <Users className="text-white opacity-50" size={48} />
                  </div>
                  <audio src={activeVideo.videoUrl} controls className="w-full max-w-xs" />
                </div>
              ) : (
                <video src={activeVideo.videoUrl} controls autoPlay className="w-full h-auto max-h-[80vh] object-contain" />
              )}
            </div>

            {/* Right: Analysis */}
            <div className="md:w-1/2 bg-gray-50 p-6 sm:p-8 flex flex-col overflow-y-auto max-h-[80vh]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 text-xl border border-indigo-200 shrink-0">
                  {(activeVideo.user?.name || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeVideo.user?.name || 'Anonymous User'}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-semibold text-gray-500">
                      Overall Score: <span className="text-indigo-600 font-bold">{activeVideo.analysis?.overallScore || 0}</span>
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-sm text-gray-500">{new Date(activeVideo.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Core Argument */}
                {activeVideo.analysis?.thoughtAnalysis?.userCoreArgument && (
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                      <BrainCircuit size={18} className="text-indigo-600" /> Core Argument
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-gray-200">
                      {activeVideo.analysis.thoughtAnalysis.userCoreArgument}
                    </p>
                  </div>
                )}

                {/* Missing Counterargument */}
                {activeVideo.analysis?.thoughtAnalysis?.missingCounterargument && (
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                      <BrainCircuit size={18} className="text-orange-500" /> Ignored Perspective
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-gray-200">
                      {activeVideo.analysis.thoughtAnalysis.missingCounterargument}
                    </p>
                  </div>
                )}

                {/* Full Transcript */}
                {activeVideo.transcript && (
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-2">
                      <MessageSquare size={18} className="text-blue-500" /> Full Transcript
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-600 italic leading-relaxed max-h-48 overflow-y-auto">
                      "{activeVideo.transcript}"
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TopicCommunity;
