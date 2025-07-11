import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const GameOverview = ({ territories }: { territories: any[] }) => {
    return (
        <>
            <h3 className="text-lg font-bold">Kingdom Overview</h3>
            <Card className="bg-slate-700 border-slate-600 text-white">
                <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Your Territories</h4>
                    <div className="space-y-2">
                        {territories
                            .filter((t) => t.owner === "Stark")
                            .map((territory) => (
                                <div key={territory.id} className="flex justify-between items-center">
                                    <span className="text-sm">{territory.name}</span>
                                    <Badge variant="secondary">{territory.strength}</Badge>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-slate-700 border-slate-600 text-white">
                <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Resources</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Gold</span>
                            <span className="text-yellow-400">2,450</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Food</span>
                            <span className="text-green-400">1,200</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Iron</span>
                            <span className="text-gray-400">800</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}