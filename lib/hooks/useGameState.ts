import { useState, useEffect } from "react";
import { GameState, Player, Unit } from "@/lib/constants/game";
import { VICTORY_CONDITION } from "@/lib/constants/game-config";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    year: 1901,
    season: "Spring",
    phase: "order",
    winner: null,
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const advanceGameState = () => {
    setGameState((prevState) => {
      let newState = { ...prevState };
      if (prevState.season === "Spring") {
        newState.season = "Fall";
      } else {
        newState.season = "Spring";
        newState.year += 1;
      }
      newState.phase = "order";
      return newState;
    });
    setCurrentPlayerIndex(0);
    setUnits((prevUnits) =>
      prevUnits.map((u) => ({ ...u, dislodged: false, mustRetreat: false }))
    );
  };

  const checkVictoryCondition = () => {
    const winner = players.find((p) => p.supplyCenters >= VICTORY_CONDITION);
    if (winner) {
      setGameState((prevState) => ({ ...prevState, winner }));
    }
  };

  useEffect(() => {
    checkVictoryCondition();
  }, [players]);

  return {
    gameState,
    setGameState,
    players,
    setPlayers,
    units,
    setUnits,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    advanceGameState,
  };
}
