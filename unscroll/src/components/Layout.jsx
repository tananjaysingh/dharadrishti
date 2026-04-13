import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Layers, User, Focus, Settings } from 'lucide-react';
import VirtualCompanion from './VirtualCompanion';
import MicroChallengePopup from './MicroChallengePopup';
import RecommendationPopup from './RecommendationPopup';
import { AnimatePresence, motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';

const Layout = () => {
  const location = useLocation();
  const { showMicroChallenge, dimScreenActive } = useBioState();

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Layers, path: '/feed', label: 'Feed' },
    { icon: Focus, path: '/focus', label: 'Focus' },
    { icon: User, path: '/profile', label: 'Profile' },
    { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-black flex justify-center items-center overflow-hidden p-4 sm:p-8 relative">
      <div className="w-full max-w-[400px] h-[850px] max-h-[100dvh] bg-background rounded-[40px] sm:border-[8px] border-charcoal shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Notch */}
        <div className="absolute top-0 w-full h-8 z-50 flex justify-center">
          <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
        </div>

        {/* Global Overlays */}
        <VirtualCompanion />
        {showMicroChallenge && <MicroChallengePopup />}
        <RecommendationPopup />
        
        {/* Eye Strain Overlay */}
        {dimScreenActive && (
           <div className="absolute inset-0 pointer-events-none z-30 transition-all duration-1000 bg-amber-900/30 mix-blend-multiply"></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-24 pt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full h-20 glass-panel border-t border-white/5 z-40 px-6 rounded-b-[32px] sm:rounded-b-[32px]">
          <div className="flex justify-between items-center h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link to={item.path} key={item.path} className="flex flex-col items-center gap-1">
                  <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-neon-purple/20 text-neon-purple shadow-neon-purple' : 'text-gray-500 hover:text-white'}`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {isActive && <div className="w-1 h-1 rounded-full bg-neon-purple mt-1 blur-[1px]"></div>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
