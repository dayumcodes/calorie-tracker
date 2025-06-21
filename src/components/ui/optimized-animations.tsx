"use client";

import { memo, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAdaptivePerformance } from "@/hooks/use-performance";

/**
 * Optimized background animation component with reduced particles
 * This significantly improves performance by reducing the number of animated elements
 */
export const AnimatedBackground = memo(() => {
  const { particleCount, shouldUseComplexAnimations, animationConfig } = useAdaptivePerformance();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Only initialize animations after component mounts to avoid hydration issues
  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  // Precompute random values to avoid recalculations on re-renders
  const particleProps = useMemo(() => 
    Array.from({ length: particleCount }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 8 + 2,
      opacity: Math.random() * 0.5 + 0.2,
      yOffset: Math.random() * 100 - 50,
      xOffset: Math.random() * 50 - 25,
      duration: Math.random() * 20 + 20,
    })), 
  [particleCount]);

  const gradientProps = useMemo(() => 
    Array.from({ length: shouldUseComplexAnimations ? 2 : 1 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: Math.random() * 500 + 300,
      height: Math.random() * 500 + 300,
      xOffset: Math.random() * 50 - 25,
      yOffset: Math.random() * 50 - 25,
    })), 
  [shouldUseComplexAnimations]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large circle gradient */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary/30 to-primary/10 dark:from-primary/10 dark:to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-primary/30 to-primary/10 dark:from-primary/10 dark:to-transparent rounded-full blur-3xl" />
      
      {/* Conditionally render particles only if initialized and not on low-end devices */}
      {isInitialized && particleCount > 0 && (
        <div className="absolute w-full h-full">
          {particleProps.map((props, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-primary/40 dark:bg-primary/20"
              style={{
                top: props.top,
                left: props.left,
                width: `${props.size}px`,
                height: `${props.size}px`,
                opacity: props.opacity,
              }}
              animate={{
                y: [0, props.yOffset],
                x: [0, props.xOffset],
              }}
              transition={{
                duration: props.duration,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Conditionally render gradients */}
      {isInitialized && (
        <div className="absolute w-full h-full">
          {gradientProps.map((props, i) => (
            <motion.div
              key={`blob-${i}`}
              className="absolute rounded-full"
              style={{
                top: props.top,
                left: props.left,
                width: `${props.width}px`,
                height: `${props.height}px`,
                background: `radial-gradient(circle, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.01) 50%, rgba(var(--primary-rgb), 0) 70%)`,
                filter: 'blur(70px)',
              }}
              animate={shouldUseComplexAnimations ? {
                x: [0, props.xOffset],
                y: [0, props.yOffset],
              } : undefined}
              transition={{
                duration: 30,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

/**
 * Simple fading animation component for consistent entrance animations
 */
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = memo(({
  children,
  delay = 0,
  duration = 0.5,
  className = ""
}: FadeInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

FadeIn.displayName = "FadeIn";

/**
 * Simplified pulse animation that uses less CPU
 */
export const SimplePulse = memo(() => {
  return (
    <motion.div
      className="absolute inset-0 bg-primary/30 rounded-full"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
});

SimplePulse.displayName = "SimplePulse"; 