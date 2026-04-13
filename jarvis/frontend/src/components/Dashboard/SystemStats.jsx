// J.A.R.V.I.S — System Stats Dashboard
// Displays CPU, RAM, Disk, Battery stats with circular progress indicators
import { motion } from 'framer-motion';
import useJarvisStore from '../../stores/jarvisStore';

function CircularGauge({ value, label, color, icon, size = 100 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="circular-progress" width={size} height={size}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(0, 212, 255, 0.08)"
            strokeWidth="4"
          />
          {/* Value ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${color}66)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold mono-text" style={{ color }}>
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
  );
}

function StatItem({ label, value, unit, color = 'var(--neon-cyan)' }) {
  return (
    <div className="flex justify-between items-center py-2 border-b"
      style={{ borderColor: 'rgba(0, 212, 255, 0.06)' }}>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="mono-text text-sm" style={{ color }}>
        {value}<span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{unit}</span>
      </span>
    </div>
  );
}

export default function SystemStats() {
  const { stats } = useJarvisStore();

  if (!stats) {
    return (
      <div className="glass-panel p-6">
        <h3 className="heading-lg text-sm mb-4">System Status</h3>
        <div className="flex items-center justify-center py-8">
          <motion.div
            className="w-6 h-6 rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--neon-cyan)', borderTopColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="ml-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            Connecting to system...
          </span>
        </div>
      </div>
    );
  }

  const cpuColor = stats.cpu_percent > 80 ? '#ff3366' : stats.cpu_percent > 50 ? '#ff8800' : '#00d4ff';
  const ramColor = stats.ram_percent > 80 ? '#ff3366' : stats.ram_percent > 50 ? '#ff8800' : '#00ff88';
  const diskColor = stats.disk_percent > 90 ? '#ff3366' : stats.disk_percent > 70 ? '#ff8800' : '#7b2fdb';

  const uptimeHrs = Math.floor(stats.uptime_seconds / 3600);
  const uptimeMins = Math.floor((stats.uptime_seconds % 3600) / 60);

  return (
    <div className="glass-panel p-6">
      <h3 className="heading-lg text-sm mb-6">System Status</h3>

      {/* Gauges */}
      <div className="flex justify-around mb-6">
        <CircularGauge value={stats.cpu_percent} label="CPU" color={cpuColor} />
        <CircularGauge value={stats.ram_percent} label="RAM" color={ramColor} />
        <CircularGauge value={stats.disk_percent} label="Disk" color={diskColor} />
        {stats.battery_percent !== null && (
          <CircularGauge
            value={stats.battery_percent}
            label={stats.battery_charging ? 'Charging' : 'Battery'}
            color={stats.battery_percent < 20 ? '#ff3366' : '#00ff88'}
          />
        )}
      </div>

      {/* Detail stats */}
      <div className="space-y-0">
        <StatItem
          label="RAM Usage"
          value={`${stats.ram_used_gb} / ${stats.ram_total_gb}`}
          unit="GB"
          color={ramColor}
        />
        <StatItem
          label="Disk Usage"
          value={`${stats.disk_used_gb} / ${stats.disk_total_gb}`}
          unit="GB"
          color={diskColor}
        />
        {stats.cpu_temp && (
          <StatItem
            label="CPU Temp"
            value={Math.round(stats.cpu_temp)}
            unit="°C"
            color={stats.cpu_temp > 80 ? '#ff3366' : '#00d4ff'}
          />
        )}
        <StatItem
          label="Uptime"
          value={`${uptimeHrs}h ${uptimeMins}m`}
          unit=""
        />
        <StatItem
          label="Network"
          value={stats.network_up ? 'Online' : 'Offline'}
          unit=""
          color={stats.network_up ? '#00ff88' : '#ff3366'}
        />
      </div>
    </div>
  );
}
