import RankingBoard from '@/components/explore/RankingBoard'
import AvailableGameList from '@/components/explore/AvailableGameList'
import CreateNewGame from './CreateNewGame'

export function ExplorePageComponent() {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore Diplomacy Games</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <AvailableGameList />
        <CreateNewGame />
        <RankingBoard />
      </div>
    </div>
  )
}