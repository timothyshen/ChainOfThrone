import { BattleEffect } from "@/lib/types/advancedGame"
import { Crown, Sword, Zap } from "lucide-react"

interface BattleEffectOverlayProps {
    battleEffects: BattleEffect[]
}

const BattleEffectOverlay = ({ battleEffects }: BattleEffectOverlayProps) => {
    return (<div className="absolute inset-0 pointer-events-none z-30">
        {battleEffects.map((effect) => (
            <div
                key={effect.id}
                className="absolute flex items-center justify-center"
                style={{
                    left: `${(effect.x / 2) * 100}%`,
                    top: `${(effect.y / 2) * 100}%`,
                    transform: "translate(-50%, -50%)",
                }}
            >
                    {effect.type === "clash" && (
                        <div className="relative animate-in fade-in zoom-in duration-300">
                            {/* Outer shockwave */}
                            <div className="w-12 h-12 bg-yellow-500/60 rounded-full animate-ping"
                                 style={{ animationDuration: "1.2s" }} />
                            {/* Middle ring */}
                            <div className="absolute inset-0 w-12 h-12 bg-amber-400/40 rounded-full animate-pulse"
                                 style={{ animationDuration: "0.8s" }} />
                            {/* Inner flash */}
                            <div className="absolute inset-3 bg-white/80 rounded-full animate-pulse"
                                 style={{ animationDuration: "0.5s" }} />
                            {/* Sword icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sword className="w-7 h-7 text-white animate-spin drop-shadow-lg"
                                       style={{ animationDuration: "1.5s" }} />
                            </div>
                            {/* Sparks */}
                            <Zap className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-ping"
                                 style={{ animationDelay: "0.1s" }} />
                            <Zap className="absolute -bottom-2 -left-2 w-4 h-4 text-yellow-300 animate-ping"
                                 style={{ animationDelay: "0.3s" }} />
                        </div>
                    )}

                    {effect.type === "explosion" && (
                        <div className="relative animate-in zoom-in duration-500">
                            {/* Outer blast */}
                            <div className="w-16 h-16 bg-red-500/50 rounded-full animate-ping"
                                 style={{ animationDuration: "1.8s" }} />
                            {/* Middle fire ring */}
                            <div className="absolute inset-1 bg-orange-500/70 rounded-full animate-pulse"
                                 style={{ animationDuration: "1.2s" }} />
                            {/* Inner core */}
                            <div className="absolute inset-3 bg-yellow-300/90 rounded-full animate-pulse"
                                 style={{ animationDuration: "0.6s" }} />
                            {/* Heat wave effect */}
                            <div className="absolute inset-2 bg-gradient-radial from-white/40 via-orange-300/30 to-transparent rounded-full animate-ping"
                                 style={{ animationDuration: "1.0s" }} />
                            {/* Debris particles */}
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"
                                    style={{
                                        top: `${20 + i * 10}%`,
                                        left: `${15 + i * 15}%`,
                                        animationDelay: `${i * 0.15}s`,
                                        animationDuration: "1.5s"
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {effect.type === "damage" && (
                        <div className="text-red-400 font-bold text-xl animate-in slide-in-from-bottom-2 fade-in duration-700">
                            <div className="drop-shadow-lg">-DMG</div>
                        </div>
                    )}

                    {effect.type === "victory" && (
                        <div className="relative animate-in zoom-in fade-in duration-1000">
                            {/* Outer glory ring */}
                            <div className="w-24 h-24 bg-green-500/30 rounded-full animate-ping"
                                 style={{ animationDuration: "3s" }} />
                            {/* Middle glow */}
                            <div className="absolute inset-2 bg-yellow-400/40 rounded-full animate-pulse"
                                 style={{ animationDuration: "2s" }} />
                            {/* Inner radiance */}
                            <div className="absolute inset-4 bg-gradient-radial from-yellow-200/60 via-amber-300/40 to-transparent rounded-full animate-pulse"
                                 style={{ animationDuration: "1.5s" }} />
                            {/* Crown icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Crown className="w-12 h-12 text-yellow-400 animate-bounce drop-shadow-2xl"
                                       style={{
                                           animationDuration: "2s",
                                           filter: "drop-shadow(0 0 20px rgba(250, 204, 21, 0.8))"
                                       }} />
                            </div>
                            {/* Victory sparkles */}
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                                    style={{
                                        top: `${10 + Math.cos(i * Math.PI / 4) * 40}%`,
                                        left: `${50 + Math.sin(i * Math.PI / 4) * 40}%`,
                                        animationDelay: `${i * 0.2}s`,
                                        animationDuration: "2s"
                                    }}
                                />
                            ))}
                        </div>
                    )}
            </div>
        ))}
    </div>
    )
}

export default BattleEffectOverlay