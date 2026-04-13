// J.A.R.V.I.S — Mobile Dashboard App
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

const API_BASE = '/api';

// ── Store ──
const useStore = create((set) => ({
  isConnected: false,
  stats: null,
  messages: [],
  isPaired: false,
  setConnected: (v) => set({ isConnected: v }),
  setStats: (s) => set({ stats: s }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages.slice(-50), { ...m, id: Date.now() }] })),
  setPaired: (v) => set({ isPaired: v }),
}));

// ── API ──
async function apiCall(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  return res.json();
}

// ── Slider Component ──
function ControlSlider({ label, value, onChange, icon, color = '#00d4ff' }) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs tracking-wider uppercase" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>{icon} {label}</span>
        <span className="text-lg font-bold" style={{ color, fontFamily: 'var(--font-data)' }}>{value}%</span>
      </div>
      <input
        type="range" min="0" max="100" value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${value}%, rgba(0,212,255,0.1) ${value}%)`,
          outline: 'none',
        }}
      />
    </div>
  );
}

// ── Quick Action Button ──
function ActionBtn({ icon, label, color, onClick }) {
  return (
    <motion.button
      className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl cursor-pointer"
      style={{ background: `${color}10`, border: `1px solid ${color}22` }}
      whileTap={{ scale: 0.9, background: `${color}25` }}
      onClick={onClick}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>{label}</span>
    </motion.button>
  );
}

// ── Stat Card ──
function StatCard({ label, value, unit, color = '#00d4ff', percent }) {
  return (
    <div className="glass-panel p-4 text-center">
      <p className="text-[10px] tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color, fontFamily: 'var(--font-data)' }}>
        {value}<span className="text-sm ml-1">{unit}</span>
      </p>
      {percent !== undefined && (
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,212,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { isConnected, stats, messages, setConnected, setStats, addMessage } = useStore();
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(50);
  const [command, setCommand] = useState('');
  const [tab, setTab] = useState('control');
  const wsRef = useRef(null);

  // WebSocket
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`ws://${window.location.hostname}:8400/ws?client_id=mobile-${Date.now().toString(36)}&client_type=mobile`);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'system_stats') setStats(msg.data);
          else if (msg.type === 'response') addMessage({ role: 'assistant', content: msg.data.response_text, timestamp: new Date().toISOString() });
        } catch (err) {}
      };
      wsRef.current = ws;
    };
    connect();
    return () => wsRef.current?.close();
  }, []);

  const sendCmd = useCallback((text) => {
    if (wsRef.current?.readyState === 1) {
      addMessage({ role: 'user', content: text, timestamp: new Date().toISOString() });
      wsRef.current.send(JSON.stringify({ type: 'command', data: { text } }));
    }
  }, []);

  const handleVolume = async (v) => { setVolume(v); await apiCall('/system/volume', { method: 'POST', body: JSON.stringify({ level: v }) }); };
  const handleBrightness = async (v) => { setBrightness(v); await apiCall('/system/brightness', { method: 'POST', body: JSON.stringify({ level: v }) }); };

  return (
    <div className="min-h-screen min-h-dvh px-4 py-6 pb-24">
      {/* Header */}
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-lg font-bold tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, #00d4ff, #0066ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          J.A.R.V.I.S
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full" style={{ background: isConnected ? '#00ff88' : '#ff3366', boxShadow: `0 0 8px ${isConnected ? '#00ff88' : '#ff3366'}` }} />
          <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </motion.div>

      {/* Tab Nav */}
      <div className="flex gap-2 mb-6">
        {[{ id: 'control', label: '🎛️ Control' }, { id: 'status', label: '📊 Status' }, { id: 'terminal', label: '💬 Terminal' }].map((t) => (
          <motion.button
            key={t.id}
            className="flex-1 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase cursor-pointer"
            style={{
              fontFamily: 'var(--font-heading)',
              background: tab === t.id ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.03)',
              border: tab === t.id ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(0,212,255,0.08)',
              color: tab === t.id ? '#00d4ff' : 'var(--text-muted)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Control Tab */}
        {tab === 'control' && (
          <motion.div key="control" className="space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <ControlSlider label="Volume" value={volume} onChange={handleVolume} icon="🔊" color="#00d4ff" />
            <ControlSlider label="Brightness" value={brightness} onChange={handleBrightness} icon="☀️" color="#ffd700" />

            <div className="grid grid-cols-3 gap-3">
              <ActionBtn icon="🔒" label="Lock" color="#ff8800" onClick={() => apiCall('/system/lock', { method: 'POST' })} />
              <ActionBtn icon="📸" label="Screenshot" color="#00ff88" onClick={() => apiCall('/system/screenshot', { method: 'POST' })} />
              <ActionBtn icon="🔇" label="Mute" color="#ff3366" onClick={() => handleVolume(0)} />
              <ActionBtn icon="⏸️" label="Pause" color="#7b2fdb" onClick={() => sendCmd('pause music')} />
              <ActionBtn icon="⏭️" label="Next" color="#00d4ff" onClick={() => sendCmd('next track')} />
              <ActionBtn icon="😴" label="Sleep" color="#0066ff" onClick={() => sendCmd('sleep')} />
            </div>
          </motion.div>
        )}

        {/* Status Tab */}
        {tab === 'status' && (
          <motion.div key="status" className="space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {stats ? (
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="CPU" value={Math.round(stats.cpu_percent)} unit="%" color={stats.cpu_percent > 80 ? '#ff3366' : '#00d4ff'} percent={stats.cpu_percent} />
                <StatCard label="RAM" value={Math.round(stats.ram_percent)} unit="%" color={stats.ram_percent > 80 ? '#ff3366' : '#00ff88'} percent={stats.ram_percent} />
                <StatCard label="Disk" value={Math.round(stats.disk_percent)} unit="%" color="#7b2fdb" percent={stats.disk_percent} />
                <StatCard label="Battery" value={stats.battery_percent ?? 'N/A'} unit={stats.battery_percent !== null ? '%' : ''} color={stats.battery_percent < 20 ? '#ff3366' : '#00ff88'} percent={stats.battery_percent} />
                <StatCard label="Temp" value={stats.cpu_temp ? Math.round(stats.cpu_temp) : 'N/A'} unit="°C" color="#ff8800" />
                <StatCard label="Network" value={stats.network_up ? 'Online' : 'Offline'} unit="" color={stats.network_up ? '#00ff88' : '#ff3366'} />
              </div>
            ) : (
              <div className="glass-panel p-8 text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Connecting to PC...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Terminal Tab */}
        {tab === 'terminal' && (
          <motion.div key="terminal" className="space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="glass-panel p-4 max-h-[50vh] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>Send a command to get started</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`mb-2 text-sm ${m.role === 'user' ? 'text-right' : ''}`}>
                    <span className="text-[10px] tracking-wider uppercase" style={{ color: m.role === 'user' ? '#00d4ff' : '#7b2fdb' }}>
                      {m.role === 'user' ? 'You' : 'Jarvis'}
                    </span>
                    <p style={{ color: 'var(--text-primary)' }}>{m.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (command.trim()) { sendCmd(command); setCommand(''); } }} className="flex gap-3">
              <input
                type="text" value={command} onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter command..."
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.15)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
              />
              <motion.button type="submit" className="px-5 py-3 rounded-xl text-sm font-bold cursor-pointer" style={{ background: 'rgba(0,102,255,0.25)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontFamily: 'var(--font-heading)' }} whileTap={{ scale: 0.9 }}>
                SEND
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
