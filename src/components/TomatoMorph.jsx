"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "next-themes";

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;

const FloatingTomato = ({ isVisible, theme }) => {
  const meshRef = useRef();
  const stemRef = useRef();
  const count = 12000;
  const stemCount = 1500;
  const isLight = theme === "light";
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setScale(window.innerWidth < 768 ? 0.6 : 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const data = useMemo(() => {
    const randomPos = new Float32Array(count * 3);
    const tomatoPos = new Float32Array(count * 3);
    const stemRandomPos = new Float32Array(stemCount * 3);
    const stemTargetPos = new Float32Array(stemCount * 3);
    const colors = new Float32Array(count * 3);
    const stemColors = new Float32Array(stemCount * 3);
    const sizes = new Float32Array(count);
    const stemSizes = new Float32Array(stemCount);

    const bodyColor = isLight ? new THREE.Color("#dc2626") : new THREE.Color("#ff4d4d");
    const stemColor = isLight ? new THREE.Color("#16a34a") : new THREE.Color("#4ade80");

    for (let i = 0; i < count; i++) {
      randomPos[i * 3] = (Math.random() - 0.5) * 15;
      randomPos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      randomPos[i * 3 + 2] = (Math.random() - 0.5) * 15;

      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const r = 2.4;
      tomatoPos[i * 3] = r * 1.15 * Math.cos(theta) * Math.sin(phi);
      tomatoPos[i * 3 + 1] = r * 0.95 * Math.sin(theta) * Math.sin(phi);
      tomatoPos[i * 3 + 2] = r * 1.1 * Math.cos(phi);

      colors[i * 3] = bodyColor.r + (Math.random() - 0.5) * 0.05;
      colors[i * 3 + 1] = bodyColor.g;
      colors[i * 3 + 2] = bodyColor.b;
      sizes[i] = Math.random() * 0.2 + 0.1;
    }

    for (let i = 0; i < stemCount; i++) {
      stemRandomPos[i * 3] = (Math.random() - 0.5) * 15;
      stemRandomPos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      stemRandomPos[i * 3 + 2] = (Math.random() - 0.5) * 15;

      const angle = (i / stemCount) * Math.PI * 2;
      const t = (i % 250) / 250;
      const leafLength = 1.6 * t;

      stemTargetPos[i * 3] = Math.cos(angle) * leafLength;
      stemTargetPos[i * 3 + 1] = 1.8 + Math.pow(t, 2) * 0.8;
      stemTargetPos[i * 3 + 2] = Math.sin(angle) * leafLength;

      stemColors[i * 3] = stemColor.r;
      stemColors[i * 3 + 1] = stemColor.g + (Math.random() - 0.5) * 0.05;
      stemColors[i * 3 + 2] = stemColor.b;
      stemSizes[i] = Math.random() * 0.18 + 0.08;
    }

    return { randomPos, tomatoPos, stemRandomPos, stemTargetPos, colors, stemColors, sizes, stemSizes };
  }, [theme]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const lerpSpeed = isVisible ? 0.06 : 0.02;

    const pos = meshRef.current.geometry.attributes.position;
    const targetBody = isVisible ? data.tomatoPos : data.randomPos;
    const sPos = stemRef.current.geometry.attributes.position;
    const targetStem = isVisible ? data.stemTargetPos : data.stemRandomPos;

    for (let i = 0; i < count * 3; i++) {
      pos.array[i] += (targetBody[i] - pos.array[i]) * lerpSpeed;
    }
    for (let i = 0; i < stemCount * 3; i++) {
      sPos.array[i] += (targetStem[i] - sPos.array[i]) * lerpSpeed;
    }

    pos.needsUpdate = true;
    sPos.needsUpdate = true;

    const rotationSpeed = isVisible ? 0.15 : 0.05;
    meshRef.current.rotation.y = t * rotationSpeed;
    stemRef.current.rotation.y = t * rotationSpeed;
    meshRef.current.position.y = Math.sin(t) * 0.15;
    stemRef.current.position.y = Math.sin(t) * 0.15;
  });

  return (
    <group scale={scale}>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={data.randomPos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={data.colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={count} array={data.sizes} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>
      <points ref={stemRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={stemCount} array={data.stemRandomPos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={stemCount} array={data.stemColors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={stemCount} array={data.stemSizes} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default function NeuralCropSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : 'dark';

  return (
    <section
      ref={sectionRef}
      className="flex flex-col md:flex-row items-center w-full min-h-screen px-8 md:px-32 py-10 overflow-hidden duration-700"
    >
      <div className="w-full md:w-1/2 space-y-6 md:space-y-8 z-10 text-center md:text-left">
        <div className="space-y-4">
          <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
            <span className="w-8 h-[1px] bg-red-500" />
            <span className="text-red-500 font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase">
              Phase 01 — Visual Intelligence
            </span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter text-zinc-900 dark:text-white uppercase">
            Neural <br />
            <span className="font-serif italic font-light text-red-600 dark:text-red-500">Crop Engine</span>
          </h2>
        </div>

        <p className="text-lg md:text-2xl font-light max-w-lg border-l-2 border-red-500/30 pl-8 text-zinc-600 dark:text-zinc-400 leading-relaxed mx-auto md:mx-0">
          Harnessing particle physics and machine learning to predict harvest
          yields with <span className="text-zinc-900 dark:text-white font-semibold">99.4% accuracy</span>.
        </p>

        <button className="group relative px-6 md:px-8 py-3 md:py-4 bg-transparent border border-zinc-200 dark:border-zinc-800 hover:border-red-500 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <span className="relative text-xs md:text-sm uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-white transition-colors duration-500 flex items-center justify-center">
            Explore Engine
            <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </button>
      </div>

      <div className="w-full md:w-1/2 h-[600px] md:h-[700px] relative mt-12 md:mt-0">
        <div className="absolute inset-0 bg-radial-gradient from-red-500/5 to-transparent dark:from-red-500/10 pointer-events-none" />
        {mounted && isVisible && (
          <Canvas camera={{ position: [0, 0, 12], fov: 35 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <FloatingTomato isVisible={isVisible} theme={currentTheme} />
          </Canvas>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 font-mono text-[10px] text-zinc-300 dark:text-zinc-700 space-y-1 select-none pointer-events-none hidden md:block">
          <div>DATA_VECT: [52.1, 12.8, 99.4]</div>
          <div>SCAN_RES: OPTIMAL</div>
          <div>NEURAL_SYNC: ACTIVE</div>
        </div>
      </div>
    </section>
  );
};
