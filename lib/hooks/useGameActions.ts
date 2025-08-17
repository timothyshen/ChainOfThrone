"use client";

import { useCallback } from "react";
import { Territory, Army } from "@/lib/types/game";
import { useAccount } from "wagmi";
import { useMakeMove } from "@/lib/hooks/useMakeMove";
import { useToast } from "@/lib/hooks/use-toast";
import {
  useGameStateContext,
  useSelectionContext,
  useMovementContext,
  useBattleContext,
} from "@/lib/contexts/GameContext";

interface GameActions {
  // Territory interactions
  handleTerritoryClick: (territory: Territory) => void;

  // Army interactions
  handleArmyClick: (territory: Territory, army: Army) => void;

  // Movement actions
  handleMoveToCell: (targetTerritory: Territory) => Promise<void>;
  handleAction: (
    targetTerritory: Territory,
    moveStrength: number
  ) => Promise<void>;

  // Battle actions
  handleInitializeBattle: (attacker: Army, target: Army | Territory) => void;
  handleStartBattle: (attacker: Army, target: Army | Territory) => void;

  // UI helpers
  getTerritoryColor: (owner: string) => string;
}

export function useGameActions(
  gameAddress: `0x${string}` | undefined,
  isMobile: boolean,
  setMobileBottomPanelOpen: (open: boolean) => void
): GameActions {
  const { address } = useAccount();
  const { makeMove } = useMakeMove();
  const { toast } = useToast();

  // Contexts
  const { territories, armies, refreshAllData } = useGameStateContext();
  const {
    selectedTerritory,
    selectedArmy,
    setSelectedTerritory,
    setSelectedArmy,
    clearSelection,
    selectTerritory,
    selectArmy,
  } = useSelectionContext();
  const {
    movementMode,
    setAnimatingArmies,
    setArmyPositions,
    setMoveSubmitted,
    setTargetTerritory,
    initializeMovement,
    getArmyDisplayPosition,
    cancelMovement,
  } = useMovementContext();
  const { activeBattle, initializeBattle, startBattle } = useBattleContext();

  const handleTerritoryClick = useCallback(
    (territory: Territory) => {
      console.log("Territory clicked:", territory);
      selectTerritory(territory);

      if (isMobile) {
        setMobileBottomPanelOpen(true);
      }
    },
    [selectTerritory, isMobile, setMobileBottomPanelOpen]
  );

  const handleArmyClick = useCallback(
    (territory: Territory, army: Army) => {
      console.log("Army clicked:", territory, army);
      setSelectedTerritory(territory);
      selectArmy(army);

      // Initialize movement for the selected army
      initializeMovement(army, territories);

      if (isMobile) {
        setMobileBottomPanelOpen(true);
      }

      if (selectedArmy && movementMode) {
        cancelMovement();
      }
    },
    [
      selectArmy,
      setSelectedTerritory,
      initializeMovement,
      territories,
      isMobile,
      setMobileBottomPanelOpen,
      movementMode,
      selectedArmy,
      cancelMovement,
    ]
  );

  const handleMoveToCell = useCallback(
    async (targetTerritory: Territory) => {
      if (!selectedTerritory || !address || !gameAddress) {
        toast({
          title: "Invalid Action",
          description: "Cannot perform this action at this time.",
          variant: "destructive",
        });
        return;
      }

      if (selectedArmy && movementMode) {
        // Store the target territory and show the move strength input
        setTargetTerritory(targetTerritory);
        setMoveSubmitted(true);
        console.log(
          `Move target selected: (${targetTerritory.x}, ${targetTerritory.y})`
        );
      }
    },
    [
      selectedTerritory,
      selectedArmy,
      address,
      gameAddress,
      movementMode,
      setMoveSubmitted,
      setTargetTerritory,
      toast,
    ]
  );

  const handleAction = useCallback(
    async (targetTerritory: Territory, moveStrength: number) => {
      if (!selectedTerritory || !address || !gameAddress || !selectedArmy) {
        toast({
          title: "Invalid Action",
          description: "Cannot perform this action at this time.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Start animation when user decides to move
        setAnimatingArmies((prev) => new Set([...prev, selectedArmy.id]));

        // Update army position with animation flag
        setArmyPositions((prev) => ({
          ...prev,
          [selectedArmy.id]: { ...targetTerritory, isAnimating: true },
        }));

        type Move = readonly [number, number, string, number, number, number];
        const move: Move = [
          selectedTerritory.x,
          selectedTerritory.y,
          address,
          targetTerritory.x,
          targetTerritory.y,
          moveStrength,
        ] as const;

        await makeMove(gameAddress, move);
        await refreshAllData();

        // Wait for animation to complete
        setTimeout(() => {
          // Clear animation state
          setAnimatingArmies((prev) => {
            const newSet = new Set(prev);
            newSet.delete(selectedArmy.id);
            return newSet;
          });

          // Clear the temporary animation position
          setArmyPositions((prev) => {
            const newPositions = { ...prev };
            delete newPositions[selectedArmy.id];
            return newPositions;
          });

          console.log(
            `Army ${selectedArmy.id} moved to (${targetTerritory.x}, ${targetTerritory.y})`
          );
        }, 800); // Animation duration

        // Reset movement state
        cancelMovement();
      } catch (error) {
        console.error("Error making move:", error);

        // Clear animation on error
        setAnimatingArmies((prev) => {
          const newSet = new Set(prev);
          newSet.delete(selectedArmy.id);
          return newSet;
        });

        setArmyPositions((prev) => {
          const newPositions = { ...prev };
          delete newPositions[selectedArmy.id];
          return newPositions;
        });

        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to submit move to the blockchain",
          variant: "destructive",
        });
      }
    },
    [
      selectedTerritory,
      selectedArmy,
      address,
      gameAddress,
      makeMove,
      refreshAllData,
      setAnimatingArmies,
      setArmyPositions,
      cancelMovement,
      toast,
    ]
  );

  const handleInitializeBattle = useCallback(
    (attacker: Army, target: Army | Territory) => {
      // Don't start a new battle if one is already active
      if (!activeBattle) {
        initializeBattle(attacker, target);
      }
    },
    [initializeBattle, activeBattle]
  );

  const handleStartBattle = useCallback(
    (attacker: Army, target: Army | Territory) => {
      // Clear movement mode when starting battle
      cancelMovement();
      startBattle(attacker, target, getArmyDisplayPosition);
    },
    [startBattle, getArmyDisplayPosition, cancelMovement]
  );

  const getTerritoryColor = useCallback((owner: string): string => {
    const colors: Record<string, string> = {
      P1: "#3B82F6", // Blue
      P2: "#EF4444", // Red
      P3: "#10B981", // Green
      P4: "#F59E0B", // Yellow
    };
    return colors[owner] || "#6B7280"; // Default gray
  }, []);

  return {
    handleTerritoryClick,
    handleArmyClick,
    handleMoveToCell,
    handleAction,
    handleInitializeBattle,
    handleStartBattle,
    getTerritoryColor,
  };
}
