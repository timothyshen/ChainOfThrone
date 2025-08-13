// import GamePlayPage from '@/components/gamePlay/GamePlayPage'
import GamePlayPage from '@/components/gamePlay/GamePlayPageNew'
import GamePlayPageRefactored from '@/components/gamePlay/GamePlayPageRefactored'

export default function GamePage({ params }: { params: { address: string } }) {
  return (
    <GamePlayPageRefactored gameAddressParam={params.address as `0x${string}`} />
  )
}