"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import {
    Globe,
    Handshake,
    Shield,
    Crown,
    BarChart3,
    Scroll,
    TrendingUp,
    TrendingDown,
    History,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type PowerName = "Great Britain" | "France" | "Germany" | "Italy" | "Austria-Hungary" | "Russia" | "Turkey"
type GameResultType = "win" | "loss"

interface DiplomacyAnalysisProps {
    type: GameResultType
    power: PowerName
    year: string
    stats: {
        supplyCenters?: number
        territories?: number
        alliances?: number
        betrayals?: number
        totalYears?: number
        winnerName?: PowerName
        winnerSupplyCenters?: number
    }
    onBack: () => void
}

// Get color for each power
const getPowerColor = (power: PowerName): string => {
    const colors: Record<PowerName, string> = {
        "Great Britain": "text-blue-600 dark:text-blue-400",
        France: "text-blue-500 dark:text-blue-300",
        Germany: "text-gray-700 dark:text-gray-300",
        Italy: "text-green-600 dark:text-green-400",
        "Austria-Hungary": "text-red-600 dark:text-red-400",
        Russia: "text-slate-600 dark:text-slate-300",
        Turkey: "text-yellow-600 dark:text-yellow-400",
    }
    return colors[power] || "text-primary"
}

// Get background color for each power
const getPowerBgColor = (power: PowerName): string => {
    const colors: Record<PowerName, string> = {
        "Great Britain": "bg-blue-100 dark:bg-blue-900/20",
        France: "bg-blue-50 dark:bg-blue-900/10",
        Germany: "bg-gray-100 dark:bg-gray-800/30",
        Italy: "bg-green-50 dark:bg-green-900/10",
        "Austria-Hungary": "bg-red-50 dark:bg-red-900/10",
        Russia: "bg-slate-100 dark:bg-slate-800/30",
        Turkey: "bg-yellow-50 dark:bg-yellow-900/10",
    }
    return colors[power] || "bg-primary/10"
}

// Mock data for supply center history
const supplyHistory = [
    { year: "1901", centers: 3 },
    { year: "1902", centers: 5 },
    { year: "1903", centers: 6 },
    { year: "1904", centers: 7 },
    { year: "1905", centers: 6 },
    { year: "1906", centers: 8 },
    { year: "1907", centers: 7 },
    { year: "1908", centers: 8 },
]

// Strengths and weaknesses based on power
const getStrengthsAndWeaknesses = (power: PowerName) => {
    const analysis: Record<PowerName, { strengths: string[]; weaknesses: string[] }> = {
        "Great Britain": {
            strengths: ["Naval dominance", "Secure home centers", "Strong defensive position"],
            weaknesses: ["Limited expansion opportunities", "Dependent on alliances for growth"],
        },
        France: {
            strengths: ["Balanced position", "Multiple expansion routes", "Strong defensive borders"],
            weaknesses: ["Three-front vulnerability", "Naval competition with England"],
        },
        Germany: {
            strengths: ["Central position for rapid expansion", "Strong starting military", "Multiple alliance options"],
            weaknesses: ["Surrounded on all sides", "Vulnerable to early coalitions"],
        },
        Italy: {
            strengths: ["Secure southern position", "Naval potential", "Flexible alliance options"],
            weaknesses: ["Slow initial growth", "Limited home supply centers", "Difficult expansion routes"],
        },
        "Austria-Hungary": {
            strengths: ["Central position", "Multiple expansion routes", "Strong starting position"],
            weaknesses: ["Vulnerable to early attacks", "Surrounded by potential enemies", "Complex defensive requirements"],
        },
        Russia: {
            strengths: ["Most starting units", "Multiple expansion fronts", "Presence in all theaters"],
            weaknesses: ["Overextended position", "Slow unit movement", "Vulnerable to coordinated attacks"],
        },
        Turkey: {
            strengths: ["Defensible corner position", "Secure home centers", "Strong regional influence"],
            weaknesses: ["Slow expansion", "Limited early growth options", "Potential diplomatic isolation"],
        },
    }

    return analysis[power]
}

// Recommendations based on power and result
const getRecommendations = (power: PowerName, type: GameResultType) => {
    if (type === "win") {
        return [
            "Maintain diplomatic flexibility throughout the game",
            "Secure key strategic centers early",
            "Time your alliances and betrayals strategically",
            "Balance expansion with defensive positioning",
        ]
    }

    const recommendations: Record<PowerName, string[]> = {
        "Great Britain": [
            "Focus on securing Scandinavia earlier",
            "Develop stronger continental alliances",
            "Consider a Mediterranean strategy to outflank France",
        ],
        France: [
            "Secure Iberia before expanding eastward",
            "Develop a clearer alliance strategy with either England or Germany",
            "Consider naval buildup to challenge British dominance",
        ],
        Germany: [
            "Avoid fighting two-front wars",
            "Secure a strong alliance with either Russia or Austria-Hungary",
            "Focus on continental dominance before naval expansion",
        ],
        Italy: [
            "Commit to either an eastern or western strategy earlier",
            "Develop stronger diplomatic ties with non-neighboring powers",
            "Consider bolder opening moves to secure early growth",
        ],
        "Austria-Hungary": [
            "Secure a strong early alliance with either Russia or Turkey",
            "Focus on Balkan dominance before expanding further",
            "Develop a clearer long-term strategy beyond survival",
        ],
        Russia: [
            "Avoid overextension on multiple fronts",
            "Prioritize either northern or southern expansion",
            "Develop stronger diplomatic relationships to prevent encirclement",
        ],
        Turkey: [
            "Expand more aggressively in the early game",
            "Develop naval presence in the Mediterranean sooner",
            "Form stronger alliances to break out of the southeastern corner",
        ],
    }

    return recommendations[power]
}

// Map Component (simplified representation)
const DiplomacyMap = memo(({ power, supplyCenters }: { power: PowerName; supplyCenters: number }) => {
    return (
        <div
            className={cn(
                "relative rounded-lg overflow-hidden border h-48 flex items-center justify-center",
                "border-slate-200 dark:border-slate-700",
                getPowerBgColor(power),
            )}
        >
            <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 800 500" className="w-full h-full">
                    {/* Simplified Europe map outline */}
                    <path
                        d="M400,100 Q500,150 550,250 Q600,350 500,400 Q400,450 300,400 Q200,350 250,250 Q300,150 400,100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className={getPowerColor(power).replace("text-", "stroke-")}
                    />

                    {/* Supply centers as dots */}
                    {Array.from({ length: 34 }).map((_, i) => {
                        const angle = (i / 34) * Math.PI * 2
                        const radius = 150 + (i % 3) * 30
                        const x = 400 + Math.cos(angle) * radius
                        const y = 250 + Math.sin(angle) * radius

                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r={6}
                                className={
                                    i < supplyCenters
                                        ? getPowerColor(power).replace("text-", "fill-")
                                        : "fill-gray-300 dark:fill-gray-600"
                                }
                            />
                        )
                    })}
                </svg>
            </div>

            <div className="relative z-10 text-center p-4">
                <Globe className={cn("h-10 w-10 mx-auto mb-2", getPowerColor(power))} />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Territory Control</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Supply Centers: {supplyCenters}/34</p>
                <Progress value={(supplyCenters / 34) * 100} className="h-2 w-48 mx-auto" />
            </div>
        </div>
    )
})
DiplomacyMap.displayName = "DiplomacyMap"

// Supply Center History Chart
const SupplyCenterChart = memo(({ data }: { data: { year: string; centers: number }[] }) => {
    const maxCenters = Math.max(...data.map((d) => d.centers))

    return (
        <div className="h-48 flex flex-col">
            <div className="flex-1 flex items-end gap-1">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div
                            className="w-full bg-blue-500 dark:bg-blue-600 rounded-t"
                            style={{ height: `${(item.centers / maxCenters) * 100}%` }}
                        ></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 text-center">
                        {item.year}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-1">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 text-center text-xs font-medium">
                        {item.centers}
                    </div>
                ))}
            </div>
        </div>
    )
})
SupplyCenterChart.displayName = "SupplyCenterChart"

// Main Analysis Component
const DiplomacyAnalysis = memo(({ type, power, year, stats, onBack }: DiplomacyAnalysisProps) => {
    const analysis = getStrengthsAndWeaknesses(power)
    const recommendations = getRecommendations(power, type)

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Diplomatic Analysis
                </h2>
                <Button variant="ghost" size="sm" onClick={onBack}>
                    Back to Summary
                </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <DiplomacyMap power={power} supplyCenters={stats.supplyCenters || 8} />

                    <Card>
                        <CardHeader className="py-3 px-4">
                            <h3 className="text-sm font-medium flex items-center gap-1.5">
                                <Crown className="h-4 w-4" />
                                Game Summary
                            </h3>
                        </CardHeader>
                        <CardContent className="py-2 px-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Power</span>
                                <span className={cn("font-medium", getPowerColor(power))}>{power}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Final Year</span>
                                <span className="font-medium">{year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Result</span>
                                <span
                                    className={cn(
                                        "font-medium",
                                        type === "win" ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-400",
                                    )}
                                >
                                    {type === "win" ? "Victory" : "Defeat"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Supply Centers</span>
                                <span className="font-medium">{stats.supplyCenters || 8}/34</span>
                            </div>
                            {type === "loss" && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Victor</span>
                                    <span className="font-medium">{stats.winnerName || "France"}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="strategy" className="space-y-4">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <h3 className="text-sm font-medium flex items-center gap-1.5">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Strengths
                            </h3>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <ul className="space-y-2">
                                {analysis.strengths.map((strength, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-3 px-4">
                            <h3 className="text-sm font-medium flex items-center gap-1.5">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                Weaknesses
                            </h3>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <ul className="space-y-2">
                                {analysis.weaknesses.map((weakness, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                        <span className="text-sm">{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-3 px-4">
                            <h3 className="text-sm font-medium flex items-center gap-1.5">
                                <Scroll className="h-4 w-4 text-blue-500" />
                                Recommendations
                            </h3>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <ul className="space-y-2">
                                {recommendations.map((recommendation, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Shield className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span className="text-sm">{recommendation}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <h3 className="text-sm font-medium flex items-center gap-1.5">
                                <History className="h-4 w-4" />
                                Supply Center History
                            </h3>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <SupplyCenterChart data={supplyHistory} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-3 px-4">
                            <h3 className="text-sm font-medium flex items-center gap-1.5">
                                <Handshake className="h-4 w-4 text-green-500" />
                                Diplomatic Events
                            </h3>
                        </CardHeader>
                        <CardContent className="py-2 px-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                                    1901
                                </div>
                                <span>Alliance formed with {power === "France" ? "Italy" : "France"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs px-2 py-1 rounded">
                                    1903
                                </div>
                                <span>Non-aggression pact with {power === "Russia" ? "Turkey" : "Russia"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded">
                                    1905
                                </div>
                                <span>Betrayed by {power === "Germany" ? "Russia" : "Germany"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                                    1907
                                </div>
                                <span>New alliance with {power === "Austria-Hungary" ? "Italy" : "Austria-Hungary"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    )
})
DiplomacyAnalysis.displayName = "DiplomacyAnalysis"

export default DiplomacyAnalysis

