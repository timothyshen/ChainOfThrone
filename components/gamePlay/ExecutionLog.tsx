import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table'

function ExecutionLog({ executionRecord }: { executionRecord: string[] }) {
    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle>Execution Record</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Turn</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {executionRecord.map((record, index) => (
                            <TableRow key={index}>
                                <TableCell>{Math.floor(index / 2) + 1}</TableCell>
                                <TableCell>{record}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ExecutionLog