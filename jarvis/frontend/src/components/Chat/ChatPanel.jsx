// J.A.R.V.I.S — Chat Panel
// Full conversation view with command input
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useJarvisStore from '../../stores/jarvisStore';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.2), rgba(0, 212, 255, 0.1))'
            : 'rgba(0, 212, 255, 0.05)',
          border: `1px solid ${isUser ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 212, 255, 0.1)'}`,
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {message.content}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.intent && (
            <span className="text-[9px] px-1.5 rounded" style={{
              background: 'rgba(0, 212, 255, 0.1)',
              color: 'var(--neon-cyan)',
            }}>{message.intent}</span>
          )}
          {message.executionTime && (
            <span className="text-[9px] mono-text" style={{ color: 'var(--text-muted)' }}>
              {message.executionTime}ms
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPanel({ onSendCommand }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { messages } = useJarvisStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendCommand(input.trim());
    setInput('');
  };

  return (
    <div className="glass-panel flex flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }}>
        <h3 className="heading-lg text-sm">Communication</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <motion.p
              className="text-sm text-center"
              style={{ color: 'var(--text-muted)' }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Awaiting your command, sir.
            </motion.p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t" style={{ borderColor: 'rgba(0, 212, 255, 0.1)' }}>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300"
            style={{
              background: 'rgba(0, 212, 255, 0.04)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.15)'}
          />
          <motion.button
            type="submit"
            className="px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.3), rgba(0, 212, 255, 0.2))',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: 'var(--neon-cyan)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.1em',
            }}
            whileHover={{
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              borderColor: 'rgba(0, 212, 255, 0.6)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            SEND
          </motion.button>
        </div>
      </form>
    </div>
  );
}
