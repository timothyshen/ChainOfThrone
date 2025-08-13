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
        </>
    )
}