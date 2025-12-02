"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import { GameStatusEnum } from "@/lib/types/gameStatus";
import { getStatusColor } from "@/lib/utils/gameStatus";

interface GameStatsCardsProps {
  totalPlayer: number;
  maxPlayer: number;
  gameStatus: GameStatusEnum;
}

export function GameStatsCards({
  totalPlayer,
  maxPlayer,
  gameStatus,
}: GameStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Players</p>
              <p className="text-lg font-semibold">
                {totalPlayer} / {maxPlayer}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge className={`${getStatusColor(gameStatus)} text-white w-max`}>
                {gameStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
