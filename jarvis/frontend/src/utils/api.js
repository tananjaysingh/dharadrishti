// J.A.R.V.I.S — REST API Client
import { API_BASE } from './constants';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error(`API Error [${path}]:`, err);
    throw err;
  }
}

export const api = {
  // Health
  health: () => request('/health'),

  // Commands
  sendCommand: (text, source = 'web') =>
    request('/command', {
      method: 'POST',
      body: JSON.stringify({ text, source }),
    }),

  confirmCommand: (commandId, confirmed) =>
    request('/commands/confirm', {
      method: 'POST',
      body: JSON.stringify({ command_id: commandId, confirmed }),
    }),

  getHistory: (limit = 20) => request(`/commands/history?limit=${limit}`),

  // System
  getStats: () => request('/system/stats'),
  setVolume: (level) => request('/system/volume', { method: 'POST', body: JSON.stringify({ level }) }),
  setBrightness: (level) => request('/system/brightness', { method: 'POST', body: JSON.stringify({ level }) }),
  toggleWifi: (enabled) => request('/system/wifi', { method: 'POST', body: JSON.stringify({ enabled }) }),
  getWifiStatus: () => request('/system/wifi'),
  lockScreen: () => request('/system/lock', { method: 'POST' }),
  takeScreenshot: (region = 'full') => request(`/system/screenshot?region=${region}`, { method: 'POST' }),

  // Files
  searchFiles: (directory, pattern, fileType) =>
    request('/files/search', {
      method: 'POST',
      body: JSON.stringify({ directory, pattern, file_type: fileType }),
    }),

  // Auth
  getQrCode: () => request('/auth/qr-code'),

  // Settings
  getSettings: () => request('/settings/'),
};
