import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const EnergySlashes = () => {
  const groupRef = useRef();
  
  // Create high-speed energy beams/slashes for an intense "anime fight" aesthetic
  const slashes = useMemo(() => {
    return new Array(25).fill().map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20 - 10
      ),
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ],
      scale: [0.05, Math.random() * 10 + 5, 0.05], // Very thin and elongated beams
      speed: Math.random() * 50 + 30, // Extremely fast movement
      // Mostly bright cyan and white, with very little red
      color: Math.random() > 0.85 ? '#ff003c' : (Math.random() > 0.4 ? '#00e5ff' : '#ffffff')
    }));
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, i) => {
        // Move beams aggressively forward along their local Y axis simulating slashing
        mesh.translateY(slashes[i].speed * delta);
        
        // Reset beam position when it goes infinitely far out of bounds
        if (mesh.position.length() > 40) {
          mesh.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20 - 10
          );
        }
      });
      
      // Dynamic camera shake/parallax effect mapped to mouse pointer
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, (state.pointer.x * state.viewport.width) / 15, 0.1);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (state.pointer.y * state.viewport.height) / 15, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {slashes.map((props, i) => (
        <mesh key={i} position={props.position} rotation={props.rotation} scale={props.scale}>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          {/* meshBasicMaterial ignores lighting and glows fully with Bloom */}
          <meshBasicMaterial color={props.color} />
        </mesh>
      ))}
    </group>
  );
};

export default function AnimeScene() {
  return (
    <>
      <color attach="background" args={['#030108']} />
      <ambientLight intensity={0.5} />
      
      {/* Intense background particles acting like debris scattered from a battle */}
      <Stars radius={50} depth={50} count={1000} factor={4} saturation={1} fade speed={3} />
      <Sparkles count={150} scale={30} size={5} speed={2} opacity={0.8} color="#ffffff" />
      
      <EnergySlashes />
      
      {/* Aggressive Bloom to make the energy beams extremely bright and impactful */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={2.5} />
      </EffectComposer>
    </>
  );
}
