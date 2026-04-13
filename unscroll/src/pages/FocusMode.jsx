import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RefreshCw, Focus } from 'lucide-react';

const FocusMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggle = () => setIsActive(!isActive);
  
  const reset = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="h-full flex flex-col justify-center items-center gap-10 px-6">
      <div className="text-center mt-[-100px]">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
          <Focus className="text-neon-cyan" size={32} /> Deep Focus
        </h1>
        <p className="text-gray-400 text-sm mt-2">Notifications blocked. Mind clear.</p>
      </div>

      <div className="relative flex justify-center items-center">
        {/* Glow effect behind timer */}
        <div className={`absolute w-64 h-64 blur-3xl opacity-30 rounded-full transition-colors duration-1000 ${isActive ? 'bg-neon-cyan' : 'bg-charcoal'}`}></div>
        
        {/* Timer Circle */}
        <motion.div 
          animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: isActive ? Infinity : 0, duration: 4, ease: "easeInOut" }}
          className="w-64 h-64 border-4 border-white/10 rounded-full flex flex-col justify-center items-center shadow-glass backdrop-blur-md relative z-10"
        >
          {/* Active border indicator */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle 
              cx="128" 
              cy="128" 
              r="124" 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="none"
              className={`text-neon-cyan transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              strokeDasharray="780"
              strokeDashoffset={780 - (780 * (seconds / (25 * 60)))}
            />
          </svg>

          <h2 className="text-6xl font-black text-white tabular-nums tracking-tighter">
            {formatTime(seconds)}
          </h2>
          <span className="text-gray-400 text-sm tracking-widest uppercase mt-2">
            Remaining
          </span>
        </motion.div>
      </div>

      <div className="flex gap-6 z-10">
        <button 
          onClick={toggle}
          className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all ${
            isActive 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-neon-cyan text-black hover:bg-neon-cyan/80 shadow-neon-blue'
          }`}
        >
          {isActive ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
          {isActive ? 'Pause' : 'Start Focus'}
        </button>

        <button 
          onClick={reset}
          className="p-4 rounded-full bg-charcoal text-gray-400 hover:text-white border border-white/5 transition-colors"
        >
          <RefreshCw />
        </button>
      </div>
      
      {/* Distraction block notice */}
      <div className="absolute bottom-32 text-center text-xs text-gray-500">
        All apps are locked during focus mode.
      </div>
    </div>
  );
};

export default FocusMode;
