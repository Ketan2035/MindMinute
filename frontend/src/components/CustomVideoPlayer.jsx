import { motion } from 'framer-motion';

const CustomVideoPlayer = ({ topicTitle, onClick }) => {
  return (
    <div 
      className="relative w-full h-full bg-slate-900 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-0 flex flex-col justify-between z-10 bg-indigo-50/50 transition-transform duration-700 group-hover:scale-105 border-b border-indigo-100/50">
        
        {/* Subtle dot pattern background */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#a5b4fc 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}
        ></div>

        {/* Animated blobs background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Top Bar — "Topic Challenge" badge */}
        <div className="p-3 flex items-start relative z-20">
          {topicTitle && (
            <div className="bg-white/80 backdrop-blur-md text-indigo-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
              Topic Challenge
            </div>
          )}
        </div>

        {/* Center — Topic title */}
        <div className="flex-1 flex items-center justify-center px-4 pb-4 relative z-20">
          {topicTitle ? (
            <div className="w-full transform -rotate-2 group-hover:rotate-0 transition-all duration-300">
              <p className="text-gray-900 text-sm md:text-base font-extrabold leading-snug bg-white group-hover:bg-gray-50 transition-colors px-4 py-3 rounded-xl shadow-lg border border-gray-100 text-center overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {topicTitle}
              </p>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-600 border border-indigo-500 shadow-lg flex items-center justify-center">
              <span className="text-white text-xl pl-1">▶</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomVideoPlayer;
