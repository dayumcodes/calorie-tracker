"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
// Remove the Lucide icons import
// import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Custom SVG icons for Sun and Moon
const SunIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-amber-500"
  >
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <g className="animate-pulse" style={{ animationDuration: '3s' }}>
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-indigo-300"
  >
    <path 
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
      fill="currentColor"
      className="drop-shadow-[0_0_2px_rgba(165,180,252,0.3)]"
    />
    <circle cx="8" cy="9" r="1" fill="#fff" opacity="0.4" />
    <circle cx="15" cy="14" r="0.5" fill="#fff" opacity="0.4" />
    <circle cx="12" cy="8" r="0.7" fill="#fff" opacity="0.4" />
  </svg>
);

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  const isDark = theme === "dark";
  
  const handleToggle = () => {
    if (animating) return;
    
    setAnimating(true);
    const isGoingDark = theme === "light";
    
    // If currently light, animate to dark
    if (isGoingDark) {
      // Start animation, then set theme after delay
      setTimeout(() => {
        setTheme("dark");
        setTimeout(() => setAnimating(false), 1500); // Allow animation to complete
      }, 300);
    } else {
      // If dark, switch to light immediately
      setTimeout(() => {
        setTheme("light");
        setTimeout(() => setAnimating(false), 1500); // Allow animation to complete
      }, 300);
    }
  };

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <button
        onClick={handleToggle}
        className={`relative z-20 h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
          isDark 
            ? "bg-slate-800 text-slate-200 border border-slate-700" 
            : "bg-sky-50 text-slate-700 border border-sky-100"
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <>
            <MoonIcon />
            {/* <span className="text-sm font-medium">Light</span> */}
          </>
        ) : (
          <>
            <SunIcon />
            {/* <span className="text-sm font-medium">Dark</span> */}
          </>
        )}
      </button>
      
      {/* Full screen overlay for theme transition */}
      <AnimatePresence>
        {animating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 z-50 overflow-hidden pointer-events-none"
          >
            {/* Background gradient that fades in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className={`absolute inset-0 ${
                isDark 
                  ? "bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950"     // Dark mode background for light→dark
                  : "bg-gradient-to-b from-blue-400 via-blue-500 to-sky-300" // Light mode background for dark→light
              }`}
            />
            
            {/* Stars that twinkle in - only show when going to dark mode */}
            {!isDark && (
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0.8], scale: [0, 1, 0.9] }}
                    transition={{ 
                      delay: 0.4 + (i * 0.05), 
                      duration: 2,
                      repeat: 1,
                      repeatType: "reverse"
                    }}
                    className="absolute h-1 w-1 bg-white rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      boxShadow: "0 0 4px 1px rgba(255, 255, 255, 0.4)"
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Moon rising animation - show when going to light mode */}
            {isDark && (
              <motion.div
                initial={{ y: "110vh", x: "10vw", opacity: 0 }}
                animate={{ 
                  y: "30vh",
                  x: "60vw", 
                  opacity: [0, 1, 1, 0.8],
                }}
                transition={{ 
                  duration: 2, 
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                className="absolute"
                style={{
                  filter: "drop-shadow(0 0 60px rgba(255, 248, 230, 0.6))"
                }}
              >
                {/* Custom moon SVG - larger version for animation */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="180" 
                  height="180" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-amber-100"
                >
                  {/* Simple crescent moon shape */}
                  <path 
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
                    fill="#FEFCE8"
                    stroke="none"
                  />
                </svg>
              </motion.div>
            )}
            
            {/* Sun rising animation - show when going to dark mode */}
            {!isDark && (
              <motion.div
                initial={{ y: "110vh", x: "70vw", opacity: 0 }}
                animate={{ 
                  y: "30vh",
                  x: "30vw", 
                  opacity: [0, 1, 1, 0.8],
                }}
                transition={{ 
                  duration: 2, 
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                className="absolute"
                style={{
                  filter: "drop-shadow(0 0 60px rgba(251, 191, 36, 0.7))"
                }}
              >
                {/* Custom sun SVG - larger version for animation */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="180" 
                  height="180" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-amber-400"
                >
                  <motion.circle 
                    cx="12" 
                    cy="12" 
                    r="5" 
                    fill="#FCD34D"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  <motion.g 
                    className="text-amber-400"
                    animate={{
                      opacity: [0.7, 1, 0.7],
                      rotate: [0, 360]
                    }}
                    transition={{
                      opacity: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      },
                      rotate: {
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                  >
                    <line x1="12" y1="1" x2="12" y2="3" stroke="#FBBF24" strokeWidth="2" />
                    <line x1="12" y1="21" x2="12" y2="23" stroke="#FBBF24" strokeWidth="2" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#FBBF24" strokeWidth="2" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#FBBF24" strokeWidth="2" />
                    <line x1="1" y1="12" x2="3" y2="12" stroke="#FBBF24" strokeWidth="2" />
                    <line x1="21" y1="12" x2="23" y2="12" stroke="#FBBF24" strokeWidth="2" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#FBBF24" strokeWidth="2" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#FBBF24" strokeWidth="2" />
                  </motion.g>
                </svg>
                
                {/* Sun ray particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`sun-particle-${i}`}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ 
                      opacity: [0, 0.8, 0],
                      x: [0, (Math.random() * 120) - 60],
                      y: [0, (Math.random() * 120) - 60],
                    }}
                    transition={{ 
                      delay: 0.8 + (i * 0.15),
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: Math.random() * 1
                    }}
                    className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-amber-300"
                    style={{
                      boxShadow: "0 0 10px 3px rgba(251, 191, 36, 0.6)",
                      transform: "translate(-50%, -50%)"
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};