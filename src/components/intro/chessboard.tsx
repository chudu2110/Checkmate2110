"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "@/styles/intro/chessboard.module.css";

// Minimal 3D chessboard scene: lightweight canvas with procedural checker texture
export default function IntroChessboard() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.8);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0); // transparent
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });

    // Lighting
    const ambient = new THREE.AmbientLight(0x888888, 1.0);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.6);
    dir.position.set(3, 5, 2);
    dir.castShadow = true;
    scene.add(dir);

    // Procedural checkerboard texture
    const size = 512;
    const squares = 8;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const squareSize = size / squares;
    for (let y = 0; y < squares; y++) {
      for (let x = 0; x < squares; x++) {
        const isDark = (x + y) % 2 === 1;
        ctx.fillStyle = isDark ? '#1a1a1a' : '#f5f5f5';
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshStandardMaterial({ map: texture, roughness: 1, metalness: 0 })
    );
    board.rotation.x = -Math.PI / 2;
    board.position.y = -0.25;
    board.receiveShadow = true;
    scene.add(board);

    // No astronaut model per request; keep only the chessboard.

    // Resize handling
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(window.devicePixelRatio);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <div ref={mountRef} className={styles.canvasMount} />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground select-none pointer-events-none">for @tocosac</div>
    </div>
  );
}