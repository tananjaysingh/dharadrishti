import React from 'react';
import { motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { Brain, Moon, Dumbbell, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReverseStats = () => {
  const { screenTime, rawMetrics } = useBioState();
  const navigate = useNavigate();

  const totalMinutes = screenTime.hours * 60 + screenTime.minutes;
  
  // Calculate potential conversions
  const workoutsLost = Math.floor(totalMinutes / 45);
  const chaptersLost = Math.floor(totalMinutes / 20);
  const sleepLost = Math.floor(rawMetrics.afterMidnightTime);

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-8 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-charcoal border border-white/5 text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-white tracking-widest uppercase">REALITY <span className="text-neon-pink">CHECK</span></h2>
      </div>

      <div className="text-center mb-8 mt-2">
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Today's Scroll Cost</p>
        <h1 className="text-5xl font-black text-white tracking-tighter">
          {screenTime.hours}<span className="text-2xl text-neon-pink ml-1 mr-2">H</span>
          {Math.floor(screenTime.minutes)}<span className="text-2xl text-neon-pink ml-1">M</span>
        </h1>
      </div>

      <div className="space-y-4">
        
        {/* Sleep Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-5 rounded-[24px] border border-white/5 flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
            <Moon size={100} />
          </div>
          <div className="bg-blue-500/20 p-2.5 rounded-xl w-fit">
            <Moon size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Deep REM Lost</h3>
            <p className="text-2xl font-black text-white">{sleepLost} <span className="text-sm text-gray-500 font-bold">MINUTES</span></p>
          </div>
          <p className="text-sm text-blue-400 font-medium">You could have woken up energized.</p>
        </motion.div>

        {/* Workout Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-5 rounded-[24px] border border-white/5 flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
            <Dumbbell size={100} />
          </div>
          <div className="bg-orange-500/20 p-2.5 rounded-xl w-fit">
            <Dumbbell size={24} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Workouts Missed</h3>
            <p className="text-2xl font-black text-white">{workoutsLost} <span className="text-sm text-gray-500 font-bold">SESSIONS</span></p>
          </div>
          <p className="text-sm text-orange-400 font-medium">(Assuming 45 min per full workout)</p>
        </motion.div>

        {/* Brain Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-5 rounded-[24px] border border-white/5 flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
            <BookOpen size={100} />
          </div>
          <div className="bg-neon-cyan/20 p-2.5 rounded-xl w-fit">
            <BookOpen size={24} className="text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Knowledge Untapped</h3>
            <p className="text-2xl font-black text-white">{chaptersLost} <span className="text-sm text-gray-500 font-bold">CHAPTERS</span></p>
          </div>
          <p className="text-sm text-neon-cyan font-medium">You could have read half a book.</p>
        </motion.div>

      </div>
    </div>
  );
};

export default ReverseStats;
