import { assignIdentity, getIdentity,
         tombstone, getStoreSize } from '../lib/primitives/identity'
import { spawnNode, getNode, recordEventOnTimeline,
         enforcePhaseState, getAllNodes } from '../lib/primitives/node'
import { crystallize, getEvent,
         getEventsByNode, liquefy } from '../lib/primitives/event'
import { resetClock } from '../lib/primitives/clock'
import { PHI_COSTS } from '../lib/primitives/constants'
import * as dotenv from 'dotenv'


dotenv.config({ path: '.env.local' })


resetClock()

// --- Identity tests ---
console.log('Testing Identity...')

const identity = assignIdentity('0.0.12345', 'origin-event-placeholder')
console.assert(identity.tombstoned === false, 'New identity should not be tombstoned')
console.assert(getStoreSize() === 1, 'Store should have one identity')

tombstone(identity.id)
const tombstoned = getIdentity(identity.id)
console.assert(tombstoned?.tombstoned === true, 'Identity should be tombstoned')
console.assert(getStoreSize() === 1, 'Store should still have one identity after tombstone')
console.log('  Identity tests passed')

// --- Node tests ---
console.log('Testing Node...')

const identity2 = assignIdentity('0.0.67890', 'origin-event-2')
const node = spawnNode(identity2.id, 'topic-placeholder')

console.assert(node.phase === 'liquid', 'New node should be liquid')
console.assert(node.phiBar.quantity === 100, 'New node should have full Phi')
console.assert(node.identityRef === identity2.id, 'Node should reference identity')
console.assert(node.identityRef !== identity2.id.slice(0,8),
  'Node holds full reference not partial')
console.log('  Node tests passed')

// --- Event tests ---
console.log('Testing Event...')

const event = crystallize(
  node.nodeId,
  'OBSERVATION',
  [node.nodeId, 'track-1'],
  node.phiBar,
  { quantity: PHI_COSTS.OBSERVE_NEARBY, quality: 'discovery' }
)

console.assert(event !== null, 'Event should crystallize successfully')
console.assert(event!.phase === 'frozen', 'Event should be born frozen')
console.assert(event!.coordinate === 1, 'First event should be at coordinate 1')
console.assert(event!.scope.includes('track-1'), 'Scope should include track')

// Liquefy and check
liquefy(event!.eventId)
const liquidEvent = getEvent(event!.eventId)
console.assert(liquidEvent?.phase === 'liquid', 'Event should be liquid after liquefy')

// Record on timeline
recordEventOnTimeline(node.nodeId, event!.coordinate, event!.eventId)
const updatedNode = getNode(node.nodeId)
console.assert(
  updatedNode?.timeline[1] === event!.eventId,
  'Event should be on node timeline at coordinate 1'
)

// Events by node
const nodeEvents = getEventsByNode(node.nodeId)
console.assert(nodeEvents.length === 1, 'Node should have one event')

// Veto test - drain phi to zero
const brokeNode = spawnNode(identity2.id, 'topic-broke')
const vetoedEvent = crystallize(
  brokeNode.nodeId,
  'PROBE',
  [brokeNode.nodeId],
  { quantity: 0 },  // empty bar
  { quantity: PHI_COSTS.PROBE_FOG, quality: 'passive' },
)
console.assert(vetoedEvent === null, 'Veto should fire on empty Phi bar')

console.log('  Event tests passed')
console.log('\nDay 2 complete. Identity, Node, Event are correct.')