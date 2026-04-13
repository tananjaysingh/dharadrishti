import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { ArrowRight, Check } from 'lucide-react';

const Onboarding = () => {
  const { setHasCompletedOnboarding } = useBioState();
  const [step, setStep] = useState(0);

  const complete = () => setHasCompletedOnboarding(true);

  return (
    <div className="h-full bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden w-full max-w-[400px] h-[850px] mx-auto rounded-[40px] sm:border-[8px] border-charcoal text-center">
      
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 mb-4 rounded-full bg-neon-purple/20 blur-xl absolute z-0 pointer-events-none"></div>
            <h1 className="text-5xl font-black text-white relative z-10">Unscroll.</h1>
            <p className="text-gray-400 font-medium relative z-10 max-w-[250px]">
              Take back your dopamine. Make scrolling intentional.
            </p>
            <button 
              onClick={() => setStep(1)}
              className="mt-12 w-16 h-16 rounded-full bg-white text-black flex justify-center items-center shadow-glass hover:scale-105 transition-transform"
            >
              <ArrowRight size={24} />
            </button>
          </motion.div>
        )}

         {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center w-full"
          >
            {/* Mock Virtual Companion Intro */}
            <div className="w-20 h-20 bg-black rounded-full border border-neon-purple shadow-neon-purple flex justify-center items-center text-4xl relative overflow-hidden mb-8">
              <div className="absolute inset-0 bg-neon-purple/30 blur-md"></div>
              <span className="relative z-10 animate-bounce">😸</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Meet your Mind-Guide.</h2>
            <p className="text-gray-400 text-sm mb-12">I'll be watching your dopamine loads and keeping you mindful before you doomscroll.</p>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-neon-purple text-white font-bold py-4 rounded-2xl shadow-neon-purple transition-all active:scale-95"
            >
              Nice to meet you
            </button>
          </motion.div>
        )}

        {step === 2 && (
           <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-start w-full text-left"
          >
            <h2 className="text-3xl font-black text-white mb-2 leading-tight">What's your weak spot?</h2>
            <p className="text-gray-400 text-sm mb-8">We will tailor the intent checks for you.</p>

            <div className="flex flex-col gap-3 w-full mb-12">
              {['Late night TikTok', 'Infinite Instagram Reels', 'Stress-scrolling X', 'YouTube Rabbit Holes'].map((opt, i) => (
                <button key={i} className="w-full bg-charcoal border border-white/5 rounded-2xl p-4 text-gray-300 font-medium hover:border-neon-cyan hover:text-neon-cyan transition-colors flex justify-between items-center group">
                  {opt}
                  <Check size={18} className="opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            <button 
              onClick={complete}
              className="w-full bg-neon-cyan text-black font-bold py-4 rounded-2xl shadow-neon-blue transition-all active:scale-95"
            >
              Finish Setup
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
