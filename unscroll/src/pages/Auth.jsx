import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { Activity, Apple, Mail, Fingerprint } from 'lucide-react';

const Auth = () => {
  const { setHasAuthenticated } = useBioState();
  const [isScanning, setIsScanning] = useState(false);

  const handleNeuralConnect = () => {
    setIsScanning(true);
    setTimeout(() => {
      setHasAuthenticated(true);
    }, 2000);
  };

  return (
    <div className="h-full w-full bg-black flex flex-col justify-between p-6 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-neon-cyan/10 rounded-full blur-[100px]" />

      {/* Top Branding */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-12 z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-charcoal border border-white/10 flex items-center justify-center mb-6">
          <Activity className="text-neon-cyan" size={24} />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 leading-tight">TAKE BACK<br/>YOUR MIND.</h1>
        <p className="text-gray-400 text-sm">Sign in to start bio-monitoring.</p>
      </motion.div>

      {/* Auth Actions */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4 mb-12 z-10 w-full"
      >
        
        {/* Fake Primary Auth - "Neural Link" / FaceID style */}
        <button 
          onClick={handleNeuralConnect}
          className="relative w-full overflow-hidden p-[2px] rounded-2xl group focus:outline-none"
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity ${isScanning ? 'animate-pulse' : ''}`}></div>
          <div className="relative bg-charcoal w-full h-full rounded-[14px] p-4 flex items-center justify-center gap-3">
             {isScanning ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Activity className="text-neon-cyan" />
                </motion.div>
             ) : (
                <Fingerprint className="text-white" />
             )}
             <span className="text-white font-bold tracking-widest uppercase text-sm">
               {isScanning ? 'Scanning Bio-Signature...' : 'Connect Identity'}
             </span>
          </div>
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">or use</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          onClick={() => setHasAuthenticated(true)}
          className="w-full glass-panel p-4 rounded-2xl flex items-center justify-center gap-3 border border-white/5 hover:border-white/20 transition-all font-semibold text-white/90"
        >
          <Apple size={20} /> Continue with Apple
        </button>
        
        <button 
          onClick={() => setHasAuthenticated(true)}
          className="w-full glass-panel p-4 rounded-2xl flex items-center justify-center gap-3 border border-white/5 hover:border-white/20 transition-all font-semibold text-white/90"
        >
          <Mail size={20} /> Continue with Mail
        </button>

      </motion.div>

    </div>
  );
};

export default Auth;
