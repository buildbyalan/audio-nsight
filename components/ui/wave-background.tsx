'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Vector3, Mesh, BufferGeometry, Material, Object3D } from 'three';
import { useInView } from "motion/react";
import type { Mesh as MeshType } from 'three';

function WaveMesh() {
  const meshRef = useRef<MeshType>(null);
  const hover = useRef(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      const position = meshRef.current.geometry.attributes.position;
      const count = 20;
      const freq = 0.3;

      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          const idx = (i * count + j) * 3;
          position.array[idx + 2] = Math.sin(i * freq + time) * 0.05 + Math.sin(j * freq + time) * 0.05;
        }
      }
      position.needsUpdate = true;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
    >
      <planeGeometry args={[8, 8, 20, 20]} />
      <meshPhongMaterial
        color="#FF8A3C"
        opacity={0.1}
        transparent
        wireframe
        side={2}
      />
    </mesh>
  );
}

export function WaveBackground() {
  const ref = useRef(null);
  const isInView = useInView(ref);

  return (
    <div
      ref={ref}
      className="absolute inset-0 h-full"
      style={{ 
        pointerEvents: 'none',
        minHeight: '100vh'
      }}
    >
      <Canvas
        camera={{
          position: new Vector3(0, 3, 5),
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        {isInView && <WaveMesh />}
      </Canvas>
    </div>
  );
}
