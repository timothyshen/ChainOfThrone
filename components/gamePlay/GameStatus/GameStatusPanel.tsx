import { GameOverview } from "./GameOverview"
import GameStatus from "./GameStatus"

export default function GameStatusPanel() {
    return (
        <>
            <GameStatus isLoading={false} currentPlayer="0x123" gameStatus={GameStatusEnum.NOT_STARTED} totalPlayer={0} maxPlayer={0} playerAddresses={[]} setGameStatus={() => { }} setTotalPlayer={() => { }} fetchGameData={() => { }} />
            <GameOverview territories={[]} />
        </>
    )
}