export type PhiQuality = 'passive' | 'active' | 'discovery'

export type AgentSummary = {
  nodeId: string
  phase: 'liquid' | 'frozen'
  phiBar: { quantity: number; quality: PhiQuality }
  reputation: number
  eventCount: number
  hcsTopicId: string
  intent?: string
  discoveryCount?: number
}

export type WorldSummary = {
  tick: number
  globalIndex: number
  totalPhiActive: number
  agentCount: number
  eventCount: number
  agents: AgentSummary[]
  recentEvents?: RecentEvent[]
}

export type RecentEvent = {
  eventId: string
  agentId: string
  eventType: string
  coordinate: number
  timestamp: number
  hcsSequenceNumber?: number
  reasoning?: string
  trackTitle?: string
  trackArtist?: string
  trackYear?: number
  trackGenre?: string
  trackCluster?: string
  trackTags?: string[]
}