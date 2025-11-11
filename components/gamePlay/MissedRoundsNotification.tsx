import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, FastForward, X } from 'lucide-react'
import { MissedRoundsInfo } from '@/lib/systems/RoundHistoryManager'

interface MissedRoundsNotificationProps {
  missedRoundsInfo: MissedRoundsInfo | null
  onViewReplay?: () => void
  onDismiss?: () => void
}

export function MissedRoundsNotification({
  missedRoundsInfo,
  onViewReplay,
  onDismiss,
}: MissedRoundsNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (missedRoundsInfo && missedRoundsInfo.hasMissedRounds) {
      setIsVisible(true)
    }
  }, [missedRoundsInfo])

  if (!isVisible || !missedRoundsInfo || !missedRoundsInfo.hasMissedRounds) {
    return null
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const handleViewReplay = () => {
    setIsVisible(false)
    onViewReplay?.()
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-5 duration-300">
      <Alert className="bg-yellow-50 border-yellow-200 shadow-lg">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900 font-semibold">
          Missed Rounds Detected
        </AlertTitle>
        <AlertDescription className="text-yellow-800 mt-2">
          <p className="mb-3">
            You missed {missedRoundsInfo.missedRounds.length} round
            {missedRoundsInfo.missedRounds.length > 1 ? 's' : ''} (
            {missedRoundsInfo.missedRounds.join(', ')})
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewReplay}
              className="flex-1 bg-white hover:bg-yellow-50 border-yellow-300"
            >
              <FastForward className="w-4 h-4 mr-2" />
              View Replay
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="hover:bg-yellow-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
