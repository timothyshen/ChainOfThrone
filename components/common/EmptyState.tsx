"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Swords, Users, Trophy, GamepadIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="mb-4 text-muted-foreground opacity-50">{icon}</div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  );
}

interface NoGamesEmptyStateProps {
  action?: ReactNode;
}

export function NoGamesEmptyState({ action }: NoGamesEmptyStateProps) {
  return (
    <EmptyState
      icon={<GamepadIcon className="h-12 w-12" />}
      title="No Games Available"
      description="There are no games to display. Create a new game to get started!"
      action={action}
    />
  );
}

export function NoPlayersEmptyState() {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="Waiting for Players"
      description="No players have joined yet. Share this game to invite others!"
    />
  );
}

interface NoRankingsEmptyStateProps {
  action?: ReactNode;
}

export function NoRankingsEmptyState({ action }: NoRankingsEmptyStateProps) {
  return (
    <EmptyState
      icon={<Trophy className="h-12 w-12" />}
      title="No Rankings Yet"
      description="Rankings will appear here once players complete games."
      action={action}
    />
  );
}

export function NoHistoryEmptyState() {
  return (
    <EmptyState
      icon={<Swords className="h-12 w-12" />}
      title="No Game History"
      description="Your completed games will appear here. Start playing to build your history!"
    />
  );
}
