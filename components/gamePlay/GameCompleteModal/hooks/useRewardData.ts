import { useState, useEffect } from "react"
import { getWinnerAmount } from "@/lib/hooks/ReadGameContract"

/**
 * useRewardData Hook
 *
 * Fetches winner reward amount from the game contract
 * Handles loading states and error conditions
 */
export function useRewardData(gameAddress: `0x${string}`) {
  const [reward, setReward] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchReward = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const amount = await getWinnerAmount(gameAddress)
        // Convert bigint to number safely, fallback to 0 if null
        setReward(amount ? Number(amount) : 0)
      } catch (err) {
        console.error("Error fetching reward data:", err)
        setError(err as Error)
        setReward(0)
      } finally {
        setIsLoading(false)
      }
    }

    if (gameAddress) {
      fetchReward()
    }
  }, [gameAddress])

  return { reward, isLoading, error }
}
