import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Play, Upload, UserPlus, ZapOff } from 'lucide-react';

const IntentPopup = ({ onComplete }) => {
  const [selected, setSelected] = useState(null);

  const options = [
    { id: 'chat', label: 'Chat with a friend', icon: MessageSquare },
    { id: '1reel', label: 'Watch 1 reel', icon: Play },
    { id: 'upload', label: 'Upload content', icon: Upload },
    { id: 'reply', label: 'Reply to messages', icon: UserPlus },
    { id: 'bored', label: 'Just bored', icon: ZapOff },
  ];

  const handleSelect = (id) => {
    setSelected(id);
    setTimeout(() => {
      onComplete(id);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className="bg-charcoal/90 border border-white/10 rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-neon-purple shadow-neon-purple/50 blur-xl opacity-50"></div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center relative z-10">Hold up.</h2>
          <p className="text-gray-400 text-center mb-6 text-sm relative z-10">Why are you opening this app?</p>

          <div className="flex flex-col gap-3 relative z-10">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selected === opt.id;
              
              return (
                <button
                  key={opt.id}
                  onClick={() => !selected && handleSelect(opt.id)}
                  className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                    isSelected 
                      ? 'bg-neon-purple/20 text-white border border-neon-purple shadow-neon-purple' 
                      : selected 
                        ? 'bg-white/5 text-gray-500 opacity-50' 
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} className={isSelected ? 'text-neon-purple' : 'text-gray-400'} />
                  <span className="font-medium text-sm">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-600 text-center mt-6">An intentional user is a free user.</p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IntentPopup;
