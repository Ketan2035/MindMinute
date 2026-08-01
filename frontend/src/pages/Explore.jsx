import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe2, Star, MessageSquareQuote, Target, Video, Mic, Share2, Heart } from 'lucide-react';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import useAuthStore from '../store/useAuthStore';

const Explore = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('video'); // 'video' or 'voice'
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/videos/explore');
        setFeed(res.data);
      } catch (err) {
        console.error('Failed to fetch global feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleStar = async (e, videoId) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to star videos');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/videos/${videoId}/star`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const updatedVideo = res.data;
      setFeed(feed.map(v => v._id === updatedVideo._id ? updatedVideo : v));
    } catch (err) {
      console.error('Failed to toggle star', err);
    }
  };

  const handleShare = async (e, videoId, topicTitle) => {
    e.stopPropagation();
    const url = `${window.location.origin}/video/${videoId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MindMinute',
          text: `Check out this 60-second speech on "${topicTitle || 'this topic'}"!`,
          url: url,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Video tab: anything recorded as video (has videoUrl) or explicitly mediaType='video'
  const videoFeed = feed.filter(video =>
    video.mediaType === 'video' ||
    video.mediaType === undefined ||
    video.mediaType === null ||
    (!video.mediaType && video.videoUrl)
  );

  // Voice tab: audio-only or text-only sessions
  const voiceFeed = feed.filter(video => video.mediaType === 'audio' || video.mediaType === 'text');

  const activeFeed = activeTab === 'video' ? videoFeed : voiceFeed;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans pb-32 pt-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tab Selector */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm inline-flex relative z-10">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'video'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              <Video size={16} /> Video Performances
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'voice'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              <Mic size={16} /> Voice Sessions
            </button>
          </div>
        </div>

        {activeFeed.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Globe2 size={24} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab}s yet</h3>
            <p className="text-gray-500">The feed is empty. Be the first to practice and share!</p>
          </div>
        ) : (
          activeTab === 'video' ? (
            /* Video Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {activeFeed.map((video, index) => (
                  <motion.article
                    key={video._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group flex flex-col h-full"
                  >

                    {/* Media Section */}
                    <div className="relative aspect-video bg-gray-900 shrink-0 overflow-hidden rounded-t-[2rem]">
                      <CustomVideoPlayer
                        topicTitle={video.topic?.title}
                        onClick={() => navigate(`/video/${video._id}`)}
                      />
                      {/* Score Badge Overlay */}
                      <div className="absolute top-4 right-4 z-30 bg-white/95 backdrop-blur shadow-sm text-gray-900 px-3 py-1.5 rounded-full text-sm font-extrabold flex items-center gap-1.5 border border-white/20">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        {video.analysis?.overallScore || 0}
                      </div>
                    </div>


                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-1">

                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-5">
                        {video.user?.avatar ? (
                          <img src={video.user.avatar} alt={video.user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 font-bold rounded-full flex items-center justify-center border border-indigo-200 shadow-sm">
                            {video.user?.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{video.user?.name || 'Anonymous Speaker'}</h3>
                          <p className="text-xs text-gray-500 font-medium">{new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>

                      {/* Social Actions Bar */}
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            className={`flex items-center gap-1.5 transition-colors group/btn ${video.stars?.includes(user?._id) ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500'}`}
                            onClick={(e) => handleStar(e, video._id)}
                          >
                            <Star size={18} className={video.stars?.includes(user?._id) ? 'fill-amber-500' : 'group-hover/btn:fill-amber-500'} />
                            <span className="text-xs font-bold">{video.stars?.length || 0}</span>
                          </button>
                          <button
                            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-500 transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(`/video/${video._id}`); }}
                          >
                            <MessageSquareQuote size={18} />
                            <span className="text-xs font-bold">{video.reviews?.length || 0}</span>
                          </button>
                        </div>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={(e) => handleShare(e, video._id, video.topic?.title)}
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>

                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Voice / Podcast List */
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <AnimatePresence>
                {activeFeed.map((video, index) => {
                  const isTextOnly = video.mediaType === 'text';

                  return (
                    <motion.article
                      key={video._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row"
                    >
                      {/* Podcast Left: Media/Avatar */}
                      <div className="md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                        {video.user?.avatar ? (
                          <img src={video.user.avatar} alt={video.user.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm mb-3" />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 text-2xl font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3">
                            {video.user?.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                        )}
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{video.user?.name || 'Anonymous Speaker'}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                          <span>{new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                          <Star size={12} className="fill-emerald-600 text-emerald-600" /> {video.analysis?.overallScore || 0} Score
                        </div>
                      </div>

                      {/* Podcast Right: Content & Player */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start gap-2 mb-3">
                            <Target size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                            <h4 className="font-semibold text-gray-800 text-lg leading-snug">
                              {video.topic?.title || 'Unknown Topic'}
                            </h4>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-6 italic border-l-2 border-gray-200 pl-3">
                            "{video.analysis?.thoughtAnalysis?.userCoreArgument || 'No detailed analysis available.'}"
                          </p>
                        </div>

                        {isTextOnly ? (
                          <div className="bg-indigo-50/50 rounded-xl p-4 flex items-center gap-4 border border-indigo-100/50">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                              <MessageSquareQuote size={20} className="text-indigo-600" />
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-indigo-900">Text-Only Session</h5>
                              <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider mt-0.5">Live Transcript Evaluated</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-4">
                            <audio
                              src={video.videoUrl}
                              controls
                              className="w-full h-10"
                            />
                          </div>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )
        )}
      </div>

    </div>
  );
};

export default Explore;
