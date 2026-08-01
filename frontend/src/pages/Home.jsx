import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, Sparkles, LineChart, RefreshCw, Target, Clock, Loader2, BrainCircuit } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DUMMY_CATEGORIES = ['General', 'Business', 'Technology', 'Debate', 'Interview', 'Philosophy', 'Science'];

const Home = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTopic, setGeneratedTopic] = useState(null);
  const [animatingCategory, setAnimatingCategory] = useState('');
  const [refreshCount, setRefreshCount] = useState(3);

  const generateTopic = async () => {
    if (refreshCount <= 0) return;
    setIsGenerating(true);
    setGeneratedTopic(null);

    // Subtle category shuffle
    let cycles = 0;
    const maxCycles = 10;
    const interval = setInterval(() => {
      setAnimatingCategory(DUMMY_CATEGORIES[Math.floor(Math.random() * DUMMY_CATEGORIES.length)]);
      cycles++;
      if (cycles >= maxCycles) clearInterval(interval);
    }, 100);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/topics/generate`);

      setTimeout(() => {
        clearInterval(interval);
        setGeneratedTopic(response.data);
        setIsGenerating(false);
        setRefreshCount(prev => prev - 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to generate topic:', error);
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-white selection:bg-indigo-100 selection:text-indigo-900">

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-12 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 w-full">

        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6"
          >
            Speak with clarity. <br className="hidden lg:block" />
            <span className="text-gray-400">Think with precision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 mb-6 leading-relaxed"
          >
            MindMinute analyzes your daily 60-second speeches using advanced AI to provide instant feedback on your grammar, fluency, and critical thinking.
          </motion.p>

          {/* Dynamic Topic Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-2xl flex flex-col items-center lg:items-start justify-start min-h-[120px]"
          >
            <AnimatePresence mode="wait">
              {!isGenerating && !generatedTopic && (
                <motion.div
                  key="initial-buttons"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full"
                >
                  <button
                    onClick={generateTopic}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 group hover:-translate-y-0.5"
                  >
                    <Sparkles size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                    Generate Topic
                  </button>
                  <Link
                    to="/explore"
                    className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl border border-gray-200 shadow-sm transition-colors flex items-center justify-center hover:-translate-y-0.5"
                  >
                    Explore People's Thoughts
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Image / Hero Graphic */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center min-h-[400px] lg:min-h-[500px] mt-8 lg:mt-0 bg-indigo-50/30 rounded-[3rem] overflow-hidden border border-indigo-50/50">
          {/* Subtle dot pattern background */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#a5b4fc 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}
          ></div>

          {/* Animated Background Blobs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 lg:w-96 lg:h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

          {/* Floating Image */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative z-10 w-full h-full flex items-center justify-center p-8"
          >
            <img
              src="/sticker-hero.png"
              alt="MindMinute Platform"
              className="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-2xl scale-105"
            />
          </motion.div>
        </div>

      </main>

      {/* Popups */}
      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <motion.div
              key="generating-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md relative overflow-hidden bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] rounded-3xl p-8 flex flex-col items-center justify-center text-center"
            >
              {/* Dynamic colored background blobs inside modal */}
              <motion.div 
                className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              <motion.div 
                className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
              />

              <div className="relative z-10 flex flex-col items-center w-full">
                {/* 3D-like Floating Core */}
                <motion.div 
                  className="relative w-24 h-24 mb-8"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  {/* Expanding rings */}
                  <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-[-15px] bg-purple-500 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.4s' }}></div>
                  
                  {/* Core Box */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-950 w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl border border-indigo-500/30">
                    {/* Scanning Laser Line */}
                    <motion.div
                      className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_12px_4px_rgba(34,211,238,0.7)] z-20"
                      animate={{ top: ["-10%", "110%", "-10%"] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                    <BrainCircuit className="text-cyan-300 relative z-10" size={44} strokeWidth={1.5} />
                    {/* Data grid background inside box */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#2dd4bf 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                  </div>
                </motion.div>
                
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">AI is Synthesizing...</h3>
                <p className="text-gray-500 text-sm mb-6 px-4">Analyzing parameters to generate your perfect challenge.</p>
                
                {/* Futuristic Category Spinner */}
                <div className="flex flex-col items-center w-full max-w-[260px]">
                  <div className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2 px-2">
                    <span>Target Node</span>
                    <Sparkles size={14} className="animate-pulse" />
                  </div>
                  <div className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl h-14 relative overflow-hidden flex items-center justify-center shadow-inner">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={animatingCategory}
                        initial={{ y: 30, opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: -30, opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute text-gray-900 font-extrabold text-lg tracking-wide"
                      >
                        {animatingCategory}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {generatedTopic && !isGenerating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
            <motion.div
              key="result-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center relative"
            >
              <button
                onClick={() => setGeneratedTopic(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
              >
                ✕
              </button>

              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100/50">
                <Target size={28} />
              </div>

              <span className="inline-block px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 border border-gray-200">
                New Topic Generated
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 leading-snug px-2">
                {generatedTopic.title}
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/topics/${generatedTopic._id}`)}
                  className="flex-1 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <Mic size={16} />
                  <span>Start Recording</span>
                </button>
                <button
                  onClick={generateTopic}
                  disabled={refreshCount <= 0}
                  className="flex-1 px-5 py-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:border-gray-200 hover:-translate-y-0.5 shadow-sm"
                >
                  <RefreshCw size={16} className={refreshCount > 0 ? "text-indigo-500" : "text-gray-400"} />
                  <span>Swap ({refreshCount})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Feature Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 w-full mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-gray-100"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <Mic size={20} className="text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Daily Prompts</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Answer diverse questions ranging from philosophy to business, forcing you to think on your feet.
            </p>
          </div>

          <div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Deep Analysis</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Gemini instantly transcribes and grades your speech, highlighting logical flaws and grammar mistakes.
            </p>
          </div>

          <div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <LineChart size={20} className="text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Review your past recordings and watch your fluency and critical thinking scores climb over time.
            </p>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
