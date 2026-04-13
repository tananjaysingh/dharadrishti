import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import AnimeScene from './components/AnimeScene';
import './App.css';

const fadeUp = {
  hidden: { opacity: 0, y: 100, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 200, damping: 15 } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function App() {
  return (
    <div className="app-container">
      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <AnimeScene />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Overlay */}
      <div className="ui-layer">
        <div className="ui-content">
          
          <header className="glass pointer-events-auto" style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <motion.h1 
              initial={{ x: -50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ duration: 0.5 }}
              style={{ color: 'var(--color-text)', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}
            >
              TANANJAY<span style={{ color: 'var(--color-primary)' }}>.3D</span>
            </motion.h1>
            <motion.nav 
              initial={{ x: 50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', gap: '2.5rem' }}
            >
              <a href="#about" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>About</a>
              <a href="#projects" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Work</a>
              <a href="#contact" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Contact</a>
            </motion.nav>
          </header>

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section */}
            <section style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', padding: '0 10%' }}>
              <motion.div 
                className="glass pointer-events-auto" 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{ padding: '4rem', borderRadius: '1.5rem', maxWidth: '800px', backdropFilter: 'blur(16px)' }}
              >
                <motion.h2 
                  variants={fadeUp}
                  style={{ fontSize: '4.5rem', margin: '0 0 1rem 0', lineHeight: 1.1, fontWeight: 800 }}
                >
                  Hi, I'm <br />
                  <span style={{ color: 'var(--color-primary)', textShadow: '0 0 20px rgba(0, 229, 255, 0.6)' }}>
                    Tananjay singh jadaun
                  </span>
                </motion.h2>
                <motion.p 
                  variants={fadeUp}
                  style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 2.5rem 0', maxWidth: '600px', fontWeight: 300, lineHeight: 1.6 }}
                >
                  A visionary developer crafting immersive experiences inside the digital dimension. Welcome to my anime-inspired universe.
                </motion.p>
                <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <button style={{ 
                    background: 'linear-gradient(45deg, var(--color-primary), var(--color-secondary))',
                    border: 'none',
                    padding: '1rem 2.5rem',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '3rem',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.5)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}>
                    Explore Universe
                  </button>
                  <a href="#contact" style={{ 
                    background: 'transparent',
                    border: '2px solid var(--color-accent)',
                    padding: '1rem 2.5rem',
                    color: 'var(--color-accent)',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    borderRadius: '3rem',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(255, 0, 60, 0.2)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    Contact Me
                  </a>
                </motion.div>
              </motion.div>
            </section>
            
            {/* About Section */}
            <section id="about" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '5rem 10%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.div 
                className="glass pointer-events-auto" 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                style={{ padding: '3rem', borderRadius: '1rem', flex: 1, maxWidth: '900px' }}
              >
                <h2 style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>About My Journey</h2>
                <p style={{ fontSize: '1.2rem', color: '#ccc', lineHeight: '1.8' }}>
                  My passion lies in bridging imagination and technology. I build high-performance web applications that don't just work well — they look like art. Drawing inspiration from anime, cyberpunk aesthetics, and modern web design, I aim to create experiences that leave users in awe.
                  <br /><br />
                  Whether it's interactive 3D landscapes or seamless frontend interfaces, I leverage modern tooling like React, Three.js, and Framer Motion to explore uncharted digital territories.
                </p>
              </motion.div>
            </section>

            {/* Projects Section */}
            <section id="projects" style={{ minHeight: '100vh', padding: '5rem 10%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.h2 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: '4rem', color: 'var(--color-accent)' }}
              >
                Recent Works
              </motion.h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[1, 2, 3].map((item) => (
                  <motion.div 
                    key={item}
                    className="glass pointer-events-auto"
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    whileHover={{ y: -10 }}
                    style={{ padding: '2rem', borderRadius: '1rem', cursor: 'pointer' }}
                  >
                    <div style={{ height: '200px', background: 'rgba(0,0,0,0.5)', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#555' }}>Project Image {item}</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Dimensional App {item}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                      A futuristic platform combining beautiful aesthetics and flawless functionality. Built with modern tools.
                    </p>
                    <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      View Project ↗
                    </a>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 10%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.div 
                className="glass pointer-events-auto"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                style={{ padding: '4rem', borderRadius: '1.5rem', textAlign: 'center', maxWidth: '600px' }}
              >
                <h2 style={{ fontSize: '3rem', color: 'var(--color-secondary)', marginBottom: '1.5rem' }}>Let's Build The Future</h2>
                <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '3rem' }}>
                  Interested in collaborating? Feel free to reach out. I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                  <a href="#" style={{ color: 'var(--color-text)', transition: 'color 0.2s', textDecoration: 'none', fontWeight: 'bold' }}>GitHub</a>
                  <a href="#" style={{ color: 'var(--color-text)', transition: 'color 0.2s', textDecoration: 'none', fontWeight: 'bold' }}>Twitter</a>
                  <a href="mailto:contact@tananjay.com" style={{ color: 'var(--color-text)', transition: 'color 0.2s', textDecoration: 'none', fontWeight: 'bold' }}>Email</a>
                </div>
              </motion.div>
            </section>

          </main>

        </div>
      </div>
    </div>
  );
}
