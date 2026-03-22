// types/lattice.ts

// The event is the atomic primitive.
// A coordinate exists because an event crystallized there.
// If nothing meaningful occurred, no coordinate is allocated.
// The lattice is not pre-allocated space. It is a record of what happened.

export type PhaseState = 'liquid' | 'frozen'

export type PhiBar = {
  quantity: number
  quality: 'passive' | 'active' | 'discovery'
}

export type Identity = {
  id: string
  hederaAccountId: string
  originEventId: string
  tombstoned: boolean
}

export type AgentNode = {
  nodeId: string
  identityRef: string
  phiBar: PhiBar
  timeline: Record<number, string>  // { coordinate: eventId }
  phase: PhaseState
  reputation: number
  hcsTopicId: string
  intent?: string
}

export type EventType =
  | 'AGENT_SPAWN'
  | 'OBSERVATION'
  | 'DISCOVERY'
  | 'PROBE'
  | 'EDGE_FORMATION'
  | 'REPUTATION_UPDATE'
  | 'AGENT_FREEZE'

export type PhiCost = {
  quantity: number
  quality: PhiBar['quality']
}

export type LatticeEvent = {
  eventId: string
  coordinate: number
  actorNodeId: string
  eventType: EventType
  scope: string[]
  phiCost: PhiCost
  phase: PhaseState
  hcsSequenceNumber?: number
  timestamp: number
  reasoning?: string  
  trackMeta?: {
  title: string
  artist: string
  year: number
  genre: string
  cluster: string
  tags: string[]
  }
}

export type Edge = {
  edgeId: string
  fromNodeId: string
  toNodeId: string
  conductance: number
  crystallizedAtEvent: string
  phase: PhaseState
}

export type Run = {
  runId: string
  nodeId: string
  currentCoordinate: number
  path: number[]
  active: boolean
}

export type WorldState = {
  globalIndex: number
  totalPhiActive: number
  agents: Record<string, AgentNode>
  events: Record<string, LatticeEvent>
  edges: Record<string, Edge>
  runs: Record<string, Run>
  tick: number
}

export type FogCatalog = {
  tracks: Track[]
}

export type Track = {
  trackId: string
  title: string
  artist: string
  genre: string
  year: number
  cluster: string
  tags: string[]
  visible: boolean
  phiToReveal: number
}

