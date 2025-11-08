"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Float, Environment } from "@react-three/drei";
import styles from "@/styles/intro/astronaut.module.css";

// Use a widely mirrored asset for better reliability
const MODEL_URL =
  "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

function AstronautModel() {
  const gltf = useGLTF(MODEL_URL);
  const scene = gltf.scene.clone();
  scene.traverse((obj: any) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  scene.position.set(0, 0.9, 0);
  return <primitive object={scene} />;
}

useGLTF.preload(MODEL_URL);

export default function IntroAstronaut() {
  // Canvas-based render with R3F for more reliable display
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const scale = isMobile ? 0.6 : 0.8;

  return (
    <div className={styles.container}>
      <Canvas
        shadows
        camera={{ fov: 50, position: [0, 1.6, 3.2] }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[2.5, 3.5, 2.5]} intensity={1.0} castShadow />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
            <group scale={[scale, scale, scale]}>
              <AstronautModel />
            </group>
          </Float>
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={6}
          target={[0, 1.0, 0]}
        />
      </Canvas>
    </div>
  );
}