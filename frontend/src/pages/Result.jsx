import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Clock, Trophy, Play, MessageSquare, ThumbsUp, Eye, CheckCircle2, AlertCircle, BrainCircuit } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Analyze = () => {
  const { id } = useParams();
  const [latestVideo, setLatestVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (response.data) {
        setLatestVideo(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch videos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    fetchVideos();
    
    // Poll every 5 seconds if the latest video is still processing
    const intervalId = setInterval(() => {
      if (latestVideo && latestVideo.status === 'processing') {
        fetchVideos();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [user, latestVideo?.status]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isProcessing = latestVideo && latestVideo.status === 'processing';
  const analysis = latestVideo?.analysis;
  const isFailed = latestVideo && latestVideo.status === 'failed';
  const isCompletedNoAnalysis = latestVideo && latestVideo.status === 'completed' && !analysis;

  if (isFailed || isCompletedNoAnalysis) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-2">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isFailed ? 'Analysis Failed' : 'No Analysis Available'}
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          {isCompletedNoAnalysis 
            ? 'No transcript was captured during your recording, so Gemini could not analyse your speech. Please try again and make sure your microphone is working.' 
            : 'The AI analysis failed. This can happen due to API limits. Please try again.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your speech...</h2>
        <p className="text-gray-500 animate-pulse text-lg">Gemini 1.5 Flash is generating your transcript and deep analysis.</p>
        <p className="text-gray-400 mt-2 text-sm">(This usually takes 15-30 seconds)</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-5xl space-y-8 mt-4">
        
        {latestVideo && analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-400 opacity-10 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

              <div className="z-10 text-center md:text-left mb-8 md:mb-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <BrainCircuit className="text-indigo-300" size={18} />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">AI Speech Analysis</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight tracking-tight">Your Result</h2>
                <p className="text-indigo-200 text-sm font-medium max-w-md">Detailed AI breakdown for your speech on <span className="text-white font-bold">"{latestVideo.topic?.title || 'Unknown'}"</span></p>
              </div>

              <div className="z-10 relative flex flex-col items-center justify-center bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 filter drop-shadow-lg">
                    <circle cx="48" cy="48" r="42" className="stroke-white/10" strokeWidth="8" fill="none" />
                    <circle 
                      cx="48" cy="48" r="42" 
                      className="stroke-green-400" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="263.89" 
                      strokeDashoffset={263.89 * (1 - (analysis.overallScore || 0) / 100)} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white leading-none tracking-tighter">{analysis.overallScore || 0}</span>
                  </div>
                </div>
                <span className="mt-2 text-xs uppercase tracking-widest font-black text-indigo-200">Overall</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Transcript Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="text-indigo-600" size={18} />
                  Your Transcript
                </h3>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed italic">
                  "{latestVideo.transcript || 'No transcript generated.'}"
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Grammar Score Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 text-md">Grammar</h4>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-xs">{analysis.grammarScore || 0}/100</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.grammarFeedback?.map((feedback, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        {feedback.type === 'positive' ? (
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fluency Score Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 text-md">Fluency</h4>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-full text-xs">{analysis.fluencyScore || 0}/100</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.fluencyFeedback?.map((feedback, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        {feedback.type === 'positive' ? (
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                      </div>
                    ))}
                    {analysis.fillerWords?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Filler Words Detected</span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.fillerWords.map((word, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-medium rounded border border-slate-200">{word}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Critical Thinking Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 text-md">Critical Thinking</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">{analysis.criticalThinkingScore || 0}/100</span>
                  </div>
                  <div className="space-y-3">
                    {analysis.criticalThinkingFeedback?.map((feedback, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        {feedback.type === 'positive' ? (
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Thought Analysis Section */}
              {analysis.thoughtAnalysis && (
                <div className="mt-8 border-t border-slate-200 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <BrainCircuit className="text-indigo-600" size={18} />
                    AI Thought Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
                      <h4 className="font-bold text-indigo-900 text-sm mb-2">Your Core Argument</h4>
                      <p className="text-indigo-800 text-xs leading-relaxed">
                        {analysis.thoughtAnalysis.userCoreArgument}
                      </p>
                    </div>
                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 shadow-sm">
                      <h4 className="font-bold text-orange-900 text-sm mb-2">Missing Counterargument</h4>
                      <p className="text-orange-800 text-xs leading-relaxed">
                        {analysis.thoughtAnalysis.missingCounterargument}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analyze;
