import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { Wind, Target, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecommendationPopup = () => {
  const { 
    breathingExerciseRecommended, setBreathingExerciseRecommended,
    focusModeRecommended, setFocusModeRecommended 
  } = useBioState();
  const navigate = useNavigate();

  const handleDismissBreathing = () => {
    setBreathingExerciseRecommended(false);
  };

  const handleDismissFocus = () => {
    setFocusModeRecommended(false);
  };

  const startFocusMode = () => {
    setFocusModeRecommended(false);
    navigate('/focus');
  };

  const visible = breathingExerciseRecommended || focusModeRecommended;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-charcoal border border-white/10 rounded-3xl p-6 w-[90%] sm:max-w-md shadow-2xl relative overflow-hidden"
          >
            {breathingExerciseRecommended && (
              <>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/20 blur-[50px] rounded-full"></div>
                
                <button 
                  onClick={handleDismissBreathing}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-4 mt-2 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                    <Wind size={32} className="text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">High Stress Detected</h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Your biometric indicators suggest elevated stress and shallow breathing. Take a 60-second break to recalibrate your nervous system.
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleDismissBreathing}
                    className="w-full py-4 mt-2 bg-neon-cyan text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] transition-all"
                  >
                    Start Breathing Exercise
                  </button>
                  <button 
                    onClick={handleDismissBreathing}
                    className="text-xs text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors"
                  >
                    Dismiss Warning
                  </button>
                </div>
              </>
            )}

            {!breathingExerciseRecommended && focusModeRecommended && (
              <>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-[50px] rounded-full"></div>
                
                <button 
                  onClick={handleDismissFocus}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-4 mt-2 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-orange-500 opacity-20"
                    />
                    <Target size={32} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">Focus Instability</h3>
                    <p className="text-sm text-gray-400 mt-2">
                      You are rapidly switching contexts. Your mental fatigue will spike if you continue. We recommend entering Focus Mode.
                    </p>
                  </div>
                  
                  <button 
                    onClick={startFocusMode}
                    className="w-full py-4 mt-2 border-2 border-orange-500 text-orange-500 font-black uppercase tracking-widest rounded-xl hover:bg-orange-500/10 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  >
                    Activate Focus Mode
                  </button>
                  <button 
                    onClick={handleDismissFocus}
                    className="text-xs text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors"
                  >
                    Ignore Warning
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecommendationPopup;
