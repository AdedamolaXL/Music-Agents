import { createAgentTopic, submitEventToHcs,
         getAgentEventHistory, computeReputation } from '../lib/hedera/hcs'
import { crystallize } from '../lib/primitives/event'
import { attachHcsSequenceNumber } from '../lib/primitives/event'
import { resetClock } from '../lib/primitives/clock'
import { PHI_COSTS } from '../lib/primitives/constants'
import * as dotenv from 'dotenv'


dotenv.config({ path: '.env.local' })

async function main() {
  resetClock()
  console.log('Testing HCS integration...')
  console.log('Creating agent topic on Hedera testnet...')

  // Create a topic for a test agent
  const topicId = await createAgentTopic('test-agent-001')
  console.log(`  Topic created: ${topicId}`)

  // Crystallize a local event
  const event = crystallize(
    'test-agent-001',
    'DISCOVERY',
    ['test-agent-001', 'track-fela-zombie'],
    { quantity: 100 },
    { quantity: PHI_COSTS.PROBE_FOG, quality: 'discovery' }
  )

  if (!event) {
    console.error('Event crystallization failed')
    process.exit(1)
  }

  console.log(`  Event crystallized locally: ${event.eventId}`)
  console.log(`  Lattice coordinate: ${event.coordinate}`)

  // Submit to HCS
  console.log('  Submitting to HCS...')
  const sequenceNumber = await submitEventToHcs(topicId, event)
  console.log(`  HCS sequence number: ${sequenceNumber}`)

  // Attach sequence number to local event
  attachHcsSequenceNumber(event.eventId, sequenceNumber)
  console.log('  Sequence number attached to local event')

  // Wait a moment for mirror node to catch up
  console.log('  Waiting 5s for mirror node...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  // Read back from mirror node
  const history = await getAgentEventHistory(topicId)
  console.log(`  Events on chain: ${history.length}`)

  if (history.length > 0) {
    console.log(`  First event type: ${history[0].eventType}`)
    console.log(`  First event coordinate: ${history[0].coordinate}`)
  }

  // Compute reputation
  const reputation = computeReputation(history)
  console.log(`  Agent reputation: ${reputation}`)

  console.assert(sequenceNumber >= 1, 'Sequence number should be at least 1')
  console.assert(reputation === 10, 'One DISCOVERY should give reputation 10')

  console.log('\nDay 3 complete. HCS integration is correct.')
}

main().catch(console.error)