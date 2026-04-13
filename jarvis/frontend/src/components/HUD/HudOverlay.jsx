// J.A.R.V.I.S — HUD Overlay
// Top status bar and decorative HUD frame elements
import { motion } from 'framer-motion';
import useJarvisStore from '../../stores/jarvisStore';

function StatusIndicator({ label, value, color = 'var(--neon-cyan)' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-[10px] mono-text" style={{ color }}>{value}</span>
    </div>
  );
}

export default function HudOverlay() {
  const { isConnected, stats, orbState } = useJarvisStore();

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      {/* Scan line */}
      <div className="scan-line" />

      {/* Top status bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(5, 8, 16, 0.9), transparent)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.06)',
        }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Left section */}
        <div className="flex items-center gap-6">
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full"
              style={{
                background: isConnected ? '#00ff88' : '#ff3366',
                boxShadow: `0 0 8px ${isConnected ? '#00ff88' : '#ff3366'}`,
              }} />
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
              J.A.R.V.I.S
            </span>
          </motion.div>

          <StatusIndicator label="Status" value={isConnected ? 'ONLINE' : 'OFFLINE'} color={isConnected ? '#00ff88' : '#ff3366'} />
          {stats && <StatusIndicator label="CPU" value={`${Math.round(stats.cpu_percent)}%`} color={stats.cpu_percent > 80 ? '#ff3366' : '#00d4ff'} />}
          {stats && <StatusIndicator label="RAM" value={`${Math.round(stats.ram_percent)}%`} color={stats.ram_percent > 80 ? '#ff3366' : '#00ff88'} />}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-6">
          <StatusIndicator label="Mode" value={orbState.toUpperCase()} />
          <div className="text-right">
            <p className="text-[11px] mono-text" style={{ color: 'var(--neon-cyan)' }}>{time}</p>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{date}</p>
          </div>
        </div>
      </motion.div>

      {/* Corner decorations */}
      {/* Top-left */}
      <div className="fixed top-12 left-4 z-40 pointer-events-none" style={{ opacity: 0.2 }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <path d="M 0 20 L 0 0 L 20 0" fill="none" stroke="var(--neon-cyan)" strokeWidth="1" />
          <circle cx="0" cy="0" r="2" fill="var(--neon-cyan)" />
        </svg>
      </div>
      {/* Top-right */}
      <div className="fixed top-12 right-4 z-40 pointer-events-none" style={{ opacity: 0.2 }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <path d="M 60 20 L 60 0 L 40 0" fill="none" stroke="var(--neon-cyan)" strokeWidth="1" />
          <circle cx="60" cy="0" r="2" fill="var(--neon-cyan)" />
        </svg>
      </div>
      {/* Bottom-left */}
      <div className="fixed bottom-4 left-4 z-40 pointer-events-none" style={{ opacity: 0.2 }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <path d="M 0 40 L 0 60 L 20 60" fill="none" stroke="var(--neon-cyan)" strokeWidth="1" />
        </svg>
      </div>
      {/* Bottom-right */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-none" style={{ opacity: 0.2 }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <path d="M 60 40 L 60 60 L 40 60" fill="none" stroke="var(--neon-cyan)" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
}
