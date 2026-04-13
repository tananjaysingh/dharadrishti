import React from 'react';
import { motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { Activity, BellRing, Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DailyInsights = () => {
  const { derivedMetrics, rawMetrics } = useBioState();
  const navigate = useNavigate();

  // Simulated day timeline data
  const timelineData = [
    { hour: '8A', active: 20 },
    { hour: '10A', active: 45 },
    { hour: '12P', active: 30 },
    { hour: '2P', active: 60 },
    { hour: '4P', active: 80 },
    { hour: '6P', active: 40 },
    { hour: '8P', active: 90 },
    { hour: '10P', active: 100 },
  ];

  return (
    <div className="h-full flex flex-col px-4 pt-2 pb-8 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-charcoal border border-white/5 text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-white tracking-widest uppercase">DAILY <span className="text-neon-cyan">INSIGHTS</span></h2>
      </div>

      {/* Goal Progress Ring */}
      <div className="glass-panel p-5 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-between">
         <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/10 blur-[50px] rounded-full translate-x-10 -translate-y-10"></div>
         <div>
            <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-1">Focus Goal</h3>
            <p className="text-3xl font-black text-white">45%</p>
            <p className="text-xs text-neon-cyan/70 font-semibold mt-1">2h 15m remaining</p>
         </div>
         <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="36" className="stroke-white/10" strokeWidth="8" fill="transparent" />
              <motion.circle 
                cx="40" cy="40" r="36" 
                className="stroke-neon-cyan drop-shadow-[0_0_8px_#00f0ff]" 
                strokeWidth="8" fill="transparent" strokeDasharray="226" 
                initial={{ strokeDashoffset: 226 }}
                animate={{ strokeDashoffset: 226 - (45 / 100) * 226 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <Target size={20} className="text-neon-cyan" />
            </div>
         </div>
      </div>

      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Activity Timeline</h3>

      {/* Custom Bar Chart */}
      <div className="glass-panel p-5 rounded-[24px] mb-6 border border-white/5">
         <div className="flex items-end justify-between h-40 gap-2 mb-2">
            {timelineData.map((d, i) => {
               const isHigh = d.active > 75;
               return (
                 <div key={i} className="flex flex-col items-center flex-1 gap-2">
                   <div className="w-full bg-white/5 rounded-t-sm h-full flex items-end relative group">
                      <motion.div 
                        className={`w-full rounded-t-sm ${isHigh ? 'bg-neon-pink' : 'bg-neon-purple'}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${d.active}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.active}%
                      </div>
                   </div>
                   <span className="text-[9px] font-bold text-gray-500">{d.hour}</span>
                 </div>
               )
            })}
         </div>
         <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-neon-purple"></div> Normal</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_5px_#ff00ff]"></div> High Activity</div>
         </div>
      </div>

      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Alerts</h3>

      {/* Warnings List */}
      <div className="flex flex-col gap-3">
        <div className="glass-panel p-4 rounded-2xl flex items-start gap-3 border border-neon-pink/20 bg-neon-pink/5">
           <div className="mt-0.5"><BellRing size={16} className="text-neon-pink" /></div>
           <div>
              <p className="text-sm font-bold text-white">Dopamine Spike Detected</p>
              <p className="text-xs text-gray-400 mt-1">Rapid app switching triggered a warning.</p>
           </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-start gap-3 border border-yellow-500/20 bg-yellow-500/5">
           <div className="mt-0.5"><Activity size={16} className="text-yellow-500" /></div>
           <div>
              <p className="text-sm font-bold text-white">Stress Level Elevated</p>
              <p className="text-xs text-gray-400 mt-1">{rawMetrics.notifications} notifications received in the last hour.</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default DailyInsights;
