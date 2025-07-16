import { Army, Territory } from "@/lib/types/game"
import { BattleTarget } from "@/lib/types/advancedGame"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Sword } from "lucide-react"

interface SiegeBattleModalProps {
    battleTarget: BattleTarget
    selectedArmy: Army
    setShowBattlePreview: (show: boolean) => void
    setBattleTarget: (target: any) => void
    startBattle: (attacker: Army, target: Army | Territory) => void
    calculateBattleOdds: (attacker: Army, target: Army | Territory) => { attackerOdds: number, defenderOdds: number }
}
const SiegeBattleModal = ({ battleTarget, selectedArmy, setShowBattlePreview, setBattleTarget, startBattle, calculateBattleOdds }: SiegeBattleModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-96 max-w-[90vw]">
                <CardContent className="p-6">
                    {(() => {
                        const target = battleTarget.army || battleTarget.territory!
                        const isFortified =
                            battleTarget.territory &&
                            (battleTarget.territory.isCastle)

                        return (
                            <>
                                <h3 className="text-xl font-bold mb-4 text-center">
                                    {isFortified ? "Siege Preview" : "Battle Preview"}
                                </h3>

                                {isFortified && (
                                    <div className="mb-4 p-3 bg-orange-900/30 border border-orange-600 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-4 h-4 text-orange-400" />
                                            <span className="text-orange-400 font-semibold">Fortified Position</span>
                                        </div>
                                        <div className="text-sm text-orange-300">
                                            This {battleTarget.territory!.isCastle ? "castle" : "stronghold"} has strong defenses. Siege will take longer and cause more
                                            casualties.
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-blue-400">Attacker</div>
                                        <div className="text-sm">{selectedArmy.owner}</div>
                                        <div className="text-2xl font-bold">{selectedArmy.size}</div>
                                        <div className="text-xs text-slate-400">troops</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-red-400">Defender</div>
                                        <div className="text-sm">{battleTarget.army?.owner || battleTarget.territory?.player}</div>
                                        <div className="text-2xl font-bold">
                                            {battleTarget.army?.size || (battleTarget.territory && Number(battleTarget.territory.units[0]) * 10)}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {battleTarget.army ? "troops" : isFortified ? "fortified strength" : "strength"}
                                        </div>
                                    </div>
                                </div>

                                {(() => {
                                    const { attackerOdds, defenderOdds } = calculateBattleOdds(selectedArmy, target)
                                    const adjustedAttackerOdds = isFortified ? attackerOdds * 0.7 : attackerOdds
                                    const adjustedDefenderOdds = 1 - adjustedAttackerOdds

                                    return (
                                        <div className="mb-4">
                                            <div className="text-sm text-center mb-2">
                                                {isFortified ? "Siege Odds (Reduced)" : "Battle Odds"}
                                            </div>
                                            <div className="flex">
                                                <div
                                                    className="bg-blue-500 h-4 flex items-center justify-center text-xs text-white"
                                                    style={{ width: `${adjustedAttackerOdds * 100}%` }}
                                                >
                                                    {Math.round(adjustedAttackerOdds * 100)}%
                                                </div>
                                                <div
                                                    className="bg-red-500 h-4 flex items-center justify-center text-xs text-white"
                                                    style={{ width: `${adjustedDefenderOdds * 100}%` }}
                                                >
                                                    {Math.round(adjustedDefenderOdds * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}

                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            const target = battleTarget.army || battleTarget.territory!
                                            startBattle(selectedArmy, target)
                                        }}
                                    >
                                        {isFortified ? (
                                            <>
                                                <Shield className="w-4 h-4 mr-2" />
                                                Begin Siege!
                                            </>
                                        ) : (
                                            <>
                                                <Sword className="w-4 h-4 mr-2" />
                                                Attack!
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowBattlePreview(false)
                                            setBattleTarget(null)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )
                    })()}
                </CardContent>
            </Card>
        </div>
    )
}

export default SiegeBattleModal