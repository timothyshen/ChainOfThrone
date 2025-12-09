"use client"

import { memo, useState } from "react"
import {
  Accessibility,
  ChevronDown,
  ChevronUp,
  Eye,
  Volume2,
  Zap,
  Type,
  RotateCcw
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAccessibility } from "@/lib/contexts/AccessibilityContext"

interface AccessibilityPanelProps {
  isCollapsible?: boolean
  defaultExpanded?: boolean
}

/**
 * AccessibilityPanel Component
 *
 * Settings panel for accessibility options:
 * - Color-blind mode
 * - High contrast mode
 * - Reduced motion
 * - Screen reader announcements
 * - Large text
 */
export const AccessibilityPanel = memo(({
  isCollapsible = true,
  defaultExpanded = false,
}: AccessibilityPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const {
    colorBlindMode,
    highContrastMode,
    reducedMotion,
    screenReaderAnnouncements,
    largeText,
    setColorBlindMode,
    setHighContrastMode,
    setReducedMotion,
    setScreenReaderAnnouncements,
    setLargeText,
    resetToDefaults,
  } = useAccessibility()

  const header = (
    <div
      className={`flex items-center justify-between p-2 ${isCollapsible ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
      onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2">
        <Accessibility className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium">Accessibility</span>
      </div>
      {isCollapsible && (
        isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )
      )}
    </div>
  )

  if (!isExpanded && isCollapsible) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
        {header}
      </div>
    )
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
      {header}

      <div className="p-3 pt-0 space-y-3">
        {/* Color-blind Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium">Color-blind Mode</p>
              <p className="text-[10px] text-slate-500">Use patterns + shapes</p>
            </div>
          </div>
          <Switch
            checked={colorBlindMode}
            onCheckedChange={setColorBlindMode}
            aria-label="Toggle color-blind mode"
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium">High Contrast</p>
              <p className="text-[10px] text-slate-500">Increase visibility</p>
            </div>
          </div>
          <Switch
            checked={highContrastMode}
            onCheckedChange={setHighContrastMode}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium">Reduced Motion</p>
              <p className="text-[10px] text-slate-500">Disable animations</p>
            </div>
          </div>
          <Switch
            checked={reducedMotion}
            onCheckedChange={setReducedMotion}
            aria-label="Toggle reduced motion"
          />
        </div>

        {/* Screen Reader Announcements */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium">Announcements</p>
              <p className="text-[10px] text-slate-500">Screen reader alerts</p>
            </div>
          </div>
          <Switch
            checked={screenReaderAnnouncements}
            onCheckedChange={setScreenReaderAnnouncements}
            aria-label="Toggle screen reader announcements"
          />
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium">Large Text</p>
              <p className="text-[10px] text-slate-500">Increase font size</p>
            </div>
          </div>
          <Switch
            checked={largeText}
            onCheckedChange={setLargeText}
            aria-label="Toggle large text"
          />
        </div>

        {/* Reset Button */}
        <div className="pt-2 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7"
            onClick={resetToDefaults}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset to Defaults
          </Button>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-[10px] text-slate-500 font-medium mb-1">Keyboard Shortcuts:</p>
          <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-500">
            <div><kbd className="bg-slate-700 px-1 rounded">ESC</kbd> Cancel action</div>
            <div><kbd className="bg-slate-700 px-1 rounded">Tab</kbd> Navigate cells</div>
            <div><kbd className="bg-slate-700 px-1 rounded">Enter</kbd> Select/Confirm</div>
            <div><kbd className="bg-slate-700 px-1 rounded">Space</kbd> Toggle selection</div>
          </div>
        </div>
      </div>
    </div>
  )
})

AccessibilityPanel.displayName = "AccessibilityPanel"
