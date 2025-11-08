"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "@/styles/intro/astronaut.module.css";

export default function IntroAstronaut() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    mount.appendChild(renderer.domElement);
    // Ensure canvas fills the container for consistent visibility
    Object.assign(renderer.domElement.style, {
      width: "100%",
      height: "100%",
      display: "block",
    });

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 1.6, 3.2);
    camera.lookAt(0, 1.2, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(2.5, 3.5, 2.5);
    scene.add(dir);

    let astronautRoot: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
    loader.setCrossOrigin("anonymous");

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    onResize();

    // Load astronaut model from Khronos glTF Sample Models via CDN
    loader.load(
      "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Astronaut/glTF-Binary/Astronaut.glb",
      (gltf) => {
        astronautRoot = gltf.scene;
        astronautRoot.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        const scale = window.innerWidth < 640 ? 0.8 : 1.0;
        astronautRoot.scale.setScalar(scale);
        astronautRoot.position.set(0, 0.9, 0);
        scene.add(astronautRoot);
      },
      undefined,
      (err) => {
        console.warn("Failed to load GLB astronaut:", err);
      }
    );

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      if (astronautRoot) {
        astronautRoot.rotation.y = t * 0.2;
        const bob = Math.sin(t * 1.2) * 0.03;
        astronautRoot.position.y = 0.9 + bob;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={styles.container} />;
}