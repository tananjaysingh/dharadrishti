// J.A.R.V.I.S — Command History Panel
import { motion, AnimatePresence } from 'framer-motion';
import useJarvisStore from '../../stores/jarvisStore';

function CommandItem({ message, index }) {
  const isUser = message.role === 'user';
  const statusColor = message.status === 'success' ? '#00ff88' :
    message.status === 'failed' ? '#ff3366' : '#ffd700';

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="py-2 border-b"
      style={{ borderColor: 'rgba(0, 212, 255, 0.06)' }}
    >
      <div className="flex items-start gap-2">
        <span className="text-[10px] mt-1 tracking-wider uppercase"
          style={{ color: isUser ? 'var(--neon-cyan)' : 'var(--neon-purple)', minWidth: 50 }}>
          {isUser ? 'You' : 'Jarvis'}
        </span>
        <div className="flex-1">
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{message.content}</p>
          <div className="flex items-center gap-3 mt-1">
            {message.intent && (
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(0, 212, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                }}>
                {message.intent}
              </span>
            )}
            {message.executionTime && (
              <span className="text-[10px] mono-text" style={{ color: 'var(--text-muted)' }}>
                {message.executionTime}ms
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommandHistory() {
  const { messages } = useJarvisStore();
  const recentMessages = messages.slice(-15);

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-lg text-sm">Command Log</h3>
        <span className="text-[10px] mono-text" style={{ color: 'var(--text-muted)' }}>
          {messages.length} total
        </span>
      </div>

      {recentMessages.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No commands yet. Try typing a command below.
          </p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-0 pr-1">
          <AnimatePresence>
            {recentMessages.map((msg, i) => (
              <CommandItem key={msg.id} message={msg} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
