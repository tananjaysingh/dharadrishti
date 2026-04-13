import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { CheckCircle2, Droplets } from 'lucide-react';

const MicroChallengePopup = () => {
  const { setShowMicroChallenge, setDopamineScore } = useBioState();
  const [completed, setCompleted] = useState(false);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (holding && progress < 100) {
      interval = setInterval(() => setProgress((p) => p + 2), 50);
    } else if (!holding && progress < 100) {
      setProgress(0);
      clearInterval(interval);
    }

    if (progress >= 100) {
      setCompleted(true);
      setTimeout(() => {
         setShowMicroChallenge(false);
         setDopamineScore(prev => Math.max(0, prev - 20)); // Reduce load
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [holding, progress, setShowMicroChallenge, setDopamineScore]);

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[70] flex flex-col justify-center items-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel border border-neon-cyan/30 rounded-3xl p-8 w-full shadow-neon-blue max-w-sm relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-neon-cyan/20 blur-3xl rounded-full pointer-events-none"></div>

        {!completed ? (
          <>
            <Droplets size={48} className="text-neon-cyan mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-black text-white mb-2">Break Time.</h2>
            <p className="text-gray-400 text-sm mb-10">Your dopamine level is over 85. <br/> Drink some water and take a breath.</p>

            <div className="relative">
              <button 
                onMouseDown={() => setHolding(true)}
                onMouseUp={() => setHolding(false)}
                onTouchStart={() => setHolding(true)}
                onTouchEnd={() => setHolding(false)}
                className="w-full h-16 bg-charcoal border border-white/10 rounded-full font-bold text-white relative overflow-hidden z-10 transition-transform active:scale-95 touch-none"
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-neon-cyan transition-all duration-75"
                  style={{ width: `${progress}%`, opacity: 0.3 }}
                ></div>
                <span className="relative z-10">{holding ? 'Keep holding...' : 'Hold for 5s to Continue'}</span>
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-6"
          >
            <CheckCircle2 size={64} className="text-green-400 mb-4" />
            <p className="text-xl font-bold text-white">Mindfulness check complete</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MicroChallengePopup;
