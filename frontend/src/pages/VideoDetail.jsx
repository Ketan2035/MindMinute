import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Target, MessageSquareQuote, Heart, ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Star } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Custom Player States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/videos/${id}`);
        setVideo(res.data);
      } catch (err) {
        console.error('Failed to fetch video:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review.');
      return;
    }
    if (!reviewText.trim() || !video) return;
    
    setSubmittingReview(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/videos/${video._id}/reviews`, 
        { text: reviewText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setVideo(res.data);
      setReviewText('');
      toast.success('Review posted successfully!');
    } catch (err) {
      console.error('Failed to submit review', err);
      toast.error('Failed to post review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStar = async () => {
    if (!user) {
      toast.error('Please log in to star videos');
      return;
    }
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/videos/${video._id}/star`, 
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setVideo(res.data);
    } catch (err) {
      console.error('Failed to toggle star', err);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) videoRef.current.volume = vol;
    if (vol === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      if (videoRef.current) videoRef.current.volume = volume > 0 ? volume : 1;
      setVolume(volume > 0 ? volume : 1);
      setIsMuted(false);
    } else {
      if (videoRef.current) videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Video Not Found</h2>
        <p>The video you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/explore')} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold">Go Back to Explore</button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col lg:flex-row bg-white overflow-hidden">
      
      {/* Left Column: Video Player */}
      <div className="w-full lg:w-[65%] xl:w-[70%] bg-black relative flex flex-col h-full border-r border-slate-200">
        <button 
          onClick={() => navigate('/explore')}
          className="absolute top-6 left-6 z-50 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors flex items-center gap-2 pr-4 font-semibold text-sm border border-white/10"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </button>
        
        <div 
          className="flex-1 flex items-center justify-center relative w-full h-full group cursor-pointer"
          onClick={() => togglePlay()}
        >
          <video 
            ref={videoRef}
            src={video.videoUrl} 
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          
          {/* Custom Play/Pause Center Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] transition-all duration-300 ${isPlaying ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <div className={`w-24 h-24 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-transform duration-300 ${isPlaying ? 'scale-90' : 'scale-100 hover:scale-110 hover:bg-white/30'}`}>
              <Play size={44} className="fill-white ml-2 drop-shadow-md" />
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div 
            className={`absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`} 
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Progress Bar */}
            <div className="w-full flex items-center mb-3">
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer hover:h-1.5 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-5">
                <button onClick={(e) => togglePlay(e)} className="hover:text-indigo-400 transition-colors">
                  {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current" />}
                </button>
                
                <div className="flex items-center gap-2 group/volume relative">
                  <button onClick={toggleMute} className="hover:text-indigo-400 transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={isMuted ? 0 : volume} 
                    onChange={handleVolumeChange}
                    className="w-0 opacity-0 group-hover/volume:w-24 group-hover/volume:opacity-100 transition-all duration-300 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full origin-left"
                  />
                </div>

                <div className="text-xs font-semibold tabular-nums tracking-wider opacity-90 border-l border-white/20 pl-4 ml-1">
                  {formatTime(currentTime)} <span className="text-white/50 mx-1">/</span> {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={toggleFullscreen} className="hover:text-indigo-400 transition-colors p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Info & Comments Panel */}
      <div className="w-full lg:w-[35%] xl:w-[30%] bg-white p-6 lg:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
          
        {/* Header: User Info */}
        <div className="flex justify-between items-start mb-8 shrink-0">
          <div className="flex items-center gap-4">
            {video.user?.avatar ? (
              <img src={video.user.avatar} alt={video.user.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 font-black text-2xl rounded-full flex items-center justify-center border-2 border-indigo-200 shadow-sm">
                {video.user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{video.user?.name || 'Anonymous Speaker'}</h3>
              <p className="text-sm text-slate-500 font-medium">{new Date(video.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Topic Info */}
        <div className="mb-6 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-indigo-500" />
            <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">Topic Challenge</span>
          </div>
          <h4 className="text-2xl font-black text-slate-900 leading-tight">
            {video.topic?.title || 'Unknown Topic'}
          </h4>
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-slate-100 shrink-0">
          <button 
            className={`flex items-center gap-2 transition-colors group/btn ${video.stars?.includes(user?._id) ? 'text-amber-500' : 'text-slate-500 hover:text-amber-500'}`}
            onClick={handleStar}
          >
            <Star size={24} className={video.stars?.includes(user?._id) ? 'fill-amber-500' : 'group-hover/btn:fill-amber-500'} />
            <span className="font-bold text-lg">{video.stars?.length || 0}</span>
          </button>
          <div className="flex items-center gap-2 text-slate-500">
            <MessageSquareQuote size={24} />
            <span className="font-bold text-lg">{video.reviews?.length || 0}</span>
          </div>
        </div>

        {/* AI Score Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-100 mb-6 flex items-center gap-5 shrink-0">
          <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm border border-emerald-100">
            <span className="text-2xl font-black text-emerald-600 leading-none">{video.analysis?.overallScore || 0}</span>
          </div>
          <div>
            <h5 className="font-extrabold text-slate-900 text-sm mb-1">AI Evaluation Score</h5>
            <p className="text-xs text-slate-600">Based on fluency, grammar, and critical thinking.</p>
          </div>
        </div>

        {/* AI Takeaway */}
        <div className="mb-8 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareQuote size={16} className="text-slate-400" />
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">AI Takeaway</span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <p className="text-slate-700 text-sm leading-relaxed italic">
              "{video.analysis?.thoughtAnalysis?.userCoreArgument || 'No detailed analysis available for this session.'}"
            </p>
          </div>
        </div>

        {/* Community Reviews Section */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h4 className="font-bold text-slate-900">Community Reviews</h4>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 mb-6">
          {!video.reviews || video.reviews.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500 text-sm">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            video.reviews?.map((review, i) => (
              <div key={i} className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                {review.user?.avatar ? (
                  <img src={review.user.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt={review.user.name} />
                ) : (
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-full flex items-center justify-center shrink-0">
                    {review.user?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm">{review.user?.name || 'User'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{review.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Review Input (Sticky at bottom if scrolled) */}
        <div className="sticky bottom-0 bg-white pt-2 shrink-0">
          <form onSubmit={submitReview} className="relative">
            <input 
              type="text" 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Add a review..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-full py-3.5 pl-5 pr-24 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              disabled={submittingReview}
            />
            <button 
              type="submit"
              disabled={submittingReview || !reviewText.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingReview ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
          
      </div>
    </div>
  );
};

export default VideoDetail;
