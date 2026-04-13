import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { MessageCircle } from 'lucide-react';

const VirtualCompanion = () => {
  const { dopamineScore, companionMood, companionMessage } = useBioState();
  const [showMessage, setShowMessage] = useState(false);

  // Periodically show the companion's message randomly or when score gets high
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5 || dopamineScore > 80) {
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 4000);
      }
    }, 15000); // Check every 15s

    // Auto-show message initially
    setTimeout(() => setShowMessage(true), 2000);
    setTimeout(() => setShowMessage(false), 6000);

    return () => clearInterval(interval);
  }, [dopamineScore]);

  // Determine eyes/face based on mood
  const renderFace = () => {
    if (dopamineScore > 85) return "😵‍💫"; // Overloaded
    if (dopamineScore > 70) return "👀"; // Stimulated
    if (companionMood === 'sleepy') return "😴";
    return "😸"; // Calm/Happy
  };

  return (
    <div className="absolute top-[4.5rem] right-6 z-50 pointer-events-none flex flex-col items-end">
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="mb-2 bg-charcoal/90 backdrop-blur-md text-white text-xs font-medium px-3 py-2 border border-neon-purple/30 rounded-2xl shadow-neon-purple pointer-events-auto max-w-[150px]"
          >
            {companionMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative group pointer-events-auto cursor-pointer"
        onClick={() => setShowMessage(true)}
      >
        {/* Cat Body */}
        <div className="w-12 h-12 bg-black rounded-full border border-neon-purple shadow-neon-purple flex justify-center items-center text-2xl relative overflow-hidden">
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-neon-purple/20 blur-md pointer-events-none"></div>
          
          <span className="relative z-10">{renderFace()}</span>
        </div>
        
        {/* Ears */}
        <div className="absolute -top-1.5 -left-1 w-4 h-4 bg-black border-t border-l border-neon-purple rounded-tl-sm transform rotate-[-15deg] shadow-neon-purple/50"></div>
        <div className="absolute -top-1.5 -right-1 w-4 h-4 bg-black border-t border-r border-neon-purple rounded-tr-sm transform rotate-[15deg] shadow-neon-purple/50"></div>
      </motion.div>
    </div>
  );
};

export default VirtualCompanion;
