import GamePlayPage from '@/components/gamePlay/GamePlayPage'
import { GameErrorBoundary } from '@/components/common/ErrorBoundary'

export default function GamePage({ params }: { params: { address: string } }) {
  return (
    <GameErrorBoundary gameName="game board">
      <GamePlayPage gameAddressParam={params.address as `0x${string}`} />
    </GameErrorBoundary>
  )
}