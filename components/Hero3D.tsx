"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const NAVY_LIGHT = "#3b82f6";

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12;
  });
  return (
    <mesh ref={ref} position={[0, -0.2, -1.5]}>
      <sphereGeometry args={[2.6, 32, 32]} />
      <meshBasicMaterial
        color={NAVY_LIGHT}
        wireframe
        transparent
        opacity={0.12}
      />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <div
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0.4, 6], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <Globe />
        <ContactShadows
          position={[0, -3, 0]}
          opacity={0.15}
          scale={14}
          blur={2.4}
          far={4}
          color="#1e3a8a"
        />
      </Canvas>
    </div>
  );
}
