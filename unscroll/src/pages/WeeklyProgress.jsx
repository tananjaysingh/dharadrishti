import React from 'react';
import { motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { Trophy, Star, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WeeklyProgress = () => {
  const navigate = useNavigate();

  const achievements = [
    { icon: Shield, title: "Sleep Defender", desc: "No scrolling after 12AM for 3 days", progress: 100, unlocked: true },
    { icon: Trophy, title: "Focus Master", desc: "Complete 5 Focus Sessions", progress: 80, unlocked: false },
    { icon: Star, title: "Dopamine Detox", desc: "Keep dopamine score below 50 all day", progress: 40, unlocked: false },
  ];

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const streakData = [true, true, false, true, true, false, false];

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-8 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-charcoal border border-white/5 text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-white tracking-widest uppercase">WEEKLY <span className="text-neon-purple">PROGRESS</span></h2>
      </div>

      {/* Hero Badge */}
      <div className="glass-panel p-6 rounded-[32px] mb-8 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/20 to-transparent"></div>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative z-10 w-24 h-24 mb-4"
        >
           <div className="absolute inset-0 bg-neon-purple rounded-full blur-[40px] opacity-50"></div>
           <div className="w-full h-full bg-gradient-to-tr from-charcoal to-gray-800 rounded-full border-4 border-neon-purple shadow-[0_0_20px_rgba(176,38,255,0.4)] flex items-center justify-center">
             <Trophy size={40} className="text-white drop-shadow-md" />
           </div>
        </motion.div>
        <h3 className="text-white font-black text-2xl z-10">LEVEL 4</h3>
        <p className="text-neon-purple text-xs font-bold uppercase tracking-widest mt-1 z-10">Neural Initiate</p>
      </div>

      {/* Focus Streak */}
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Focus Streak</h3>
      <div className="glass-panel p-5 rounded-3xl mb-8 border border-white/5">
         <div className="flex justify-between items-center mb-4">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${streakData[i] ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-white/5 text-gray-600'}`}>
                    {streakData[i] ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{day}</span>}
                 </div>
              </div>
            ))}
         </div>
         <p className="text-center text-sm font-semibold text-gray-400">You maintained focus for <strong className="text-white">4 days</strong> this week.</p>
      </div>

      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Achievements</h3>

      {/* Achievements List */}
      <div className="flex flex-col gap-3">
        {achievements.map((ach, i) => {
          const Icon = ach.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-4 rounded-2xl flex items-center gap-4 border ${ach.unlocked ? 'border-neon-purple/30 bg-neon-purple/5' : 'border-white/5 opacity-60'}`}
            >
               <div className={`p-3 rounded-xl ${ach.unlocked ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(176,38,255,0.5)]' : 'bg-white/10 text-gray-400'}`}>
                 <Icon size={24} />
               </div>
               <div className="flex-1">
                 <h4 className={`font-bold text-sm ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>{ach.title}</h4>
                 <p className="text-xs text-gray-500 mt-1">{ach.desc}</p>
               </div>
               {!ach.unlocked && (
                 <div className="w-12 text-right">
                    <span className="text-xs font-bold text-gray-500">{ach.progress}%</span>
                 </div>
               )}
            </motion.div>
          )
        })}
      </div>

    </div>
  );
};

export default WeeklyProgress;
