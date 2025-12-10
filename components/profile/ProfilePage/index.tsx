"use client";

import { TrendingUp, Trophy, Sword, Loader2, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GameFooter from "@/components/layout/GameFooter";

// Subcomponents
import { PlayerHeader } from "./PlayerHeader";
import { StatsSection } from "./StatsSection";
import { AchievementsSection } from "./AchievementsSection";
import { MatchHistorySection } from "./MatchHistorySection";

// Hooks
import { usePlayerProfileData } from "@/lib/hooks/usePlayerProfileData";

/**
 * ProfilePage Component
 *
 * Main player profile page with tabs for stats, achievements, and match history
 * Uses real data from blockchain/database via usePlayerProfileData hook
 */
export default function ProfilePage() {
  const { playerStats, isLoading, error, isConnected } = usePlayerProfileData();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Player Profile</h1>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-text-secondary" />
              <span className="ml-3 text-text-secondary">Loading profile...</span>
            </CardContent>
          </Card>
        </div>
        <GameFooter />
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Player Profile</h1>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Wallet className="h-12 w-12 text-text-muted mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-text-secondary mb-6 max-w-md">
                Connect your wallet to view your player profile, statistics, and
                match history.
              </p>
              <Button variant="outline" className="border-border">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
        <GameFooter />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Player Profile</h1>
          </div>
          <Card className="bg-card border-border border-red-500/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
        <GameFooter />
      </div>
    );
  }

  // No player stats (shouldn't happen if connected, but handle gracefully)
  if (!playerStats) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Player Profile</h1>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-text-secondary">
                No profile data available. Start playing to build your stats!
              </p>
            </CardContent>
          </Card>
        </div>
        <GameFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Player Profile</h1>
        </div>

        {/* Player Overview Header */}
        <PlayerHeader player={playerStats} />

        {/* Detailed Stats Tabs */}
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-surface-3"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-surface-3"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-surface-3"
            >
              <Sword className="w-4 h-4 mr-2" />
              Recent Matches
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <StatsSection player={playerStats} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <AchievementsSection achievements={playerStats.achievements} />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <MatchHistorySection matches={playerStats.recentMatches} />
          </TabsContent>
        </Tabs>
      </div>

      <GameFooter />
    </div>
  );
}
