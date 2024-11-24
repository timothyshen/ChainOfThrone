'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'


interface GameSetupProps {
  onGameStart: (players: Player[], units: Unit[]) => void
}

export function GameSetupComponent({ onGameStart }: GameSetupProps) {
  const { address } = useAccount()

  const { createGame, isPending, error, isConfirming, isConfirmed } = useGameCreate()

  const handleCreateGame = async () => {
    await createGame()
  }

  if (isConfirmed) {
    toast({
      title: 'Game Created',
      description: 'Game created successfully!',
      variant: 'default',
    })
  }

  if (error) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    })
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Choose Your Players</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Player Address"
              value={address || ''}
              disabled
              className="mb-2"
            />
            <Button
              onClick={handleCreateGame}
              disabled={isConfirming}
            >
              {isConfirming ? 'Creating Game...' : 'Create Game'}
            </Button>
          </div>

        </div>

      </div>
    </DialogContent>
  )
}