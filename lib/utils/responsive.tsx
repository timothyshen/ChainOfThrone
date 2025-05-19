"use client"
import { useEffect, useState } from "react";
import React from 'react';

/**
 * Breakpoint definitions based on tailwind defaults
 */
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
};

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to determine if the viewport is currently at or above a given breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setIsAboveBreakpoint(width >= breakpoints[breakpoint]);
    };

    // Check on mount
    checkBreakpoint();

    // Check on resize
    window.addEventListener("resize", checkBreakpoint);

    return () => {
      window.removeEventListener("resize", checkBreakpoint);
    };
  }, [breakpoint]);

  return isAboveBreakpoint;
}

/**
 * Hook to handle mobile detection
 */
export function useMobileDetect() {
  const isMobile = !useBreakpoint("md");
  return { isMobile };
}

/**
 * Conditionally render components based on breakpoints
 */
export function OnlyMobile({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobileDetect();
  if (!isMobile) return null;
  return <>{children}</>;
}

export function OnlyDesktop({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobileDetect();
  if (isMobile) return null;
  return <>{children}</>;
}
