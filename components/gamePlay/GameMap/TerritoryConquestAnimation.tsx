"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, Swords } from "lucide-react";
import { ANIMATION_DURATIONS } from "@/lib/constants/animations";

interface TerritoryConquestAnimationProps {
  x: number;
  y: number;
  isCapture: boolean; // true = capture, false = lost
  isCastle: boolean;
  newOwnerColor?: string;
  onComplete?: () => void;
}

/**
 * TerritoryConquestAnimation Component
 *
 * Displays an animated effect when a territory is captured or lost
 * Includes particles, icon animation, and color flash
 */
export const TerritoryConquestAnimation = memo(function TerritoryConquestAnimation({
  x,
  y,
  isCapture,
  isCastle,
  newOwnerColor = "#22c55e",
  onComplete,
}: TerritoryConquestAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, ANIMATION_DURATIONS.BATTLE_VICTORY);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const Icon = isCastle ? Crown : isCapture ? Shield : Swords;
  const baseColor = isCapture ? newOwnerColor : "#ef4444";

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Background glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, ${baseColor}40 0%, transparent 70%)`,
              width: 120,
              height: 120,
              left: -60,
              top: -60,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Pulsing ring */}
          <motion.div
            className="absolute rounded-full border-4"
            style={{
              borderColor: baseColor,
              width: 80,
              height: 80,
              left: -40,
              top: -40,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 2, 3], opacity: [1, 0.5, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Second ring (delayed) */}
          <motion.div
            className="absolute rounded-full border-2"
            style={{
              borderColor: baseColor,
              width: 60,
              height: 60,
              left: -30,
              top: -30,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 2.5, 4], opacity: [1, 0.3, 0] }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />

          {/* Central icon */}
          <motion.div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              background: baseColor,
              width: 48,
              height: 48,
              left: -24,
              top: -24,
              boxShadow: `0 0 20px ${baseColor}80`,
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: [0, 1.3, 1, 1.1, 1],
              rotate: [180, 0, 0, 0, 0],
              y: [0, -10, 0, -5, 0],
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
              times: [0, 0.3, 0.5, 0.7, 1],
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>

          {/* Particles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 60 + Math.random() * 20;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  background: baseColor,
                  width: 8,
                  height: 8,
                  left: -4,
                  top: -4,
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: endX,
                  y: endY,
                  scale: [1, 1.5, 0],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.1 + i * 0.05,
                }}
              />
            );
          })}

          {/* Sparkles */}
          {isCapture && Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
            const distance = 40 + Math.random() * 30;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute"
                style={{
                  width: 4,
                  height: 12,
                  background: `linear-gradient(to bottom, ${baseColor}, transparent)`,
                  left: -2,
                  top: -6,
                  borderRadius: 2,
                }}
                initial={{ x: 0, y: 0, scale: 0, rotate: (angle * 180) / Math.PI }}
                animate={{
                  x: endX,
                  y: endY,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.3 + i * 0.08,
                }}
              />
            );
          })}

          {/* Text label */}
          <motion.div
            className="absolute whitespace-nowrap text-sm font-bold"
            style={{
              color: baseColor,
              textShadow: `0 0 10px ${baseColor}80, 0 2px 4px rgba(0,0,0,0.5)`,
              left: 0,
              top: 40,
              transform: "translateX(-50%)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
          >
            {isCapture
              ? isCastle
                ? "Castle Captured!"
                : "Territory Conquered!"
              : "Territory Lost!"}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default TerritoryConquestAnimation;
