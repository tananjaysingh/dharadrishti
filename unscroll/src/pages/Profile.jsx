import React from 'react';
import { useBioState } from '../context/BioStateContext';
import { User, Activity, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { dopamineScore, screenTime } = useBioState();

  return (
    <div className="h-full flex flex-col gap-6 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full p-1 relative text-white flex justify-center items-center font-bold text-2xl shadow-neon-blue">
           <User size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Gen Z Explorer</h1>
          <p className="text-gray-400 text-sm">Joined 3 weeks ago</p>
        </div>
      </div>

      {/* Focus Streak linked to Weekly Progress */}
      <Link to="/weekly-progress" className="block bg-charcoal border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
         <div className="absolute top-0 right-0 p-4 opacity-50"><Trophy size={120} className="text-yellow-500/20 group-hover:scale-110 transition-transform duration-500" /></div>
         <div className="flex justify-between items-start relative z-10 w-full mb-2">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs">Current Streak</h3>
            <ArrowRight size={16} className="text-neon-cyan opacity-50 group-hover:opacity-100" />
         </div>
         <div className="flex items-end gap-2 relative z-10">
            <h2 className="text-5xl font-black text-white">12</h2>
            <span className="text-xl font-medium text-gray-500 mb-2">Days</span>
         </div>
         <p className="text-xs text-neon-cyan mt-4 relative z-10 font-bold tracking-widest uppercase">View Weekly Progress</p>
      </Link>

      {/* Daily Insights Link */}
      <div>
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-neon-purple" /> Today's Activity
           </h3>
           <Link to="/insights" className="text-neon-purple flex items-center gap-1 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">
              Insights <ArrowRight size={14} />
           </Link>
        </div>
        
        <div className="flex flex-col gap-3">
           <div className="glass-panel p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex flex-col">
                 <span className="text-white font-bold text-lg">Avg Dopamine Load</span>
                 <span className="text-gray-500 text-xs">Based on weekly usage</span>
              </div>
              <div className="text-right">
                 <span className="text-2xl font-black text-neon-cyan">64</span>
              </div>
           </div>

           <div className="glass-panel p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex flex-col">
                 <span className="text-white font-bold text-lg">Intentionality Rate</span>
                 <span className="text-gray-500 text-xs">Did you stick to your goals?</span>
              </div>
              <div className="text-right">
                 <span className="text-2xl font-black text-neon-purple">88%</span>
              </div>
           </div>
        </div>
      </div>
      
      {/* Micro Challenges completed */}
      <div className="glass-panel p-5 rounded-3xl border border-neon-cyan/20">
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Micro Challenges</h3>
         <div className="flex justify-between items-baseline">
            <h2 className="text-3xl font-black text-white">14</h2>
            <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded">+3 this week</span>
         </div>
      </div>
    </div>
  );
};

export default Profile;
