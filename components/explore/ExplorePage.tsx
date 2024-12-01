import RankingBoard from '@/components/explore/RankingBoard'
import GameExplorer from '@/components/explore/GameExplorer'
import CreateNewGame from '@/components/explore/CreateNewGame'
import { NotificationCenter } from '@/components/explore/NotificationCenter'

export function ExplorePageComponent() {

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold  mb-4 font-medieval">Explore Chain of Throne Games</h2>
        <p className="text-gray-400">Join a game room and prove your worth in the realm</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <GameExplorer />
        <div className="flex flex-col gap-6">
          <CreateNewGame />

          <RankingBoard />
        </div>
      </div>
      <NotificationCenter />
    </div>
  )
}