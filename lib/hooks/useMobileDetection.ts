"use client";

import { useState, useEffect } from "react";

interface UseMobileDetectionOptions {
  breakpoint?: number;
}

interface UseMobileDetectionReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  windowWidth: number;
}

/**
 * Hook to detect mobile/tablet/desktop screen sizes
 */
export function useMobileDetection({
  breakpoint = 768,
}: UseMobileDetectionOptions = {}): UseMobileDetectionReturn {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const checkWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    // Check on mount
    checkWidth();

    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return {
    isMobile: windowWidth < breakpoint,
    isTablet: windowWidth >= breakpoint && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
    windowWidth,
  };
}
