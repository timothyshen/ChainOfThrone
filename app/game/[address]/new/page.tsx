import GamePlayPage from "@/components/gamePlay/GamePlayPageNew"

export default function GamePage({ params }: { params: { address: string } }) {
  return (
    <GamePlayPage gameAddressParam={params.address as `0x${string}`} />
  )
}