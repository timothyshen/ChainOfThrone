import { SiegeEffect } from "@/lib/types/advancedGame"
import { Crown } from "lucide-react"

interface SiegeEffectOverlayProps {
    siegeEffects: SiegeEffect[]
}

const SiegeEffectOverlay = ({ siegeEffects }: SiegeEffectOverlayProps) => {
    return (
        <div className="absolute inset-0 p-4 pointer-events-none z-30">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                {siegeEffects.map((effect) => (
                    <div
                        key={effect.id}
                        className="absolute flex items-center justify-center"
                        style={{
                            left: `${effect.x * 33.333 + 16.666}%`,
                            top: `${effect.y * 33.333 + 16.666}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        {effect.type === "catapult" && (
                            <div className="relative">
                                {effect.projectile && (
                                    <div
                                        className="absolute w-3 h-3 bg-orange-500 rounded-full"
                                        style={{
                                            animation: `catapultProjectile-${effect.id} 1.5s ease-in-out forwards`,
                                        }}
                                    />
                                )}
                                <div className="w-16 h-16 bg-orange-600 rounded-full animate-ping opacity-75" />
                                <div
                                    className="absolute inset-0 w-12 h-12 bg-red-500 rounded-full animate-pulse"
                                    style={{ margin: "8px" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-orange-200 font-bold text-xs">CATAPULT</div>
                                </div>

                                <style jsx>{`
                      @keyframes catapultProjectile-${effect.id} {
                        0% {
                          left: ${(effect.startX! - effect.x) * 33.333}%;
                          top: ${(effect.startY! - effect.y) * 33.333}%;
                          transform: translate(-50%, -50%);
                        }
                        50% {
                          top: ${(effect.startY! - effect.y) * 33.333 - 20}%;
                        }
                        100% {
                          left: 0%;
                          top: 0%;
                          transform: translate(-50%, -50%);
                        }
                      }
                    `}</style>
                            </div>
                        )}

                        {effect.type === "battering_ram" && (
                            <div className="relative">
                                <div className="w-12 h-8 bg-amber-700 rounded animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-2 bg-amber-900 animate-bounce" />
                                </div>
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-amber-200 font-bold text-xs">
                                    RAM
                                </div>
                            </div>
                        )}

                        {effect.type === "wall_damage" && (
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-slate-600 rounded animate-pulse opacity-75" />
                                <div className="absolute inset-2 bg-red-500 animate-ping opacity-50" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-red-400 font-bold text-sm animate-bounce">CRACK!</div>
                                </div>
                            </div>
                        )}

                        {effect.type === "fire" && (
                            <div className="relative">
                                <div className="w-8 h-12 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 animate-pulse" />
                                <div className="absolute -inset-2 bg-orange-400 rounded-full animate-ping opacity-30" />
                            </div>
                        )}

                        {effect.type === "breach" && (
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-slate-400 rounded opacity-50" />
                                <div className="absolute inset-4 bg-gradient-to-br from-red-600 to-orange-500 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-green-400 font-bold text-lg animate-bounce">BREACH!</div>
                                </div>
                            </div>
                        )}

                        {effect.type === "victory" && (
                            <div className="relative">
                                <div className="w-20 h-20 bg-green-500 rounded-full animate-ping opacity-50" />
                                <Crown
                                    className="absolute inset-0 w-10 h-10 text-yellow-400 animate-pulse"
                                    style={{ margin: "20px" }}
                                />
                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-green-400 font-bold text-sm">
                                    CAPTURED!
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SiegeEffectOverlay