import React from 'react';
import { useBioState } from '../context/BioStateContext';
import { Moon, BookOpen, Flame, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BioMonitor from '../components/BioMonitor';

const Dashboard = () => {
  const { screenTime } = useBioState();

  return (
    <div className="h-full flex flex-col gap-6 px-4">
      {/* BioMonitor Core System */}
      <div className="pt-4">
        <BioMonitor />
      </div>

      {/* Reverse Screen Time Stats */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white">Instead of {screenTime.hours}h {Math.round(screenTime.minutes)}m...</h3>
          <Link to="/reverse-stats" className="text-neon-cyan flex items-center gap-1 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">
            Details <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-neon-cyan/10 p-2 rounded-xl w-fit">
              <Moon size={20} className="text-neon-cyan" />
            </div>
            <div>
              <p className="text-white font-bold text-xl uppercase tracking-widest">Sleep</p>
              <p className="text-gray-400 text-xs mt-1">You lost 45m of deep sleep</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-neon-purple/10 p-2 rounded-xl w-fit">
              <Zap size={20} className="text-neon-purple" />
            </div>
            <div>
              <p className="text-white font-bold text-xl uppercase tracking-widest">Workout</p>
              <p className="text-gray-400 text-xs mt-1">Could have finished 1 session</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-neon-blue/10 p-2 rounded-xl w-fit">
              <BookOpen size={20} className="text-neon-blue" />
            </div>
            <div>
              <p className="text-white font-bold text-xl uppercase tracking-widest">Reading</p>
              <p className="text-gray-400 text-xs mt-1">Could have read 40 pages</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2">
            <div className="bg-orange-500/10 p-2 rounded-xl w-fit">
              <Flame size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-white font-bold text-xl uppercase tracking-widest">Streak</p>
              <p className="text-gray-400 text-xs mt-1">Your focus streak is dropping</p>
            </div>
          </div>

        </div>
      </div>

      {/* Quick actionable area */}
      <div className="mt-4 text-center pb-8">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">System Online &middot; Neural Link Active</p>
      </div>
    </div>
  );
};

export default Dashboard;
