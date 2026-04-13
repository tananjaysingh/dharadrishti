// J.A.R.V.I.S — Floating Orb Component
// The central animated assistant sphere with state-based visual effects
import { motion, AnimatePresence } from 'framer-motion';
import useJarvisStore from '../../stores/jarvisStore';
import { ORB_STATES } from '../../utils/constants';

const stateConfig = {
  [ORB_STATES.IDLE]: {
    scale: 1,
    color: '#00d4ff',
    glowSize: 30,
    pulseSpeed: 4,
    label: 'READY',
  },
  [ORB_STATES.LISTENING]: {
    scale: 1.15,
    color: '#00ff88',
    glowSize: 50,
    pulseSpeed: 1.5,
    label: 'LISTENING...',
  },
  [ORB_STATES.PROCESSING]: {
    scale: 1.05,
    color: '#ffd700',
    glowSize: 40,
    pulseSpeed: 0.8,
    label: 'PROCESSING...',
  },
  [ORB_STATES.RESPONDING]: {
    scale: 1.1,
    color: '#7b2fdb',
    glowSize: 45,
    pulseSpeed: 2,
    label: 'SPEAKING...',
  },
  [ORB_STATES.ERROR]: {
    scale: 0.95,
    color: '#ff3366',
    glowSize: 25,
    pulseSpeed: 0.5,
    label: 'ERROR',
  },
};

export default function FloatingOrb({ onClick }) {
  const { orbState, orbMessage } = useJarvisStore();
  const config = stateConfig[orbState] || stateConfig[ORB_STATES.IDLE];

  return (
    <div className="flex flex-col items-center gap-4 select-none" onClick={onClick}>
      {/* Outer rings */}
      <div className="relative" style={{ width: 200, height: 200 }}>
        {/* Rotating ring 1 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${config.color}22`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Rotating ring 2 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: 15,
            border: `1px dashed ${config.color}33`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Rotating ring 3 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: 30,
            border: `1.5px solid ${config.color}44`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ inset: 45 }}
          animate={{
            boxShadow: [
              `0 0 ${config.glowSize}px ${config.color}33, inset 0 0 ${config.glowSize}px ${config.color}11`,
              `0 0 ${config.glowSize * 1.5}px ${config.color}55, inset 0 0 ${config.glowSize * 1.5}px ${config.color}22`,
              `0 0 ${config.glowSize}px ${config.color}33, inset 0 0 ${config.glowSize}px ${config.color}11`,
            ],
          }}
          transition={{
            duration: config.pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Core orb */}
        <motion.div
          className="absolute rounded-full cursor-pointer"
          style={{
            inset: 50,
            background: `radial-gradient(circle at 35% 35%, ${config.color}88, ${config.color}22, transparent)`,
            border: `2px solid ${config.color}66`,
          }}
          animate={{
            scale: [config.scale, config.scale * 1.05, config.scale],
          }}
          transition={{
            duration: config.pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: config.scale * 1.1 }}
          whileTap={{ scale: config.scale * 0.95 }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: 85,
            background: config.color,
            boxShadow: `0 0 20px ${config.color}`,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: config.pulseSpeed * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Particle dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: config.color,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos((i * Math.PI * 2) / 8) * 80],
              y: [0, Math.sin((i * Math.PI * 2) / 8) * 80],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* State label */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={orbState}
      >
        <p
          className="data-text text-xs tracking-[0.3em] uppercase"
          style={{ color: config.color }}
        >
          {config.label}
        </p>
        <AnimatePresence mode="wait">
          {orbMessage && (
            <motion.p
              className="text-xs mt-1"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {orbMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
