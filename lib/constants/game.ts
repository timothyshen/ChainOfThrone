export type Territory = {
    id: string
    name: string
    type: 'land' | 'sea'
    path: string
    adjacentTo: string[]
    center?: string
    supplyCenter?: boolean
}

export type Unit = {
    id: string
    type: 'army' | 'fleet'
    countryId: string
    position: string
    dislodged?: boolean
    mustRetreat?: boolean
}

export type Player = {
    id: string
    name: string
    color: string
    supplyCenters: number
}

export type GameState = {
    year: number
    season: 'Spring' | 'Fall'
    phase: 'order' | 'resolution' | 'retreat' | 'build'
    winner: Player | null
}

export type Order = {
    type: 'move' | 'support' | 'convoy' | 'retreat'
    unitId: string
    from: string
    to: string
    supportedUnitId?: string
    convoyChainsIds?: string[]
    strength?: number
}
