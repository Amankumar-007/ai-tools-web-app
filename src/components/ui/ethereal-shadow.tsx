'use client';

import React, { useRef, useId, useEffect, CSSProperties } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';
import { cn } from "@/lib/utils"; // Assumes standard shadcn utils exist

interface AnimationConfig {
  scale: number;
  speed: number;
}

interface NoiseConfig {
  opacity: number;
  scale: number;
}

interface EtherealShadowProps {
  sizing?: 'fill' | 'stretch';
  color?: string;
  darkColor?: string;
  animation?: AnimationConfig;
  noise?: NoiseConfig;
  darkNoiseOpacity?: number;
  style?: CSSProperties;
  className?: string;
  dark?: boolean;
  children?: React.ReactNode;
}

function mapRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number
): number {
  if (fromLow === fromHigh) return toLow;
  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

export function EtherealShadow({
  sizing = 'fill',
  color = '#7c3aed', 
  darkColor = '#8b5cf6', 
  animation = { scale: 100, speed: 50 }, 
  noise = { opacity: 0.5, scale: 1 },
  darkNoiseOpacity,
  style,
  className,
  dark = false, 
  children
}: EtherealShadowProps) {
  const id = useId().replace(/:/g, "");
  const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const hueRotateMotionValue = useMotionValue(0);
  const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

  const displacementScale = mapRange(animation.scale, 1, 100, 20, 100);
  const animationDuration = mapRange(animation.speed, 1, 100, 1000, 50);

  useEffect(() => {
    if (feColorMatrixRef.current) {
      if (hueRotateAnimation.current) hueRotateAnimation.current.stop();
      
      hueRotateMotionValue.set(0);
      hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
        duration: animationDuration / 10, 
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        onUpdate: (value) => {
          if (feColorMatrixRef.current) {
            feColorMatrixRef.current.setAttribute("values", String(value));
          }
        }
      });

      return () => {
        if (hueRotateAnimation.current) hueRotateAnimation.current.stop();
      };
    }
  }, [animationDuration, hueRotateMotionValue]);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        dark ? 'dark' : 'bg-slate-50',
        className
      )}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        backgroundColor: dark ? '#0f172a' : undefined, 
      }}
    >
      {/* Animation Layer */}
      <div className="absolute inset-0 z-0">
         <div
            style={{
               position: "absolute",
               inset: -displacementScale,
               filter: `url(#${id}) blur(4px)`,
               opacity: 0.8
            }}
         >
            <svg style={{ position: "absolute", width: 0, height: 0 }}>
               <defs>
                  <filter id={id}>
                     <feTurbulence
                        type="turbulence"
                        baseFrequency={`${mapRange(animation.scale, 0, 100, 0.001, 0.0005)},${mapRange(animation.scale, 0, 100, 0.004, 0.002)}`}
                        numOctaves="2"
                        result="undulation"
                     />
                     <feColorMatrix
                        ref={feColorMatrixRef}
                        in="undulation"
                        type="hueRotate"
                        values="0"
                     />
                     <feColorMatrix
                        in="dist"
                        result="circulation"
                        type="matrix"
                        values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                     />
                     <feDisplacementMap
                        in="SourceGraphic"
                        in2="circulation"
                        scale={displacementScale}
                        result="dist"
                     />
                     <feDisplacementMap
                        in="dist"
                        in2="undulation"
                        scale={displacementScale}
                        result="output"
                     />
                  </filter>
               </defs>
            </svg>
            <div
               style={{
                  backgroundColor: dark ? darkColor : color,
                  maskImage: `url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')`,
                  maskSize: sizing === "stretch" ? "100% 100%" : "cover",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  width: "100%",
                  height: "100%",
                  opacity: dark ? 0.9 : 0.8
               }}
            />
         </div>
         
         {/* Noise Overlay */}
         {noise.opacity > 0 && (
            <div
               style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")`,
                  backgroundSize: noise.scale * 200,
                  opacity: dark 
                    ? (darkNoiseOpacity !== undefined ? darkNoiseOpacity : noise.opacity / 2)
                    : noise.opacity / 3, 
                  mixBlendMode: dark ? 'screen' : 'overlay',
                  pointerEvents: 'none'
               }}
            />
         )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
         {children}
      </div>
    </div>
  );
}