"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

interface AccessibilitySettings {
  // Color-blind mode: use patterns/shapes in addition to colors
  colorBlindMode: boolean
  // High contrast mode: increased contrast for better visibility
  highContrastMode: boolean
  // Reduced motion: disable animations
  reducedMotion: boolean
  // Screen reader announcements enabled
  screenReaderAnnouncements: boolean
  // Large text mode
  largeText: boolean
}

interface AccessibilityContextValue extends AccessibilitySettings {
  setColorBlindMode: (enabled: boolean) => void
  setHighContrastMode: (enabled: boolean) => void
  setReducedMotion: (enabled: boolean) => void
  setScreenReaderAnnouncements: (enabled: boolean) => void
  setLargeText: (enabled: boolean) => void
  announceToScreenReader: (message: string, priority?: "polite" | "assertive") => void
  resetToDefaults: () => void
}

const defaultSettings: AccessibilitySettings = {
  colorBlindMode: false,
  highContrastMode: false,
  reducedMotion: false,
  screenReaderAnnouncements: true,
  largeText: false,
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined)

const STORAGE_KEY = "cot-accessibility-settings"

/**
 * AccessibilityProvider Component
 *
 * Provides accessibility settings throughout the app:
 * - Color-blind mode (patterns instead of colors)
 * - High contrast mode
 * - Reduced motion (respects prefers-reduced-motion)
 * - Screen reader announcements
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      }

      // Check system preference for reduced motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setSettings(prev => ({ ...prev, reducedMotion: true }))
      }

      // Check system preference for high contrast
      if (window.matchMedia("(prefers-contrast: more)").matches) {
        setSettings(prev => ({ ...prev, highContrastMode: true }))
      }
    } catch (error) {
      console.error("Failed to load accessibility settings:", error)
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save accessibility settings:", error)
    }
  }, [settings])

  // Screen reader announcement using live region
  const announceToScreenReader = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (!settings.screenReaderAnnouncements) return

    // Find or create the live region
    let liveRegion = document.getElementById("sr-announcer")
    if (!liveRegion) {
      liveRegion = document.createElement("div")
      liveRegion.id = "sr-announcer"
      liveRegion.setAttribute("role", "status")
      liveRegion.setAttribute("aria-live", priority)
      liveRegion.setAttribute("aria-atomic", "true")
      liveRegion.className = "sr-only"
      liveRegion.style.cssText = "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
      document.body.appendChild(liveRegion)
    }

    // Update aria-live if needed
    liveRegion.setAttribute("aria-live", priority)

    // Clear and set message (triggers announcement)
    liveRegion.textContent = ""
    setTimeout(() => {
      liveRegion!.textContent = message
    }, 100)
  }, [settings.screenReaderAnnouncements])

  // Setters
  const setColorBlindMode = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, colorBlindMode: enabled }))
  }, [])

  const setHighContrastMode = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, highContrastMode: enabled }))
  }, [])

  const setReducedMotion = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, reducedMotion: enabled }))
  }, [])

  const setScreenReaderAnnouncements = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, screenReaderAnnouncements: enabled }))
  }, [])

  const setLargeText = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, largeText: enabled }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        setColorBlindMode,
        setHighContrastMode,
        setReducedMotion,
        setScreenReaderAnnouncements,
        setLargeText,
        announceToScreenReader,
        resetToDefaults,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}

/**
 * Hook to get color-blind safe colors/patterns
 */
export function useColorBlindSafe() {
  const { colorBlindMode, highContrastMode } = useAccessibility()

  // Return color classes and patterns based on mode
  return {
    // Player colors with pattern alternatives
    playerPrimary: colorBlindMode
      ? "bg-blue-500 pattern-diagonal-lines"
      : highContrastMode
      ? "bg-blue-600"
      : "bg-blue-500",
    playerSecondary: colorBlindMode
      ? "text-blue-400 underline decoration-dotted"
      : "text-blue-400",

    // Enemy colors with pattern alternatives
    enemyPrimary: colorBlindMode
      ? "bg-orange-500 pattern-dots"
      : highContrastMode
      ? "bg-red-600"
      : "bg-red-500",
    enemySecondary: colorBlindMode
      ? "text-orange-400 decoration-wavy"
      : "text-red-400",

    // Neutral colors
    neutralPrimary: colorBlindMode
      ? "bg-slate-500 pattern-crosshatch"
      : "bg-slate-500",

    // Castle colors
    castlePrimary: "bg-amber-500",

    // Shape indicators for territories
    playerShape: colorBlindMode ? "●" : "",  // Circle for player
    enemyShape: colorBlindMode ? "■" : "",    // Square for enemy
    neutralShape: colorBlindMode ? "◇" : "",  // Diamond for neutral
    castleShape: "♔",                          // Crown for castle
  }
}
