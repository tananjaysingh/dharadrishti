import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { Activity } from 'lucide-react';

const Splash = () => {
  const { setHasSeenSplash } = useBioState();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence timing
    const timers = [
      setTimeout(() => setPhase(1), 800),  // Show logo
      setTimeout(() => setPhase(2), 2000), // Show subtitle/loading
      setTimeout(() => setHasSeenSplash(true), 3500) // End splash
    ];
    return () => timers.forEach(clearTimeout);
  }, [setHasSeenSplash]);

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background glow */}
      <motion.div 
        className="absolute w-[300px] h-[300px] bg-neon-purple/20 rounded-full blur-[120px]"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute w-[200px] h-[200px] bg-neon-cyan/20 rounded-full blur-[90px] translate-y-20 translate-x-10"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="z-10 flex flex-col items-center">
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-charcoal border border-white/10 flex items-center justify-center shadow-glass relative group">
                {/* Rotating scanner ring */}
                <motion.div 
                  className="absolute inset-0 rounded-3xl border border-neon-cyan/30 border-t-neon-cyan"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <Activity size={40} className="text-neon-cyan drop-shadow-[0_0_15px_#00f0ff]" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter">UNSCROLL</h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <div className="flex gap-1.5 h-1">
                 {[0,1,2].map(i => (
                   <motion.div
                      key={i}
                      className="w-8 h-1 bg-neon-purple/50 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3], backgroundColor: ['#b026ff80', '#b026ff', '#b026ff80'] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                   />
                 ))}
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Neural Link Initiated</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Splash;
