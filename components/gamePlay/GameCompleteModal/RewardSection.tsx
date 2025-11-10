import { memo } from "react"
import { Scroll } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useClaimReward } from "@/lib/hooks/useClaimReward"
import { toast } from "@/lib/hooks/use-toast"

type GameResultType = "win" | "loss"

interface RewardSectionProps {
  type: GameResultType
  gameAddress: `0x${string}`
}

/**
 * RewardSection Component
 *
 * Handles reward claiming with transaction status
 * Only visible for winning players
 */
export const RewardSection = memo(({ type, gameAddress }: RewardSectionProps) => {
  const { claimReward, isConfirmed, isPending, error } = useClaimReward()

  if (type !== "win") return null

  if (error) {
    toast({
      title: "Error",
      description: "An error occurred while claiming your reward",
    })
  }

  return (
    <div>
      <p className="text-center font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-center gap-2">
        <Scroll className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        Redeem your reward
      </p>

      <Button
        className={cn(
          "w-full py-6 text-base font-medium transition-all",
          isConfirmed
            ? "bg-green-600 hover:bg-green-700"
            : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
        )}
        onClick={() => claimReward(gameAddress)}
        disabled={isConfirmed || isPending}
      >
        {isPending ? "Claiming..." : isConfirmed ? "Reward Claimed" : "Claim Reward"}
      </Button>
    </div>
  )
})

RewardSection.displayName = "RewardSection"
