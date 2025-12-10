import { memo } from "react"
import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { truncateAddress } from "@/lib/utils"
import type { ArmyDetailsProps } from "@/lib/types/gameOperationPanel"

/**
 * ArmyDetails Component
 *
 * Displays selected army information including owner, size, position, and status
 */
export const ArmyDetails = memo(({
  selectedArmy,
  animatingArmies,
  getTerritoryColor,
  isMobile = false
}: ArmyDetailsProps) => (
  <Card className="bg-card border-border text-foreground">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex items-center gap-2">
        <Users className="w-4 h-4" />
        Army Details
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Owner</span>
          <Badge style={{ backgroundColor: getTerritoryColor(selectedArmy.owner) }}>
            {truncateAddress(selectedArmy.owner)}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Size</span>
          <span>{Number(selectedArmy.size).toLocaleString()} troops</span>
        </div>
        <div className="flex justify-between">
          <span>Position</span>
          <span>({selectedArmy.x}, {selectedArmy.y})</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <Badge
            variant={selectedArmy.isMoving || animatingArmies.has(selectedArmy.id) ? "default" : "secondary"}
          >
            {animatingArmies.has(selectedArmy.id)
              ? "Moving..."
              : selectedArmy.isMoving
                ? "Moving"
                : "Stationed"}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
))

ArmyDetails.displayName = "ArmyDetails"
