// J.A.R.V.I.S — Zustand Store
import { create } from 'zustand';
import { ORB_STATES } from '../utils/constants';

const useJarvisStore = create((set, get) => ({
  // Connection
  isConnected: false,
  setConnected: (val) => set({ isConnected: val }),

  // Orb state
  orbState: ORB_STATES.IDLE,
  orbMessage: '',
  setOrbState: (state, message = '') => set({ orbState: state, orbMessage: message }),

  // System stats
  stats: null,
  setStats: (stats) => set({ stats }),

  // Chat / Command history
  messages: [],
  addMessage: (msg) => set((s) => ({
    messages: [...s.messages.slice(-100), { ...msg, id: Date.now(), timestamp: new Date().toISOString() }],
  })),
  clearMessages: () => set({ messages: [] }),

  // Command input
  commandText: '',
  setCommandText: (text) => set({ commandText: text }),

  // Active panel
  activePanel: 'dashboard', // dashboard, chat, settings, files
  setActivePanel: (panel) => set({ activePanel: panel }),

  // Confirmation
  pendingConfirmation: null,
  setPendingConfirmation: (conf) => set({ pendingConfirmation: conf }),
  clearConfirmation: () => set({ pendingConfirmation: null }),

  // Notifications
  notifications: [],
  addNotification: (notif) => set((s) => ({
    notifications: [...s.notifications.slice(-5), { ...notif, id: Date.now() }],
  })),
  removeNotification: (id) => set((s) => ({
    notifications: s.notifications.filter((n) => n.id !== id),
  })),

  // Waveform data
  waveformData: new Array(64).fill(0),
  setWaveformData: (data) => set({ waveformData: data }),
}));

export default useJarvisStore;
