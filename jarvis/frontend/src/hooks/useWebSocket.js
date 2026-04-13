// J.A.R.V.I.S — WebSocket Hook (with REST API fallback)
import { useEffect, useRef, useCallback } from 'react';
import useJarvisStore from '../stores/jarvisStore';
import { ORB_STATES } from '../utils/constants';
import { api } from '../utils/api';

// Connect directly to backend port for WebSocket (bypasses Vite proxy issues)
function getWsUrl() {
  const hostname = window.location.hostname;
  return `ws://${hostname}:8400/ws`;
}

export function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const statsInterval = useRef(null);
  const clientId = useRef(`web-${Date.now().toString(36)}`);
  const wsConnected = useRef(false);

  const {
    setConnected,
    setOrbState,
    setStats,
    addMessage,
    setPendingConfirmation,
    addNotification,
    setWaveformData,
  } = useJarvisStore();

  // ── REST API fallback for stats polling ──
  const pollStats = useCallback(async () => {
    try {
      const stats = await api.getStats();
      setStats(stats);
      if (!wsConnected.current) {
        setConnected(true); // Mark as connected via REST
      }
    } catch (e) {
      if (!wsConnected.current) {
        setConnected(false);
      }
    }
  }, []);

  // ── WebSocket connection ──
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const url = `${getWsUrl()}?client_id=${clientId.current}&client_type=web`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WS] Connected to backend');
        wsConnected.current = true;
        setConnected(true);
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };

      ws.onclose = () => {
        wsConnected.current = false;
        // Don't set disconnected immediately — REST fallback may still work
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        // Silent — REST fallback handles connectivity
      };

      wsRef.current = ws;
    } catch (e) {
      // WebSocket may fail in some environments, REST fallback handles it
      console.log('[WS] WebSocket not available, using REST API');
    }
  }, []);

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'system_stats':
        setStats(msg.data);
        break;
      case 'orb_state':
        setOrbState(msg.data.orb_state, msg.data.message);
        break;
      case 'response':
        addMessage({
          role: 'assistant',
          content: msg.data.response_text,
          intent: msg.data.intent,
          status: msg.data.status,
          executionTime: msg.data.execution_time_ms,
        });
        break;
      case 'notification':
        addNotification(msg.data);
        break;
      case 'confirmation_request':
        setPendingConfirmation(msg.data);
        break;
      case 'waveform_data':
        setWaveformData(msg.data);
        break;
      case 'heartbeat':
        break;
      default:
        break;
    }
  }, []);

  // ── Send command (WebSocket with REST fallback) ──
  const sendCommand = useCallback(async (text) => {
    addMessage({ role: 'user', content: text });

    // Try WebSocket first
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'command', data: { text } }));
      return;
    }

    // REST API fallback
    try {
      const response = await api.sendCommand(text);
      addMessage({
        role: 'assistant',
        content: response.response_text,
        intent: response.intent,
        status: response.status,
        executionTime: response.execution_time_ms,
      });
    } catch (err) {
      addMessage({
        role: 'assistant',
        content: 'Unable to reach the backend. Please ensure the server is running.',
        status: 'error',
      });
    }
  }, [addMessage]);

  const sendConfirmation = useCallback(async (commandId, confirmed) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'confirmation_response',
        data: { command_id: commandId, confirmed },
      }));
    } else {
      await api.confirmCommand(commandId, confirmed);
    }
  }, []);

  const sendMessage = useCallback((type, data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  useEffect(() => {
    // Start WebSocket connection
    connect();

    // Start REST stats polling (works even without WebSocket)
    pollStats();
    statsInterval.current = setInterval(pollStats, 5000);

    // Heartbeat for WebSocket
    const heartbeat = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat', data: {} }));
      }
    }, 25000);

    return () => {
      clearInterval(heartbeat);
      clearInterval(statsInterval.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect, pollStats]);

  return { sendCommand, sendConfirmation, sendMessage };
}
