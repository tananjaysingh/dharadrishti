import React from 'react';
import { useBioState } from '../context/BioStateContext';
import { MoonStar, Bell, Shield, Smartphone, LogOut } from 'lucide-react';

const Settings = () => {
  const { setIsSleepModeActive, hasCompletedOnboarding, setHasCompletedOnboarding } = useBioState();

  const handleToggleSleep = () => {
     setIsSleepModeActive(true);
  };
  
  const resetOnboarding = () => {
      setHasCompletedOnboarding(false);
  }

  return (
    <div className="h-full flex flex-col gap-6 px-4 pt-4">
      {/* Header */}
      <div className="pt-2 mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
      </div>

      <div className="flex flex-col gap-2">
         {/* Manual Trigger for Demo purposes */}
         <button 
           onClick={handleToggleSleep}
           className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all text-left"
         >
            <div className="flex items-center gap-3">
               <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400"><MoonStar size={20} /></div>
               <div className="flex flex-col">
                  <span className="text-white font-bold text-md">Force Sleep Mode</span>
                  <span className="text-gray-500 text-xs">Simulate past midnight trigger</span>
               </div>
            </div>
         </button>

         <button className="glass-panel p-4 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
            <div className="bg-neon-purple/20 p-2 rounded-xl text-neon-purple"><Bell size={20} /></div>
            <div className="flex flex-col">
               <span className="text-white font-bold text-md">Notifications</span>
               <span className="text-gray-500 text-xs">Manage your interrupts</span>
            </div>
         </button>

         <button className="glass-panel p-4 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400"><Shield size={20} /></div>
            <div className="flex flex-col">
               <span className="text-white font-bold text-md">Distraction Filters</span>
               <span className="text-gray-500 text-xs">Configure blocked apps</span>
            </div>
         </button>
         
         <button className="glass-panel p-4 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all text-left">
            <div className="bg-orange-500/20 p-2 rounded-xl text-orange-400"><Smartphone size={20} /></div>
            <div className="flex flex-col">
               <span className="text-white font-bold text-md">Hardware Bio-Sync</span>
               <span className="text-gray-500 text-xs">Connect smartwatch data</span>
            </div>
         </button>
      </div>

      {/* Dev Reset */}
      <div className="mt-8 mb-4 flex justify-center">
         <button 
           onClick={resetOnboarding}
           className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-bold text-sm px-4 py-2 border border-red-500/30 rounded-full"
         >
            <LogOut size={16} /> Reset App (Demo)
         </button>
      </div>

    </div>
  );
};

export default Settings;
