"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart3,
    Building,
    Crown,
    Flag,
    Globe,
    Map,
    Scroll,
    Swords,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useClaimReward } from "@/lib/hooks/useClaimReward"
import { toast } from "@/lib/hooks/use-toast"
import { getWinnerAmount } from "@/lib/hooks/ReadGameContract"
// import DiplomacyAnalysis from "./diplomacy-analysis"

// Types for our components
type GameResultType = "win" | "loss"

interface DiplomacyResultModalProps {
    gameAddress: `0x${string}`
    type: GameResultType
    open: boolean
    onOpenChange: (open: boolean) => void
    year: string
    stats?: {
        supplyCenters?: number
        territories?: number
        alliances?: number
        betrayals?: number
        totalYears?: number
        winnerName?: `0x${string}`
        winnerSupplyCenters?: number
    }
}

interface IconSectionProps {
    type: GameResultType
}

interface StatsSectionProps {
    gameAddress: `0x${string}`
    type: GameResultType
    stats: {
        supplyCenters?: number
        territories?: number
        alliances?: number
        betrayals?: number
        totalYears?: number
        winnerName?: `0x${string}`
        winnerSupplyCenters?: number
    }
    year: string
}

interface ActionSectionProps {
    type: GameResultType
    gameAddress: `0x${string}`
}

interface FooterSectionProps {
    type: GameResultType
    onClose: () => void
    onSecondaryAction: () => void
}

// Memoized components to prevent unnecessary re-renders

// Icon Section Component
const IconSection = memo(({ type }: IconSectionProps) => {
    if (type === "win") {
        return (
            <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center",
                        "bg-slate-100 dark:bg-slate-800 border-2",
                        type === "win" ? "border-amber-500" : "border-slate-300",
                    )}
                >
                    <Crown className="h-10 w-10 text-blue-600 dark:text-blue-400 text-primary" />
                </div>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="absolute -top-1 -right-1 bg-amber-100 dark:bg-amber-900/30 p-1 rounded-full"
                >
                    <Flag className="h-6 w-6 text-amber-500" />
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
            }}
            className="relative"
        >
            <div className="h-20 w-20 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 border-2 border-slate-300">
                <Map className="h-10 w-10 text-blue-600 dark:text-blue-400 text-primary" />
            </div>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="absolute -bottom-1 -right-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-full"
            >
                <Swords className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </motion.div>
        </motion.div>
    )
})
IconSection.displayName = "IconSection"

// Stats Section Component
const StatsSection = memo(({ gameAddress, type, stats, year }: StatsSectionProps) => {

    const [reward, setReward] = useState(0)

    useEffect(() => {
        const fetchReward = async () => {
            const reward = await getWinnerAmount(gameAddress)
            setReward(reward as number)
        }
        fetchReward()
    }, [gameAddress])

    if (type === "win") {
        return (
            <Card className="border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                <CardHeader className="pb-2 pt-4 px-4">
                    <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        Diplomatic Victory
                    </h3>
                </CardHeader>
                <CardContent className="px-4 py-2 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            <span className="text-slate-700 dark:text-slate-300">Castles</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{stats.supplyCenters || 5}/5</span>
                    </div>

                </CardContent>
                <CardFooter className="px-4 pt-2 pb-4 border-t border-amber-200 dark:border-amber-900/30">
                    <div className="flex justify-between items-center w-full">
                        <span className="font-medium text-slate-800 dark:text-slate-200">Reward</span>
                        <span className="font-bold text-lg text-amber-700 dark:text-amber-400">{reward || "0"}</span>
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <CardHeader className="pb-2 pt-4 px-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4" />
                    Diplomatic Standing
                </h3>
            </CardHeader>
            <CardContent className="px-4 py-2 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-500" />
                        <span className="text-slate-700 dark:text-slate-300">Your Castles</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{stats.supplyCenters || 8}/5</span>
                </div>

            </CardContent>
        </Card>
    )
})
StatsSection.displayName = "StatsSection"

// Action Section Component
const ActionSection = memo(({ type, gameAddress }: ActionSectionProps) => {
    const { claimReward, isConfirmed, isPending, error } = useClaimReward()

    if (type !== "win") return null;

    if (error) {
        toast({
            title: "Error",
            description: "An error occurred while claiming your reward",
        })
    }
    return (
        <div>
            <p className="text-center font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-center gap-2">
                <Scroll className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Redeem your reward
            </p>

            <Button
                className={cn(
                    "w-full py-6 text-base font-medium transition-all",
                    isConfirmed
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                )}
                onClick={() => claimReward(gameAddress)}
                disabled={isConfirmed || isPending}
            >
                {isPending ? "Claiming..." : isConfirmed ? "Reward Claimed" : "Claim Reward"}
            </Button>
        </div>
    )
})
ActionSection.displayName = "ActionSection"

// Footer Section Component
const FooterSection = memo(({ type, onClose, onSecondaryAction }: FooterSectionProps) => {

    if (type === "win") {
        return (
            <>
                <p className="text-slate-600 dark:text-slate-400 text-center mb-2">
                    Would you like to start a new game of diplomacy?
                </p>

                <div className="flex gap-3 justify-center w-full">
                    <Button variant="outline" onClick={onClose} className="px-6">
                        Close
                    </Button>
                    <Button
                        className="px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        onClick={onSecondaryAction}
                    >
                        New Game
                    </Button>
                </div>
            </>
        )
    }

    return (
        <>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-2">
                Would you like to try another diplomatic strategy?
            </p>

            <div className="flex gap-3 justify-center w-full">
                <Button variant="outline" onClick={onClose} className="px-6">
                    Exit
                </Button>
                <Button
                    className="px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    onClick={onSecondaryAction}
                >
                    New Game
                </Button>
            </div>
        </>
    )
})
FooterSection.displayName = "FooterSection"

// Main Modal Component
export function DiplomacyResultModal({
    type = "win",
    open = false,
    onOpenChange,
    year = "Fall, 1908",
    stats = {},
    gameAddress = "0x0000000000000000000000000000000000000000",
}: DiplomacyResultModalProps) {

    // const { claimReward } = useClaimReward(gameAddress)

    const [actionTaken, setActionTaken] = useState(false)
    const [showAnalysis, setShowAnalysis] = useState(false)

    const handleAction = useCallback(() => {
        setActionTaken(true)
    }, [])

    const handleClose = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    const handleSecondaryAction = useCallback(() => {
        // Start new game
        console.log("Starting new game")
        onOpenChange(false)
    }, [onOpenChange])

    const handleBackToSummary = useCallback(() => {
        setShowAnalysis(false)
    }, [])



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
                <AnimatePresence mode="wait">

                    <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DialogHeader className="pt-8 pb-2 px-6 text-center">
                            <div className="flex justify-center mb-4">
                                <IconSection type={type} />
                            </div>

                            <DialogTitle className="text-2xl font-bold text-center">
                                {type === "win" ? "Diplomatic Victory!" : "Diplomatic Defeat"}
                            </DialogTitle>

                            <DialogDescription className="text-center pt-1">
                                <span className="h-10 w-10 text-blue-600 dark:text-blue-400 text-primary">Player 1</span>
                                {type === "win" ? " has achieved dominance over Europe" : " has been outmaneuvered"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={cn(
                                    "p-3 rounded-lg mb-4 border",
                                    type === "win"
                                        ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-900/30"
                                        : "bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border-slate-200 dark:border-slate-700",
                                )}
                            >
                                <p className="font-medium text-lg text-slate-800 dark:text-slate-200 text-center">
                                    {type === "win"
                                        ? "The balance of power has shifted in your favor!"
                                        : "The diplomatic landscape has shifted against you."}
                                </p>
                            </motion.div>

                            {/* Stats Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-6"
                            >
                                <StatsSection gameAddress={gameAddress} type={type} stats={stats} year={year} />
                            </motion.div>

                            {/* Action Section */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mb-6"
                            >
                                <ActionSection type={type} gameAddress={gameAddress} />
                            </motion.div>
                        </div>

                        <DialogFooter className="px-6 pb-6 flex-col sm:flex-col gap-3">
                            <FooterSection type={type} onClose={handleClose} onSecondaryAction={handleSecondaryAction} />
                        </DialogFooter>
                    </motion.div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}

