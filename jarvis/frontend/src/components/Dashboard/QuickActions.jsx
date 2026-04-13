// J.A.R.V.I.S — Quick Actions Panel
import { motion } from 'framer-motion';
import { api } from '../../utils/api';

const actions = [
  { label: 'Lock', icon: '🔒', action: () => api.lockScreen(), color: '#ff8800' },
  { label: 'Screenshot', icon: '📸', action: () => api.takeScreenshot(), color: '#00ff88' },
  { label: 'Mute', icon: '🔇', action: () => api.setVolume(0), color: '#ff3366' },
  { label: 'Vol 50%', icon: '🔊', action: () => api.setVolume(50), color: '#00d4ff' },
  { label: 'Bright+', icon: '☀️', action: () => api.setBrightness(80), color: '#ffd700' },
  { label: 'Bright-', icon: '🌙', action: () => api.setBrightness(30), color: '#7b2fdb' },
];

export default function QuickActions() {
  const handleAction = async (action, label) => {
    try {
      await action();
    } catch (err) {
      console.error(`Action "${label}" failed:`, err);
    }
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="heading-lg text-sm mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((item, i) => (
          <motion.button
            key={item.label}
            className="flex flex-col items-center gap-2 py-3 px-2 rounded-lg cursor-pointer"
            style={{
              background: 'rgba(0, 212, 255, 0.04)',
              border: '1px solid rgba(0, 212, 255, 0.1)',
            }}
            whileHover={{
              background: `${item.color}15`,
              borderColor: `${item.color}44`,
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleAction(item.action, item.label)}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
