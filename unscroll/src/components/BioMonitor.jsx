import React from 'react';
import { motion } from 'framer-motion';
import { useBioState } from '../context/BioStateContext';
import { 
  Moon, Activity, Zap, Target, Brain, 
  Eye, BellRing, TrendingDown, Clock, Layers 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MetricRing = ({ value, icon: Icon, label, invertColor = false }) => {
  // Color determination based on 'bad' value logic
  const badValue = invertColor ? 100 - value : value;

  let colorClass = 'text-neon-cyan';
  let strokeClass = 'stroke-neon-cyan';
  let bgClass = 'bg-neon-cyan/10';

  if (badValue > 75) {
    colorClass = 'text-neon-pink';
    strokeClass = 'stroke-neon-pink';
    bgClass = 'bg-neon-pink/10';
  } else if (badValue > 40) {
    colorClass = 'text-yellow-400';
    strokeClass = 'stroke-yellow-400';
    bgClass = 'bg-yellow-400/10';
  }

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${bgClass} border border-white/5 relative overflow-hidden group w-full aspect-square max-h-32`}>
      <div className="relative w-12 h-12 flex items-center justify-center mb-1">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle 
            cx="24" cy="24" r={radius}
            className="stroke-gray-800" strokeWidth="3" fill="transparent"
          />
          <motion.circle 
            cx="24" cy="24" r={radius}
            className={`${strokeClass} drop-shadow-lg transition-all duration-1000 ease-out`} 
            strokeWidth="3" fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
          />
        </svg>
        <Icon size={16} className={`${colorClass} z-10 drop-shadow-[0_0_8px_currentColor]`} />
      </div>
      <span className="text-white font-bold text-sm tracking-widest">{Math.round(value)}%</span>
      <span className="text-gray-400 text-[9px] uppercase text-center font-bold tracking-widest mt-0.5 w-full truncate px-1">
        {label}
      </span>
      {/* Alert dot if severe */}
      {badValue > 75 && (
        <motion.div 
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-neon-pink shadow-[0_0_8px_#ff00ff]"
        />
      )}
    </div>
  );
};

const BioMonitor = () => {
  const { derivedMetrics } = useBioState();

  const metricsList = [
    { key: 'sleepDebt', label: 'SLEEP DEBT', icon: Moon },
    { key: 'stressLevel', label: 'STRESS', icon: Activity },
    { key: 'dopamineOverload', label: 'DOPAMINE', icon: Zap },
    { key: 'focusStability', label: 'FOCUS', icon: Target, invertColor: true },
    { key: 'mentalFatigue', label: 'FATIGUE', icon: Brain },
    { key: 'eyeStrainRisk', label: 'EYE STRAIN', icon: Eye },
    { key: 'notificationOverload', label: 'ALERTS', icon: BellRing },
    { key: 'productivityLoss', label: 'PROD LOSS', icon: TrendingDown },
    { key: 'lateNightImpact', label: 'NIGHT SESH', icon: Clock },
    { key: 'rapidAppSwitching', label: 'SWITCHING', icon: Layers },
  ];

  // Pick highest risk
  const highestRisk = [...metricsList].sort((a, b) => {
    const valA = a.invertColor ? 100 - derivedMetrics[a.key] : derivedMetrics[a.key];
    const valB = b.invertColor ? 100 - derivedMetrics[b.key] : derivedMetrics[b.key];
    return valB - valA;
  })[0];

  const heroValue = derivedMetrics[highestRisk.key];
  const heroIsBad = highestRisk.invertColor ? (100 - heroValue > 75) : (heroValue > 75);
  const heroColor = heroIsBad ? 'text-neon-pink' : 'text-neon-cyan';
  const heroBg = heroIsBad ? 'bg-neon-pink' : 'bg-neon-cyan';

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-2">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-widest uppercase">
            <Activity className="text-neon-cyan" size={20}/> BIO-MONITOR
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-charcoal px-2 py-1 rounded-full border border-white/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Hero Metric */}
      <div className="relative p-5 rounded-3xl overflow-hidden glass-panel border border-white/10 group">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] rounded-full opacity-20 pointer-events-none transition-colors duration-1000 ${heroBg}`}></div>
        
        <div className="relative z-10 flex flex-row items-center justify-between gap-4">
          <div className="flex flex-col flex-1">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 shadow-black drop-shadow-lg">Primary Risk Factor</span>
            <span className="text-2xl font-black text-white capitalize leading-tight">{highestRisk.label.toLowerCase()}</span>
            <span className={`text-xs mt-1 font-bold tracking-widest uppercase ${heroColor}`}>
              {heroIsBad ? 'CRITICAL LEVEL' : 'OPTIMAL LEVEL'}
            </span>
          </div>

          <div className="flex items-end justify-center">
            <span className={`text-5xl font-black ${heroColor} drop-shadow-[0_0_12px_currentColor]`}>{Math.round(heroValue)}</span>
            <span className="text-lg font-bold text-gray-400 ml-1 mb-1">%</span>
          </div>
        </div>

        {/* Hero Sparkline Decoration (Animated bars) */}
        <div className="mt-4 h-10 w-full flex items-end justify-between gap-[2px] opacity-40">
           {[...Array(30)].map((_, i) => {
             const randomHeight = Math.random() * 100;
             return (
               <motion.div 
                 key={i}
                 className={`flex-1 rounded-sm ${heroBg}`}
                 initial={{ height: `${randomHeight}%` }}
                 animate={{ height: ['20%', '100%', '20%'] }}
                 transition={{ 
                   duration: Math.random() * 1.5 + 0.5, 
                   repeat: Infinity, 
                   ease: "easeInOut",
                   delay: Math.random() * 0.5
                 }}
               />
             );
           })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metricsList.map(metric => {
          const ring = (
            <MetricRing 
              key={metric.key} 
              value={derivedMetrics[metric.key]} 
              icon={metric.icon} 
              label={metric.label}
              invertColor={metric.invertColor}
            />
          );

          if (metric.key === 'dopamineOverload') {
            return (
              <Link to="/dopamine-score" key={metric.key} className="block hover:scale-105 transition-transform duration-300">
                {ring}
              </Link>
            );
          }
          return ring;
        })}
      </div>
    </div>
  );
};

export default BioMonitor;
