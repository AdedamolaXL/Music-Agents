// typecheck.ts
import type {
  PhaseState,
  PhiBar,
  Identity,
  AgentNode,
  LatticeEvent,
  EventType,
  Edge,
  Run,
  WorldState,
  Track
} from './src/types/lattice'

// Test 1: PhaseState only accepts two values
const a: PhaseState = 'liquid'    // should pass
const b: PhaseState = 'frozen'    // should pass
// const c: PhaseState = 'pending' // uncomment to verify compiler rejects it

// Test 2: PhiBar quality only accepts three bands
const bar: PhiBar = {
  quantity: 75,
  quality: 'discovery'            // should pass
}
// const badBar: PhiBar = { quantity: 75, quality: 'high' } // should fail

// Test 3: Identity has all required fields
const identity: Identity = {
  id: 'some-uuid',
  hederaAccountId: '0.0.12345',
  originEventId: 'origin-event-uuid',
  tombstoned: false
}

// Test 4: AgentNode references identity by string, not by object
const agent: AgentNode = {
  nodeId: 'node-uuid',
  identityRef: identity.id,       // string reference only
  phiBar: bar,
  timeline: { 1: 'event-uuid-1', 4: 'event-uuid-2' },  // sparse
  phase: 'liquid',
  reputation: 0,
  hcsTopicId: '0.0.99999'
}

// Test 5: LatticeEvent scope is an array of strings
const event: LatticeEvent = {
  eventId: 'event-uuid-1',
  coordinate: 1,
  actorNodeId: agent.nodeId,
  eventType: 'OBSERVATION',
  scope: [agent.nodeId, 'track-id-1'],  // M6 - all affected primitives
  phiCost: { quantity: 2, quality: 'active' },
  phase: 'frozen',                // born frozen
  timestamp: Date.now()
  // hcsSequenceNumber absent - not yet submitted to HCS
}

// Test 6: Timeline is sparse - coordinate 2 and 3 simply don't exist
const sparseTimeline: Record<number, string> = {
  1: 'event-uuid-1',
  4: 'event-uuid-2'
  // 2 and 3 never happened for this node
}

// Test 7: WorldState holds everything
const world: WorldState = {
  globalIndex: 1,
  totalPhiActive: 100,
  agents: { [agent.nodeId]: agent },
  events: { [event.eventId]: event },
  edges: {},
  runs: {},
  tick: 1
}

console.log('All types valid')
console.log('World state:', world)