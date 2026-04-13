// J.A.R.V.I.S — API Constants & Theme
export const API_BASE = '/api';
export const WS_URL = `ws://${window.location.host}/ws`;

export const THEME = {
  colors: {
    bgPrimary: '#050810',
    bgSecondary: '#0a0e1a',
    neonCyan: '#00d4ff',
    neonBlue: '#0066ff',
    neonPurple: '#7b2fdb',
    neonGreen: '#00ff88',
    neonRed: '#ff3366',
    neonOrange: '#ff8800',
    neonGold: '#ffd700',
    textPrimary: '#e0f7ff',
    textSecondary: 'rgba(224, 247, 255, 0.6)',
    textMuted: 'rgba(224, 247, 255, 0.3)',
  },
};

export const ORB_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  RESPONDING: 'responding',
  ERROR: 'error',
};
