import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Video as VideoIcon, Activity, Target, BrainCircuit, Mic2, Star, Flame, Edit2, MapPin, Briefcase, Link, AtSign } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user, logout, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyVideos = async () => {
      if (!user?.token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/videos/my-videos`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setVideos(response.data);
      } catch (err) {
        console.error('Failed to fetch videos', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyVideos();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate Stats
  const totalVideos = videos.length;
  
  const averageOverallScore = totalVideos > 0 
    ? Math.round(videos.reduce((acc, curr) => acc + (curr.analysis?.overallScore || 0), 0) / totalVideos) 
    : 0;

  const averageGrammar = totalVideos > 0
    ? Math.round(videos.reduce((acc, curr) => acc + (curr.analysis?.grammarScore || 0), 0) / totalVideos)
    : 0;
    
  const averageFluency = totalVideos > 0
    ? Math.round(videos.reduce((acc, curr) => acc + (curr.analysis?.fluencyScore || 0), 0) / totalVideos)
    : 0;
    
  const averageCriticalThinking = totalVideos > 0
    ? Math.round(videos.reduce((acc, curr) => acc + (curr.analysis?.criticalThinkingScore || 0), 0) / totalVideos)
    : 0;

  const totalMinutes = Math.round((totalVideos * 60) / 60); // assuming each is ~60 seconds

  // --- Real Streak System Calculation ---
  let currentStreak = 0;
  let maxStreak = 0;
  
  if (videos.length > 0) {
    // Get unique dates sorted descending
    const dates = [...new Set(videos.map(v => new Date(v.createdAt).toISOString().split('T')[0]))].sort().reverse();
    
    // Calculate current streak
    let tempStreak = 0;
    let expectedDate = new Date();
    const checkDateString = (dateObj) => dateObj.toISOString().split('T')[0];
    
    // Is there a video today?
    if (dates.includes(checkDateString(expectedDate))) {
      tempStreak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      // Allow a gap of 1 day if they haven't posted today yet.
      expectedDate.setDate(expectedDate.getDate() - 1);
      if (dates.includes(checkDateString(expectedDate))) {
        tempStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      }
    }
    
    if (tempStreak > 0) {
      while (dates.includes(checkDateString(expectedDate))) {
        tempStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      }
      currentStreak = tempStreak;
    }

    // Calculate max streak
    let currentRun = 1;
    maxStreak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const d1 = new Date(dates[i]);
      const d2 = new Date(dates[i+1]);
      const diffTime = Math.abs(d1 - d2);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays === 1) {
        currentRun++;
        if (currentRun > maxStreak) maxStreak = currentRun;
      } else {
        currentRun = 1;
      }
    }
  }

  // Heatmap calculation (last 26 weeks / 182 days)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const daysToSubtract = (25 * 7) + dayOfWeek;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToSubtract);

  // Map of date string 'YYYY-MM-DD' -> count
  const activityMap = {};
  videos.forEach(v => {
    const d = new Date(v.createdAt);
    const dateString = d.toISOString().split('T')[0];
    activityMap[dateString] = (activityMap[dateString] || 0) + 1;
  });

  const calendarDays = [];
  const monthLabels = [];
  
  for (let i = 0; i < 182; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const isFuture = currentDate > today;
    const dateString = currentDate.toISOString().split('T')[0];
    const count = isFuture ? 0 : (activityMap[dateString] || 0);
    
    let bgClass = "bg-slate-100";
    if (!isFuture) {
      if (count === 1) bgClass = "bg-indigo-200";
      if (count === 2) bgClass = "bg-indigo-400";
      if (count >= 3) bgClass = "bg-indigo-600";
    } else {
      bgClass = "bg-slate-50 opacity-40"; 
    }
    
    if (currentDate.getDate() === 1 || i === 0) {
      const colIndex = Math.floor(i / 7);
      const monthName = currentDate.toLocaleString('default', { month: 'short' });
      if (monthLabels.length === 0 || (colIndex - monthLabels[monthLabels.length - 1].colIndex >= 3)) {
        monthLabels.push({ month: monthName, colIndex });
      }
    }
    
    calendarDays.push({ 
      date: dateString, 
      count, 
      bgClass, 
      isFuture,
      displayDate: currentDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDEBAR (User Info & Skills) - LeetCode Style */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Identity Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <button 
                onClick={() => navigate('/settings')}
                className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 transition-colors p-2 bg-gray-50 hover:bg-indigo-50 rounded-full"
                title="Edit Profile"
              >
                <Edit2 size={16} />
              </button>

              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl font-bold text-indigo-700 shadow-sm border-2 border-white ring-2 ring-gray-100 mb-4 mt-2 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  (user?.name || 'A')[0].toUpperCase()
                )}
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'User Profile'}</h1>
              {user?.jobTitle && <p className="text-sm font-semibold text-indigo-600 flex items-center justify-center mb-1"><Briefcase size={14} className="mr-1"/> {user.jobTitle}</p>}
              <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
              
              {user?.location && (
                <div className="flex items-center text-xs text-gray-500 font-semibold mb-4 bg-gray-50 px-3 py-1.5 rounded-full">
                  <MapPin size={12} className="mr-1 text-gray-400" /> {user.location}
                </div>
              )}

              {user?.bio && (
                <div className="text-sm text-gray-600 mb-6 bg-slate-50 border border-slate-100 p-3 rounded-xl italic w-full">
                  "{user.bio}"
                </div>
              )}
              
              <div className="flex gap-2 justify-center w-full mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider w-full">Rank: Member</span>
              </div>
              
              <div className="flex gap-3 justify-center w-full mb-6">
                {user?.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                    <Link size={18} />
                  </a>
                )}
                {user?.twitter && (
                  <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-500 hover:bg-sky-100 rounded-lg transition-colors">
                    <AtSign size={18} />
                  </a>
                )}
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors mt-auto"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>

            {/* Skill Breakdown (Like LeetCode Topics/Tags) */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <BrainCircuit className="mr-2 text-indigo-600" size={16} />
                Skill Breakdown
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-600">Grammar</span>
                    <span className="text-indigo-600">{averageGrammar}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${averageGrammar}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-600">Fluency</span>
                    <span className="text-blue-500">{averageFluency}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${averageFluency}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-600">Critical Thinking</span>
                    <span className="text-purple-500">{averageCriticalThinking}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${averageCriticalThinking}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN (Stats, Heatmap, History) - LeetCode Style */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <VideoIcon className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Speeches</p>
                  <h2 className="text-2xl font-black text-gray-900">{totalVideos}</h2>
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <Target className="text-indigo-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Score</p>
                  <h2 className="text-2xl font-black text-gray-900">{averageOverallScore}</h2>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Activity className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Minutes Spoken</p>
                  <h2 className="text-2xl font-black text-gray-900">{totalMinutes}m</h2>
                </div>
              </motion.div>
            </div>

            {/* Middle Row: Heatmap + Streak */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Contribution Heatmap */}
              <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                  <Activity className="mr-2 text-indigo-600" size={16} />
                  Activity (6 Months)
                </h3>
                
                <div className="flex w-full overflow-x-auto pb-2 custom-scrollbar">
                  {/* Y-Axis Labels */}
                  <div className="grid grid-rows-7 gap-1 text-[10px] font-semibold text-gray-400 pr-2 mt-5">
                    <div className="flex items-center h-3 sm:h-3.5"></div>
                    <div className="flex items-center h-3 sm:h-3.5">Mon</div>
                    <div className="flex items-center h-3 sm:h-3.5"></div>
                    <div className="flex items-center h-3 sm:h-3.5">Wed</div>
                    <div className="flex items-center h-3 sm:h-3.5"></div>
                    <div className="flex items-center h-3 sm:h-3.5">Fri</div>
                    <div className="flex items-center h-3 sm:h-3.5"></div>
                  </div>
                  
                  {/* Grid Area */}
                  <div className="flex flex-col relative min-w-max">
                    {/* Months Header */}
                    <div className="relative w-full h-4 mb-1">
                      {monthLabels.map((lbl, idx) => (
                        <span 
                          key={idx} 
                          className="absolute text-[9px] sm:text-[10px] font-semibold text-gray-500"
                          style={{ left: `calc(${(lbl.colIndex / 26) * 100}%)` }}
                        >
                          {lbl.month}
                        </span>
                      ))}
                    </div>
                    
                    {/* Cells Grid */}
                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                      {calendarDays.map((day, i) => (
                        <div 
                          key={day.date} 
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${day.bgClass} hover:ring-2 hover:ring-gray-300 transition-all group relative`}
                        >
                          {/* Custom Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                            <div className="bg-gray-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap">
                              <span className="font-bold">{day.count === 0 ? 'No' : day.count} speeches</span> on {day.displayDate}
                            </div>
                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900 -mt-[1px]"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end mt-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider gap-2">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                    <div className="w-3 h-3 rounded-sm bg-indigo-200"></div>
                    <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Real Streak System Card */}
              <div className="md:col-span-1 bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <Flame size={100} />
                </div>
                <h3 className="text-sm font-bold text-orange-900 mb-4 flex items-center relative z-10">
                  <Flame className="mr-1 text-orange-500" size={16} />
                  Current Streak
                </h3>
                
                <div className="flex items-end gap-2 relative z-10 mb-2">
                  <span className="text-5xl font-black text-orange-600 leading-none">{currentStreak}</span>
                  <span className="text-sm font-bold text-orange-800 mb-1">days</span>
                </div>
                <div className="text-xs font-bold text-orange-700/70 relative z-10">
                  Longest: {maxStreak} days
                </div>
              </div>
            </div>

            {/* Bottom Row: Video History (Recent Submissions equivalent) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <Mic2 className="mr-2 text-gray-400" size={18} />
                Recent Speeches
              </h3>

              {videos.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-gray-500 text-sm mb-4">You haven't recorded any speeches yet.</p>
                  <button onClick={() => navigate('/explore')} className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-5 py-2 text-sm rounded-lg font-bold">
                    Start Practicing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.map((video, idx) => (
                    <motion.div 
                      key={video._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/analyze/${video._id}`)}
                      className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-8 bg-gray-900 rounded bg-cover bg-center overflow-hidden shrink-0 relative">
                           {video.videoUrl.endsWith('.webm') && video.videoUrl.includes('audio') ? (
                             <div className="absolute inset-0 bg-indigo-900 flex items-center justify-center">
                               <Mic2 size={12} className="text-white/50" />
                             </div>
                           ) : (
                             <video src={video.videoUrl} className="w-full h-full object-cover opacity-50" />
                           )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {video.topic?.title || 'Unknown Topic'}
                          </h4>
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                            {new Date(video.createdAt).toLocaleDateString()} • {video.topic?.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="flex items-center bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                          <Star size={12} className="text-amber-500 mr-1" fill="currentColor" />
                          <span className="font-bold text-gray-700 text-xs">{video.stars?.length || 0}</span>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors ml-2">Review →</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
