import { GameProvider } from '@/lib/providers/GameProvider'
import GamePlayPage from '@/components/gamePlay/GamePlayPage'

export default function GamePage({ params }: { params: { address: string } }) {
  return (
    <GameProvider gameAddressParam={params.address as `0x${string}`}>
      <GamePlayPage />
    </GameProvider>
  )
}