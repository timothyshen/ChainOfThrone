"use client"

import { memo, useState, useEffect, useMemo } from "react"
import { History, ChevronDown, ChevronUp, Navigation, Sword, Crown, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGameStateContext } from "@/lib/contexts/GameContext"
import { useAccount } from "wagmi"

interface HistoryEvent {
  id: string
  type: "move" | "battle" | "capture"
  player: "you" | "enemy"
  description: string
  details?: string
  timestamp?: number
}

interface TurnHistoryPanelProps {
  isCollapsible?: boolean
  defaultExpanded?: boolean
  maxEvents?: number
}

/**
 * TurnHistoryPanel Component
 *
 * Shows history of game events:
 * - Movement actions
 * - Battle results
 * - Territory captures
 */
export const TurnHistoryPanel = memo(({
  isCollapsible = true,
  defaultExpanded = false,
  maxEvents = 10,
}: TurnHistoryPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const { territories, armies } = useGameStateContext()
  const { address } = useAccount()

  // Generate some placeholder history based on current state
  // In production, this would come from contract events
  const historyEvents = useMemo((): HistoryEvent[] => {
    const mockEvents: HistoryEvent[] = []

    // This is a simplified version - in production, you'd track actual events
    // from contract logs or a state management system

    // Add some context-based events
    const flatTerritories = territories.flat()
    const zeroAddress = "0x0000000000000000000000000000000000000000"

    // Count controlled territories
    let playerTerritories = 0
    let enemyTerritories = 0

    flatTerritories.forEach((territory) => {
      const hasOwner = territory.player && territory.player.toLowerCase() !== zeroAddress.toLowerCase()
      if (hasOwner) {
        if (territory.player.toLowerCase() === address?.toLowerCase()) {
          playerTerritories++
          if (territory.isCastle) {
            mockEvents.push({
              id: `capture-${territory.id}`,
              type: "capture",
              player: "you",
              description: `Captured ${territory.name}`,
              details: territory.isCastle ? "Castle secured!" : undefined,
            })
          }
        } else {
          enemyTerritories++
          if (territory.isCastle) {
            mockEvents.push({
              id: `enemy-capture-${territory.id}`,
              type: "capture",
              player: "enemy",
              description: `Enemy captured ${territory.name}`,
              details: territory.isCastle ? "Castle lost!" : undefined,
            })
          }
        }
      }
    })

    // Add army-based events
    armies.forEach((army) => {
      const isPlayer = army.owner.toLowerCase() === address?.toLowerCase()
      if (isPlayer && army.size > 0) {
        mockEvents.push({
          id: `army-${army.id}`,
          type: "move",
          player: "you",
          description: `Army stationed at (${army.x}, ${army.y})`,
          details: `${army.size} units`,
        })
      }
    })

    return mockEvents.slice(0, maxEvents)
  }, [territories, armies, address, maxEvents])

  const getEventIcon = (event: HistoryEvent) => {
    switch (event.type) {
      case "move":
        return <Navigation className="w-3 h-3" />
      case "battle":
        return <Sword className="w-3 h-3" />
      case "capture":
        return <Crown className="w-3 h-3" />
      default:
        return <History className="w-3 h-3" />
    }
  }

  const getEventColor = (event: HistoryEvent) => {
    if (event.player === "you") {
      switch (event.type) {
        case "move":
          return "text-blue-400 bg-blue-900/30"
        case "battle":
          return "text-green-400 bg-green-900/30"
        case "capture":
          return "text-amber-400 bg-amber-900/30"
        default:
          return "text-text-secondary bg-surface-2/50"
      }
    } else {
      switch (event.type) {
        case "move":
          return "text-red-400 bg-red-900/30"
        case "battle":
          return "text-red-400 bg-red-900/30"
        case "capture":
          return "text-red-400 bg-red-900/30"
        default:
          return "text-text-secondary bg-surface-2/50"
      }
    }
  }

  const header = (
    <div
      className={`flex items-center justify-between p-2 ${isCollapsible ? 'cursor-pointer hover:bg-surface-3/50' : ''}`}
      onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-text-secondary" />
        <span className="text-sm font-medium">Turn History</span>
        {historyEvents.length > 0 && (
          <span className="text-[10px] bg-surface-3 px-1.5 py-0.5 rounded-full">
            {historyEvents.length}
          </span>
        )}
      </div>
      {isCollapsible && (
        isExpanded ? (
          <ChevronUp className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        )
      )}
    </div>
  )

  if (!isExpanded && isCollapsible) {
    return (
      <div className="bg-surface-1/95 backdrop-blur-sm border border-border shadow-soft rounded-lg overflow-hidden flex-shrink-0 mt-auto">
        {header}
      </div>
    )
  }

  return (
    <div className="bg-surface-1/95 backdrop-blur-sm border border-border shadow-soft rounded-lg overflow-hidden flex-shrink-0 mt-auto p-4">
      {header}

      <div className="p-2 pt-0 space-y-1 max-h-60 overflow-y-auto">
        {historyEvents.length === 0 ? (
          <div className="text-center py-4 text-xs text-text-muted">
            No events yet. Make a move!
          </div>
        ) : (
          historyEvents.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-2 p-2 rounded text-xs ${getEventColor(event)}`}
            >
              <div className="mt-0.5">
                {getEventIcon(event)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{event.description}</p>
                {event.details && (
                  <p className="text-[10px] opacity-70">{event.details}</p>
                )}
              </div>
              <span className={`text-[10px] px-1 py-0.5 rounded ${
                event.player === "you" ? "bg-blue-500/30" : "bg-red-500/30"
              }`}>
                {event.player === "you" ? "You" : "Enemy"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Replay Button - Placeholder */}
      {historyEvents.length > 0 && (
        <div className="p-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7"
            disabled
          >
            <Play className="w-3 h-3 mr-1" />
            Replay (Coming Soon)
          </Button>
        </div>
      )}
    </div>
  )
})

TurnHistoryPanel.displayName = "TurnHistoryPanel"
