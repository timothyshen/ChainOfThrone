import { useGamesList } from '../lib/hooks/useGamesList'

export function GamesList() {
  const { games, isLoading, currentPage, setCurrentPage } = useGamesList()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {games?.map((game) => (
        <div key={game.gameAddress}>
          <h3>Game: {game.gameAddress}</h3>
          <p>Status: {getStatusString(game.status)}</p>
          <p>Players: {game.totalPlayers.toString()}</p>
          <p>Round: {game.roundNumber.toString()}</p>
        </div>
      ))}
      <button onClick={() => setCurrentPage(p => p + 1)}>Next Page</button>
    </div>
  )
}

function getStatusString(status: number) {
  switch (status) {
    case 0:
      return 'Not Started'
    case 1:
      return 'Ongoing'
    case 2:
      return 'Finished'
    default:
      return 'Unknown'
  }
} 