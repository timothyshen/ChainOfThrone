import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

function ActionLog({ actionLog }: { actionLog: string[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Action Log</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {actionLog.map((action, index) => (
                        <p key={index} className="mb-2">{action}</p>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default ActionLog