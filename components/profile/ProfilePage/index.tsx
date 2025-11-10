import { TrendingUp, Trophy, Sword } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GameFooter from "@/components/layout/GameFooter"

// Subcomponents
import { PlayerHeader } from "./PlayerHeader"
import { StatsSection } from "./StatsSection"
import { AchievementsSection } from "./AchievementsSection"
import { MatchHistorySection } from "./MatchHistorySection"

// Data
import { getMockPlayerStats } from "./mockData"

/**
 * ProfilePage Component
 *
 * Main player profile page with tabs for stats, achievements, and match history
 * Uses mock data for now - replace with real data fetching in future
 */
export default function ProfilePage() {
  // TODO: Replace with real data fetching hook
  const currentPlayer = getMockPlayerStats()

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Player Profiles</h1>
        </div>

        {/* Player Overview Header */}
        <PlayerHeader player={currentPlayer} />

        {/* Detailed Stats Tabs */}
        <Tabs defaultValue="stats" className="space-y-4 text-white">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-slate-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-slate-700"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-slate-700"
            >
              <Sword className="w-4 h-4 mr-2" />
              Recent Matches
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <StatsSection player={currentPlayer} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <AchievementsSection achievements={currentPlayer.achievements} />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <MatchHistorySection matches={currentPlayer.recentMatches} />
          </TabsContent>
        </Tabs>
      </div>

      <GameFooter />
    </div>
  )
}
