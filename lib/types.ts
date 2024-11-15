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

export type Order = {
  type: 'move' | 'support' | 'convoy' | 'retreat' | 'build' | 'disband'
  unitId: string
  from: string
  to: string
  supportedUnitId?: string
  convoyChainsIds?: string[]
  strength?: number
}

export type Player = {
  id: string
  name: string
  color: string
  supplyCenters: number
  units: number
}

export type GameState = {
  year: number
  season: 'Spring' | 'Fall'
  phase: 'order' | 'resolution' | 'retreat' | 'build' | 'disband'
  winner: Player | null
}

export type ChatMessage = {
  senderId: string
  recipientId: string
  content: string
  timestamp: number
}
