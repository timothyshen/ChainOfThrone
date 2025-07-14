const BattleEffectOverlay = () => {
    return (<div className="absolute inset-0 p-4 pointer-events-none z-30">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
            {battleEffects.map((effect) => (
                <div
                    key={effect.id}
                    className="absolute flex items-center justify-center"
                    style={{
                        left: `${effect.x * 33.333 + 16.666}%`,
                        top: `${effect.y * 33.333 + 16.666}%`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    {effect.type === "clash" && (
                        <div className="relative">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full animate-ping" />
                            <Sword className="absolute inset-0 w-6 h-6 text-white animate-spin" style={{ margin: "4px" }} />
                        </div>
                    )}

                    {effect.type === "explosion" && (
                        <div className="relative">
                            <div className="w-12 h-12 bg-red-500 rounded-full animate-ping opacity-75" />
                            <div
                                className="absolute inset-0 w-8 h-8 bg-orange-400 rounded-full animate-pulse"
                                style={{ margin: "8px" }}
                            />
                        </div>
                    )}

                    {effect.type === "damage" && <div className="text-red-400 font-bold text-lg animate-bounce">-DMG</div>}

                    {effect.type === "victory" && (
                        <div className="relative">
                            <div className="w-16 h-16 bg-green-500 rounded-full animate-ping opacity-50" />
                            <Crown
                                className="absolute inset-0 w-8 h-8 text-yellow-400 animate-pulse"
                                style={{ margin: "16px" }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
    )
}

export default BattleEffectOverlay