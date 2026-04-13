// J.A.R.V.I.S — Main Application
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from './hooks/useWebSocket';
import useJarvisStore from './stores/jarvisStore';
import { api } from './utils/api';

import HudOverlay from './components/HUD/HudOverlay';
import FloatingOrb from './components/Orb/FloatingOrb';
import AudioWaveform from './components/Waveform/AudioWaveform';
import SystemStats from './components/Dashboard/SystemStats';
import CommandHistory from './components/Dashboard/CommandHistory';
import QuickActions from './components/Dashboard/QuickActions';
import ChatPanel from './components/Chat/ChatPanel';

function ConfirmationModal() {
  const { pendingConfirmation, clearConfirmation } = useJarvisStore();
  const { sendConfirmation } = useWebSocket();

  if (!pendingConfirmation) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-panel neon-border p-8 max-w-md mx-4"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#ff8800', boxShadow: '0 0 10px #ff8800' }} />
          <h3 className="heading-lg text-sm" style={{ color: '#ff8800' }}>Confirmation Required</h3>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-primary)' }}>
          {pendingConfirmation.message}
        </p>
        <div className="flex gap-3">
          <motion.button
            className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer"
            style={{
              background: 'rgba(255, 51, 102, 0.15)',
              border: '1px solid rgba(255, 51, 102, 0.3)',
              color: '#ff3366',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.1em',
            }}
            whileHover={{ boxShadow: '0 0 20px rgba(255, 51, 102, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sendConfirmation(pendingConfirmation.command_id, false);
              clearConfirmation();
            }}
          >
            CANCEL
          </motion.button>
          <motion.button
            className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer"
            style={{
              background: 'rgba(0, 255, 136, 0.15)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: '#00ff88',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.1em',
            }}
            whileHover={{ boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sendConfirmation(pendingConfirmation.command_id, true);
              clearConfirmation();
            }}
          >
            CONFIRM
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NotificationStack() {
  const { notifications, removeNotification } = useJarvisStore();

  return (
    <div className="fixed top-16 right-6 z-[90] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notif) => {
          const color = notif.level === 'error' ? '#ff3366' :
            notif.level === 'warning' ? '#ff8800' :
            notif.level === 'success' ? '#00ff88' : '#00d4ff';

          return (
            <motion.div
              key={notif.id}
              className="glass-panel px-4 py-3 cursor-pointer"
              style={{ borderColor: `${color}33` }}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              onClick={() => removeNotification(notif.id)}
            >
              <p className="text-xs font-semibold" style={{ color }}>{notif.title}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{notif.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <motion.button
      className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg cursor-pointer"
      style={{
        background: active ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
        border: active ? '1px solid rgba(0, 212, 255, 0.2)' : '1px solid transparent',
        color: active ? 'var(--neon-cyan)' : 'var(--text-muted)',
      }}
      whileHover={{
        background: 'rgba(0, 212, 255, 0.08)',
        color: 'var(--neon-cyan)',
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[9px] tracking-wider uppercase" style={{ fontFamily: 'var(--font-heading)' }}>{label}</span>
    </motion.button>
  );
}

export default function App() {
  const { activePanel, setActivePanel, isConnected } = useJarvisStore();
  const { sendCommand } = useWebSocket();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Fetch greeting on load
    api.health()
      .then((data) => setGreeting(data.greeting))
      .catch(() => setGreeting('Systems initializing...'));
  }, []);

  return (
    <div className="min-h-screen grid-bg relative">
      {/* HUD */}
      <HudOverlay />

      {/* Notifications */}
      <NotificationStack />

      {/* Confirmation Modal */}
      <AnimatePresence>
        <ConfirmationModal />
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-16 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section — Orb + Waveform */}
        <motion.div
          className="flex flex-col items-center py-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Title */}
          <motion.h1
            className="heading-xl text-center mb-2"
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.15em' }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            J.A.R.V.I.S
          </motion.h1>
          <motion.p
            className="text-xs mb-8 tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Just A Really Very Intelligent System
          </motion.p>

          {/* Greeting */}
          {greeting && (
            <motion.p
              className="text-sm mb-6 data-text"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {greeting}
            </motion.p>
          )}

          {/* Orb */}
          <FloatingOrb />

          {/* Waveform */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <AudioWaveform width={500} height={60} />
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex justify-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <NavButton icon="📊" label="Dashboard" active={activePanel === 'dashboard'} onClick={() => setActivePanel('dashboard')} />
          <NavButton icon="💬" label="Chat" active={activePanel === 'chat'} onClick={() => setActivePanel('chat')} />
          <NavButton icon="⚡" label="Actions" active={activePanel === 'actions'} onClick={() => setActivePanel('actions')} />
        </motion.div>

        {/* Panel Content */}
        <AnimatePresence mode="wait">
          {activePanel === 'dashboard' && (
            <motion.div
              key="dashboard"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div><SystemStats /></div>
              <div><CommandHistory /></div>
              <div><QuickActions /></div>
            </motion.div>
          )}

          {activePanel === 'chat' && (
            <motion.div
              key="chat"
              className="max-w-2xl mx-auto"
              style={{ height: '500px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <ChatPanel onSendCommand={sendCommand} />
            </motion.div>
          )}

          {activePanel === 'actions' && (
            <motion.div
              key="actions"
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <QuickActions />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick command bar (always visible) */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4"
          style={{
            background: 'linear-gradient(0deg, rgba(5, 8, 16, 0.95), transparent)',
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <form
            className="max-w-2xl mx-auto flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.command;
              if (input.value.trim()) {
                sendCommand(input.value.trim());
                input.value = '';
              }
            }}
          >
            <div className="flex-1 relative">
              <input
                name="command"
                type="text"
                placeholder="Enter command... (e.g., 'open Spotify', 'set volume to 50')"
                className="w-full pl-4 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: 'rgba(0, 212, 255, 0.04)',
                  border: '1px solid rgba(0, 212, 255, 0.15)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.15)'}
                autoComplete="off"
              />
            </div>
            <motion.button
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.3), rgba(0, 212, 255, 0.2))',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: 'var(--neon-cyan)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.1em',
              }}
              whileHover={{ boxShadow: '0 0 25px rgba(0, 212, 255, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              EXECUTE
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Connection indicator */}
      {!isConnected && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full glass-panel"
          style={{ borderColor: 'rgba(255, 51, 102, 0.3)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs" style={{ color: '#ff3366' }}>
            ⚠ Backend offline — Start with: python -m backend.main
          </span>
        </motion.div>
      )}
    </div>
  );
}
