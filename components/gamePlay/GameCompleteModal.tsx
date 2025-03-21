"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, X, Gift, Sparkles, Coins, Star, Clock, Award } from "lucide-react"

import { useRouter } from "next/navigation";
import { getWinner } from "@/lib/hooks/ReadGameContract";
import { useEffect, useState } from "react";
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
interface GameCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
}
// TODO: Add a winner to the modal
// TODO: Add tie condition

export default function GameCompleteModal({ isOpen, onClose }: GameCompleteModalProps) {
    const [isWinner, setIsWinner] = useState(true)
    useEffect(() => {
        // getWinner(address)
    })

    const router = useRouter();

    const handleExploreGames = () => {
        router.push("/explore");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="pt-8 pb-2 px-6 text-center">
                    <div className="flex justify-center mb-4">
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
                            <Trophy className="h-16 w-16 text-yellow-500 fill-yellow-400" />
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Sparkles className="h-6 w-6 text-yellow-500" />
                            </motion.div>
                        </motion.div>
                    </div>

                    <DialogTitle className="text-2xl font-bold text-center">Game Completed!</DialogTitle>

                    <DialogDescription className="text-center pt-1">The game has been completed.</DialogDescription>
                </DialogHeader>
                {isWinner ? (
                    <>
                        <div className="px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-3 rounded-lg mb-4"
                            >
                                <p className="font-medium text-lg text-slate-800 dark:text-slate-200 text-center">
                                    Congrats! You are the winner
                                </p>
                            </motion.div>

                            {/* Pricing/Rewards Details Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-6"
                            >
                                <Card className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <CardHeader className="pb-2 pt-4 px-4">
                                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            <Award className="h-4 w-4" />
                                            Reward Details
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="px-4 py-2 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-5 w-5 text-amber-500" />
                                                <span className="text-slate-700 dark:text-slate-300">Points Earned</span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">1,250</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Coins className="h-5 w-5 text-yellow-600" />
                                                <span className="text-slate-700 dark:text-slate-300">Bonus Coins</span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">+500</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-blue-500" />
                                                <span className="text-slate-700 dark:text-slate-300">Completion Time</span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">12:45</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-center w-full">
                                            <span className="font-medium text-slate-800 dark:text-slate-200">Total Value</span>
                                            <span className="font-bold text-lg text-primary">$25.00</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>

                            {/* Reward section */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
                                <p className="text-center font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-center gap-2">
                                    <Gift className="h-5 w-5 text-primary" />
                                    Here is your reward!
                                </p>

                                <Button
                                    className={cn(
                                        "w-full py-6 text-base font-medium transition-all",
                                        claimed ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90",
                                    )}
                                    onClick={() => setClaimed(true)}
                                    disabled={claimed}
                                >
                                    {claimed ? "Reward Claimed!" : "Claim the reward"}
                                </Button>
                            </motion.div>
                        </div>

                    </>
                ) : (
                    <div>Unfortunately you have lost the game</div>
                )}
            </DialogContent>
            <DialogFooter className="px-6 pb-6 flex-col sm:flex-col gap-3">
                <p className="text-slate-600 dark:text-slate-400 text-center mb-2">
                    Thank you for playing! Would you like to explore more games?
                </p>

                <div className="flex gap-3 justify-center w-full">
                    <Button variant="outline" onClick={() => setOpen(false)} className="px-6">
                        Close
                    </Button>
                    <Button
                        className="px-6"
                    >
                        Explore Games
                    </Button>
                </div>
            </DialogFooter>
        </Dialog>
    );
}






