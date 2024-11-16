
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { Territory } from '@/lib/types/game'

function TerritoryInformation({ territory, units, handleUnitSelect, turnComplete }: { territory: Territory, units: Unit[], handleUnitSelect: (unitId: string) => void, turnComplete: boolean }) {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Territory Information</CardTitle>
            </CardHeader>
            <CardContent>
                {territory ? (
                    <div>
                        <h3 className="text-lg font-bold mb-2">{territory.name}</h3>
                        <p className="mb-2">Type: {territory.type === 'supply' ? 'Supply Center' : 'Land Territory'}</p>
                        <p className="mb-4">Units in this territory:</p>
                        <Select onValueChange={handleUnitSelect} disabled={turnComplete}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.filter(unit => unit.position === territory.id).map(unit => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                        {unit.type} (Strength: {unit.strength})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {units && !turnComplete && (
                            <div className="mt-4">
                                <RadioGroup defaultValue="move" onValueChange={(value) => setActionType(value as 'move' | 'split')}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="move" id="move" />
                                        <Label htmlFor="move">Move</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="split" id="split" />
                                        <Label htmlFor="split">Split</Label>
                                    </div>
                                </RadioGroup>
                                {actionType === 'split' && (
                                    <div className="mt-2">
                                        <Label htmlFor="splitStrength">Split Strength:</Label>
                                        <Input
                                            id="splitStrength"
                                            type="number"
                                            min="1"
                                            max={selectedUnit.strength - 1}
                                            value={splitStrength}
                                            onChange={(e) => setSplitStrength(parseInt(e.target.value))}
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                                <p className="mt-2 mb-2">{actionType.charAt(0).toUpperCase() + actionType.slice(1)} {selectedUnit.type} to:</p>
                                <div className="space-y-2">
                                    {getAdjacentTerritories(selectedTerritory).map(territory => (
                                        <Button
                                            key={territory.id}
                                            className="w-full"
                                            onClick={() => handleAction(territory.id)}
                                        >
                                            {territory.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Select a territory to view information and actions.</p>
                )}
            </CardContent>
        </Card>
    )
}

export default TerritoryInformation