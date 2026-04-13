import React from 'react';
import { motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { Zap, Activity, Smartphone, Layers, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DopamineScore = () => {
  const { derivedMetrics, rawMetrics } = useBioState();
  const navigate = useNavigate();
  
  const score = Math.round(derivedMetrics.dopamineOverload);
  const isOverloaded = score > 80;

  return (
    <div className="h-full flex flex-col px-4 pt-2">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-charcoal border border-white/5 text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-white tracking-widest uppercase">DOPAMINE <span className="text-neon-cyan">LEVEL</span></h2>
      </div>

      {/* Main Score Display */}
      <div className="flex flex-col items-center justify-center my-8 relative">
        <div className={`absolute w-48 h-48 rounded-full blur-[80px] opacity-30 ${isOverloaded ? 'bg-neon-pink' : 'bg-neon-cyan'}`}></div>
        <motion.div 
          className="relative w-40 h-40 flex items-center justify-center rounded-full border-4 border-charcoal bg-background shadow-glass"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
             <circle 
                cx="80" cy="80" r="74"
                className="stroke-gray-800" strokeWidth="12" fill="transparent"
             />
             <motion.circle 
                cx="80" cy="80" r="74"
                className={`${isOverloaded ? 'stroke-neon-pink' : 'stroke-neon-cyan'} drop-shadow-lg`}
                strokeWidth="12" fill="transparent"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 74}
                initial={{ strokeDashoffset: 2 * Math.PI * 74 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 74) - (score / 100) * (2 * Math.PI * 74) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
             />
          </svg>
          <div className="flex flex-col items-center z-10">
            <span className={`text-5xl font-black ${isOverloaded ? 'text-neon-pink' : 'text-neon-cyan'}`}>{score}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Status</span>
          </div>
        </motion.div>
        <motion.div 
          className="mt-6 px-4 py-2 rounded-full border border-white/10 bg-charcoal flex items-center gap-2"
          animate={isOverloaded ? { y: [0, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
           {isOverloaded ? <AlertCircle className="text-neon-pink" size={16}/> : <Activity className="text-neon-cyan" size={16}/>}
           <span className={`text-xs font-bold uppercase tracking-[0.2em] ${isOverloaded ? 'text-neon-pink' : 'text-neon-cyan'}`}>
             {isOverloaded ? 'Overload Risk' : 'Optimal Balance'}
           </span>
        </motion.div>
      </div>

      {/* Contributing Factors */}
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Contributing Factors</h3>
      <div className="flex flex-col gap-3">
        
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-neon-purple/10 p-3 rounded-xl">
             <Smartphone size={20} className="text-neon-purple" />
          </div>
          <div className="flex-1">
             <p className="text-white font-bold text-sm uppercase tracking-wide">Continuous Scroll</p>
             <p className="text-gray-500 text-xs mt-0.5">{rawMetrics.scrollingDuration} min straight</p>
          </div>
          <div className="text-right">
             <span className="text-neon-purple font-black text-lg">+{Math.min(30, Math.floor(rawMetrics.scrollingDuration * 0.5))}</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-yellow-400/10 p-3 rounded-xl">
             <Layers size={20} className="text-yellow-400" />
          </div>
          <div className="flex-1">
             <p className="text-white font-bold text-sm uppercase tracking-wide">Rapid App Switching</p>
             <p className="text-gray-500 text-xs mt-0.5">{rawMetrics.appSwitches} switches</p>
          </div>
          <div className="text-right">
             <span className="text-yellow-400 font-black text-lg">+{Math.min(40, Math.floor(rawMetrics.appSwitches * 0.2))}</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-neon-cyan/10 p-3 rounded-xl">
             <Zap size={20} className="text-neon-cyan" />
          </div>
          <div className="flex-1">
             <p className="text-white font-bold text-sm uppercase tracking-wide">Reels Watched</p>
             <p className="text-gray-500 text-xs mt-0.5">{rawMetrics.reelsWatched} videos</p>
          </div>
          <div className="text-right">
             <span className="text-neon-cyan font-black text-lg">+{Math.min(30, Math.floor(rawMetrics.reelsWatched * 0.3))}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DopamineScore;
