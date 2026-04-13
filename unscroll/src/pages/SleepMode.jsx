import React from 'react';
import { motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { MoonStar, Unlock } from 'lucide-react';

const SleepMode = () => {
  const { setIsSleepModeActive, setCompanionMood, setCompanionMessage } = useBioState();

  const handleUnlock = () => {
    setIsSleepModeActive(false);
    setCompanionMood('concerned');
    setCompanionMessage('Breaking sleep cycle. Not recommended.');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-black flex flex-col items-center justify-center p-6 text-center w-full max-w-[400px] h-[850px] mx-auto rounded-[40px] sm:border-[8px] border-charcoal grayscale relative pointer-events-auto filter"
    >
      <div className="absolute inset-0 bg-blue-900/10 pointer-events-none mix-blend-multiply"></div>

      <MoonStar size={64} className="text-gray-400 mb-6 mx-auto animate-pulse-slow" />
      <h1 className="text-4xl font-black text-gray-200 mb-4 tracking-tighter">Sleep Mode <br/> Active.</h1>
      
      <p className="text-gray-500 font-medium max-w-[280px] mb-12">
        It is past midnight. Scrolling right now will cost you 30% of tomorrow's focus and increase burnout risk by 2x.
      </p>

      <div className="glass-panel p-6 rounded-3xl mb-12 w-full max-w-[280px]">
         <p className="text-sm text-gray-400 font-bold mb-2 uppercase tracking-widest">Brain state</p>
         <h2 className="text-2xl font-black text-white">Preparing for Deep Rest</h2>
         <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-gray-400"></div>
         </div>
      </div>

      <button 
        onClick={handleUnlock}
        className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold active:scale-95"
      >
         <Unlock size={16} /> Bypass Warning
      </button>

    </motion.div>
  );
};

export default SleepMode;
