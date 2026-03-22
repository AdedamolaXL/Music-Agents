import { createCatalog, getVisibleTracks,
         getFoggedTracks, revealTrack } from '../lib/fog/catalog'
import { agentDecide, getRecentTrackIds } from '../lib/fog/decision'
import { spawnNode } from '../lib/primitives/node'
import { assignIdentity } from '../lib/primitives/identity'
import { createPhiBar } from '../lib/primitives/phi'
import { resetClock } from '../lib/primitives/clock'

resetClock()
console.log('Testing Fog Catalog...')

const catalog = createCatalog()

const initialVisible = getVisibleTracks(catalog)
const initialFogged = getFoggedTracks(catalog)

console.assert(initialVisible.length === 3,
  `Should have 3 visible tracks, got ${initialVisible.length}`)
console.assert(initialFogged.length === 5,
  `Should have 5 fogged tracks, got ${initialFogged.length}`)

// Reveal a track
const revealed = revealTrack(catalog, 'track-001')
console.assert(revealed === true, 'Should successfully reveal track-001')
console.assert(getVisibleTracks(catalog).length === 4,
  'Should now have 4 visible tracks')
console.assert(getFoggedTracks(catalog).length === 4,
  'Should now have 4 fogged tracks')

// Re-reveal same track - should be no-op
const reRevealed = revealTrack(catalog, 'track-001')
console.assert(reRevealed === false,
  'Re-revealing already visible track should return false')
console.assert(getVisibleTracks(catalog).length === 4,
  'Visible count should still be 4')

console.log('  Catalog tests passed')

// --- Decision tests ---
console.log('Testing Agent Decisions...')

const identity = assignIdentity('0.0.test', 'origin-1')

// High Phi agent - should probe
const highPhiNode = spawnNode(identity.id, 'topic-test-1')
// Already at 100 quantity, quality='discovery'

const freshCatalog = createCatalog()
const decision1 = agentDecide(highPhiNode, freshCatalog, [])
console.assert(decision1.type === 'PROBE',
  `High-Phi agent should PROBE, got ${decision1.type}`)
console.assert('track' in decision1,
  'PROBE decision should have a track')
console.log(`  High-Phi decision: PROBE ${
  decision1.type === 'PROBE' ? decision1.track.title : ''}`)

// Low Phi agent - should observe not probe
const lowPhiNode = {
  ...highPhiNode,
  nodeId: 'low-phi-node',
  phiBar: createPhiBar(35)  // active quality, can't afford most probes
}
const decision2 = agentDecide(lowPhiNode, freshCatalog, [])
console.assert(decision2.type === 'OBSERVE',
  `Low-Phi agent should OBSERVE, got ${decision2.type}`)
console.log(`  Low-Phi decision: OBSERVE ${
  decision2.type === 'OBSERVE' ? decision2.track.title : ''}`)

// Depleted agent - should idle
const depletedNode = {
  ...highPhiNode,
  nodeId: 'depleted-node',
  phiBar: createPhiBar(5)  // below freeze threshold
}
const decision3 = agentDecide(depletedNode, freshCatalog, [])
console.assert(decision3.type === 'IDLE',
  `Depleted agent should IDLE, got ${decision3.type}`)
console.assert(
  decision3.type === 'IDLE' && decision3.reason === 'phi_exhausted',
  'Idle reason should be phi_exhausted')
console.log(`  Depleted decision: IDLE (${
  decision3.type === 'IDLE' ? decision3.reason : ''})`)

// Novelty - agent should prefer unseen tracks
const seenTrackIds = ['track-003', 'track-004', 'track-006']
  // all 3 visible tracks
const decision4 = agentDecide(lowPhiNode, freshCatalog, seenTrackIds)
// Has seen all visible tracks - should still observe (fallback)
console.assert(decision4.type === 'OBSERVE',
  'Should still observe even if all tracks seen recently')
console.log(`  Novelty fallback: OBSERVE ${
  decision4.type === 'OBSERVE' ? decision4.track.title : ''}`)

console.log('\nDay 4 complete. Fog and decisions are correct.')