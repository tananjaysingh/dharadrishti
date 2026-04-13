import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IntentPopup from '../components/IntentPopup';
import { useBioState } from '../context/BioStateContext';
import { Play } from 'lucide-react';

const MOCK_REELS = [
  { id: 1, c: 'bg-gradient-to-br from-indigo-500 to-purple-800' },
  { id: 2, c: 'bg-gradient-to-br from-blue-500 to-teal-800' },
  { id: 3, c: 'bg-gradient-to-br from-pink-500 to-rose-800' },
  { id: 4, c: 'bg-gradient-to-br from-emerald-500 to-green-800' },
];

const FeedPreview = () => {
  const [showIntent, setShowIntent] = useState(true);
  const [scrolledAmount, setScrolledAmount] = useState(0);
  const { setDopamineScore, setCompanionMood, setCompanionMessage } = useBioState();

  // Simulate scrolling through reels
  useEffect(() => {
    if (showIntent) return;

    // Fast dopamine increase while on feed
    const interval = setInterval(() => {
      setDopamineScore(prev => Math.min(100, prev + 5));
      setScrolledAmount(prev => prev + 1);
    }, 4000); // scrolled 1 reel every 4s

    return () => clearInterval(interval);
  }, [showIntent, setDopamineScore]);

  useEffect(() => {
    if (scrolledAmount > 3) {
      setCompanionMood('concerned');
      setCompanionMessage("You came to watch 1 reel. You watched 4.");
    }
    if (scrolledAmount > 6) {
      setCompanionMood('sleepy');
      setCompanionMessage("Screen is losing color. Brain needs rest.");
    }
  }, [scrolledAmount, setCompanionMood, setCompanionMessage]);

  // Feed Fade logic based on scrolled amount
  // As scrolledAmount increases, grayscale goes towards 100%, brightness drops
  const fadeScore = Math.min(100, (scrolledAmount * 12)); 
  const currentGrayscale = `${fadeScore}%`;
  const currentOpacity = Math.max(0.4, 1 - (fadeScore / 100));

  const handleIntentComplete = (intentId) => {
    setShowIntent(false);
    setCompanionMood('focused');
    setCompanionMessage(`Okay, staying intentional: ${intentId}`);
  };

  return (
    <div className="h-full relative overflow-hidden bg-black">
      {showIntent && <IntentPopup onComplete={handleIntentComplete} />}

      <div 
        className="h-full w-full overflow-y-auto snap-y snap-mandatory rounded-t-[32px] scroll-smooth transition-all duration-[2000ms]"
        style={{ 
          filter: `grayscale(${currentGrayscale})`,
          opacity: currentOpacity
        }}
      >
        {MOCK_REELS.map((reel) => (
          <div key={reel.id} className="w-full h-full snap-start snap-always relative flex justify-center items-center">
            {/* Reel simulated video background */}
            <div className={`absolute inset-0 ${reel.c} opacity-70`}></div>
            
            {/* Play icon overlay */}
            <div className="z-10 text-white/50 animate-pulse">
               <Play size={48} fill="currentColor" />
            </div>

            {/* Simulated UI info */}
            <div className="absolute bottom-24 left-4 z-20">
              <div className="w-32 h-4 glass-panel rounded-full mb-2"></div>
              <div className="w-48 h-3 bg-white/20 rounded-full mb-1"></div>
              <div className="w-40 h-3 bg-white/20 rounded-full"></div>
            </div>
            
            <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-4">
               <div className="w-10 h-10 glass-panel rounded-full relative"></div>
               <div className="w-10 h-10 glass-panel rounded-full relative"></div>
               <div className="w-10 h-10 glass-panel rounded-full relative"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Overlay when fadeScore is high */}
      {fadeScore > 50 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-30"
        >
          <p className="text-white text-lg font-bold bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            Dopamine dropping.<br/>Scroll is now boring.
          </p>
        </motion.div>
      )}

    </div>
  );
};

export default FeedPreview;
