import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Flame, Star, Medal } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/leaderboard');
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white text-slate-800 font-sans pb-20">
      
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-yellow-200">
            <Trophy size={32} className="text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Ranking</h1>
          <p className="text-slate-500">Compete with speakers worldwide. Climb the ranks by maintaining your daily streak.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Leaderboard Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                <th className="py-4 px-6 font-semibold text-slate-500 w-24 text-center">Rank</th>
                <th className="py-4 px-6 font-semibold text-slate-500">Speaker</th>
                <th className="py-4 px-6 font-semibold text-slate-500 w-32 text-center">Streak</th>
                <th className="py-4 px-6 font-semibold text-slate-500 w-32 text-right">XP</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => {
                const rank = index + 1;
                const isCurrentUser = currentUser && u._id === currentUser._id;
                
                let rankDisplay = <span className="text-slate-500 font-medium">{rank}</span>;
                if (rank === 1) rankDisplay = <Medal size={24} className="text-yellow-500 mx-auto" fill="currentColor" />;
                if (rank === 2) rankDisplay = <Medal size={24} className="text-slate-400 mx-auto" fill="currentColor" />;
                if (rank === 3) rankDisplay = <Medal size={24} className="text-amber-600 mx-auto" fill="currentColor" />;

                return (
                  <tr 
                    key={u._id} 
                    className={`border-b border-slate-100 last:border-none transition-colors 
                      ${isCurrentUser ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}
                    `}
                  >
                    <td className="py-4 px-6 text-center align-middle">
                      {rankDisplay}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 text-indigo-700 font-bold">
                            {u.name[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className={`font-semibold ${isCurrentUser ? 'text-indigo-700' : 'text-slate-900'}`}>
                            {u.name} {isCurrentUser && '(You)'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full">
                        <Flame size={14} className="text-orange-500 fill-orange-500" />
                        <span className="text-sm font-bold text-orange-700">{u.streak || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 text-slate-700">
                        <Star size={16} className="text-indigo-500" fill="currentColor" />
                        <span className="font-bold">{u.xp || 0}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No speakers found. Be the first to join the leaderboard!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
