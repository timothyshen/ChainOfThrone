import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Crown, Coins, Wheat, Pickaxe } from "lucide-react"

export const GameOverview = ({ territories }: { territories: any[] }) => {
    return (
        <>
            {/* Territories */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Your Territories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <Crown className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No territories claimed yet</p>
                    </div>
                </CardContent>
            </Card>

            {/* Resources */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Coins className="w-4 h-4 text-yellow-600" />
                                </div>
                                <span className="text-sm font-medium">Gold</span>
                            </div>
                            <span className="text-sm font-semibold text-yellow-600">2,450</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Wheat className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-sm font-medium">Food</span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">1,200</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Pickaxe className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium">Iron</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">800</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}