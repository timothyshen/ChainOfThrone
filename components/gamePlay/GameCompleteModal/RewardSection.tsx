import { memo } from "react"
import { Scroll } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClaimReward } from "@/lib/hooks/useClaimReward"
import { useTransaction } from "@/lib/hooks/useTransaction"
import { useTransactionToast } from "@/lib/hooks/useTransactionToast"
import { TransactionButton } from "@/components/shared/TransactionButton"

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
  const { claimReward } = useClaimReward()
  const tx = useTransaction()

  // Automatically display transaction status notifications
  useTransactionToast(tx.state, {
    success: "Reward claimed successfully!",
    error: "Failed to claim reward"
  })

  if (type !== "win") return null

  const handleClaimReward = async () => {
    await tx.execute(() => claimReward(gameAddress))
  }

  return (
    <div>
      <p className="text-center font-medium text-foreground mb-3 flex items-center justify-center gap-2">
        <Scroll className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        Redeem your reward
      </p>

      <TransactionButton
        state={tx.state}
        onClick={handleClaimReward}
        idleText="Claim Reward"
        signingText="Signing..."
        submittedText="Claiming..."
        confirmingText="Confirming..."
        successText="✓ Reward Claimed"
        errorText="Try Again"
        className={cn(
          "w-full py-6 text-base font-medium transition-all",
          tx.isSuccess
            ? "bg-green-600 hover:bg-green-700"
            : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
        )}
      />
    </div>
  )
})

RewardSection.displayName = "RewardSection"
