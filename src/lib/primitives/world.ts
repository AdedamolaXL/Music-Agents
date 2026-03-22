import { WorldState, AgentNode, FogCatalog } from '@/types/lattice'
import { deductPhi, replenishPhi, shouldFreeze, assertConservation } from './phi'
import { crystallize, attachHcsSequenceNumber } from './event'
import { agentDecideWithAI } from '@/lib/fog/decision'
import { revealTrack, createCatalog, getFoggedTracks } from '../fog/catalog'
import { submitEventToHcs } from '../hedera/hcs'
import { PHI_COSTS, PHI_REPLENISHMENT } from './constants'

// ─── World State ────────────────────────────────────────────────────────────

// Pin to global to survive Next.js hot module replacement
const globalForShamana = global as typeof globalThis & {
  __shamanaWorldState: WorldState
  __shamanaCatalog: FogCatalog
}

if (!globalForShamana.__shamanaWorldState) {
  globalForShamana.__shamanaWorldState = {
    globalIndex: 0,
    totalPhiActive: 0,
    agents: {},
    events: {},
    edges: {},
    runs: {},
    tick: 0
  }
}

if (!globalForShamana.__shamanaCatalog) {
  globalForShamana.__shamanaCatalog = createCatalog()
}

// All state reads and writes go through these references
let worldState = globalForShamana.__shamanaWorldState
let catalog = globalForShamana.__shamanaCatalog

// ─── HCS test flag ───────────────────────────────────────────────────────────

let hcsDisabled = false

export function disableHcsForTesting(): void {
  hcsDisabled = true
}

// ─── Public accessors ────────────────────────────────────────────────────────

export function getWorldState(): WorldState {
  return worldState
}

export function getCatalog(): FogCatalog {
  return catalog
}

export function resetWorldState(): void {
  globalForShamana.__shamanaWorldState = {
    globalIndex: 0,
    totalPhiActive: 0,
    agents: {},
    events: {},
    edges: {},
    runs: {},
    tick: 0
  }
  globalForShamana.__shamanaCatalog = createCatalog()
  worldState = globalForShamana.__shamanaWorldState
  catalog = globalForShamana.__shamanaCatalog
}

// Register a newly spawned agent into world state
// Calling this injects that agent's Φ into the system total
export function registerAgent(agent: AgentNode): void {
  worldState.agents[agent.nodeId] = agent
  worldState.totalPhiActive += agent.phiBar.quantity
}

// ─── Tick ────────────────────────────────────────────────────────────────────

export async function tick(): Promise<WorldState> {
  const totalPhiBefore = Object.values(worldState.agents)
    .reduce((sum, agent) => sum + agent.phiBar.quantity, 0)

  let tickDissipated = 0
  let tickInjected = 0

  // Collect active agents — frozen agents are inert (M8)
  const activeAgents = Object.values(worldState.agents)
    .filter(agent => agent.phase !== 'frozen')

  // Process all active agents in parallel
  // Each agent makes an AI decision and acts simultaneously
async function processAgent(agent: AgentNode): Promise<void> {
  const recentTrackIds = Object.values(worldState.events)
    .filter(e => e.actorNodeId === agent.nodeId)
    .sort((a, b) => b.coordinate - a.coordinate)
    .slice(0, 8)
    .flatMap(e => e.scope.filter(id => id !== agent.nodeId))

  const decision = await agentDecideWithAI(
    agent.phiBar,
    catalog,
    recentTrackIds,
    agent.intent
  )

  if (decision.type === 'IDLE') {
    if (decision.reason === 'phi_exhausted' && shouldFreeze(agent.phiBar)) {
      worldState.agents[agent.nodeId] = { ...agent, phase: 'frozen' }
    }
    return
  }

  const cost = { quantity: decision.phiCost, quality: agent.phiBar.quality }
  const newBar = deductPhi(agent.phiBar, cost)
  if (!newBar) return

  let eventType: 'OBSERVATION' | 'DISCOVERY' = 'OBSERVATION'
  let replenishAmount: number = PHI_REPLENISHMENT.BASE_PER_TICK

  if (decision.type === 'PROBE') {
    const wasRevealed = revealTrack(catalog, decision.trackId)
    if (wasRevealed) {
      eventType = 'DISCOVERY'
      replenishAmount = PHI_REPLENISHMENT.REWARDING_DISCOVERY
    }
  }

const event = crystallize(
  agent.nodeId,
  eventType,
  [agent.nodeId, decision.trackId],
  newBar,
  cost
)

  if (!event) return

  if (eventType === 'DISCOVERY' || eventType === 'OBSERVATION') {
  const track = getCatalog().tracks.find(t => t.trackId === decision.trackId)
  if (track && event) {
     event.trackMeta = {
      title: track.title,
      artist: track.artist,
      year: track.year,
      genre: track.genre,
      cluster: track.cluster,
      tags: track.tags        
    }
    worldState.events[event.eventId] = event
  }
}

  // Attach AI reasoning to the event
if (decision.reasoning) {
  event.reasoning = decision.reasoning
}

  tickDissipated += cost.quantity

  const finalBar = replenishPhi(newBar, replenishAmount)
  const actualInjected = finalBar.quantity - newBar.quantity
  tickInjected += actualInjected

  worldState.agents[agent.nodeId] = {
    ...agent,
    phiBar: finalBar,
    phase: shouldFreeze(finalBar) ? 'frozen' : 'liquid',
    timeline: { ...agent.timeline, [event.coordinate]: event.eventId }
  }
  worldState.events[event.eventId] = event

  if (!hcsDisabled) {
    submitEventToHcs(agent.hcsTopicId, event)
      .then(seqNum => {
        attachHcsSequenceNumber(event.eventId, seqNum)
        if (worldState.events[event.eventId]) {
          worldState.events[event.eventId] = {
            ...worldState.events[event.eventId],
            hcsSequenceNumber: seqNum
          }
        }
      })
      .catch(err => console.error(`HCS submission failed for ${event.eventId}:`, err))
  }
}

// Sequential with stagger — prevents Groq TPM rate limit
for (const agent of activeAgents) {
  await processAgent(agent)
  await new Promise(resolve => setTimeout(resolve, 400))
}

  // Recompute reputation for all agents from crystallized event history
  // Reputation is a derived value, never stored as ground truth
  for (const agent of Object.values(worldState.agents)) {
    const reputation = Object.values(worldState.events)
      .filter(e => e.actorNodeId === agent.nodeId)
      .reduce((rep, e) => {
        if (e.eventType === 'DISCOVERY')   return rep + 10
        if (e.eventType === 'PROBE')       return rep + 5
        if (e.eventType === 'OBSERVATION') return rep + 1
        return rep
      }, 0)

    worldState.agents[agent.nodeId] = {
      ...worldState.agents[agent.nodeId],
      reputation
    }
  }

  worldState.tick += 1
  worldState.globalIndex = Object.keys(worldState.events).length
  worldState.totalPhiActive = Object.values(worldState.agents)
    .reduce((sum, agent) => sum + agent.phiBar.quantity, 0)

  // Conservation check — soft warning for hackathon
  // Production: halt the tick on violation
  const totalPhiAfter = worldState.totalPhiActive


  const drift = Math.abs((totalPhiBefore + tickInjected - tickDissipated) - totalPhiAfter)
if (drift > 150) {
  console.warn('Φ conservation drift', {
    before: totalPhiBefore,
    after: totalPhiAfter,
    dissipated: tickDissipated,
    injected: tickInjected,
    delta: (totalPhiBefore + tickInjected - tickDissipated) - totalPhiAfter
  })
}
  return worldState
}