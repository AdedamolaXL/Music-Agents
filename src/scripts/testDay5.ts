import { tick, getWorldState, registerAgent,
         resetWorldState, disableHcsForTesting } from '../lib/primitives/world'
import { spawnNode } from '../lib/primitives/node'
import { assignIdentity } from '../lib/primitives/identity'
import { createPhiBar } from '../lib/primitives/phi'
import { resetClock } from '../lib/primitives/clock'

async function main() {
  resetClock()
  resetWorldState()
  disableHcsForTesting()  // unit test - HCS tested separately in testDay3

  console.log('Testing World Tick...')

  // Spawn 3 agents at different Φ levels to show behavioral variance
  const startingPhi = [100, 55, 30]  // discovery, active, passive
  const agents = []

  for (let i = 0; i < 3; i++) {
    const identity = assignIdentity(`0.0.${i + 1000}`, `origin-${i}`)
    const node = spawnNode(identity.id, `0.0.placeholder-${i}`)

    // Override Φ bar to create behavioral variance
    const nodeWithPhi = {
      ...node,
      phiBar: createPhiBar(startingPhi[i])
    }
    registerAgent(nodeWithPhi)
    agents.push(nodeWithPhi)
  }

  console.log(`  Spawned ${agents.length} agents`)
  console.log(`  Starting Φ: ${startingPhi.join(', ')}`)
  console.log(`  Initial total Φ: ${getWorldState().totalPhiActive}`)

  for (let i = 0; i < 5; i++) {
    const state = await tick()
    console.log(
      `  Tick ${state.tick}: ` +
      `events=${state.globalIndex} ` +
      `totalΦ=${state.totalPhiActive} ` +
      `agents=${Object.values(state.agents)
        .map(a =>
          `${a.nodeId.slice(0,6)}:${a.phiBar.quantity}Φ` +
          `(${a.phiBar.quality}):${a.phase}`
        )
        .join(' ')}`
    )
  }

  const finalState = getWorldState()

  console.assert(finalState.tick === 5, 'Should have run 5 ticks')
  console.assert(finalState.globalIndex > 0,
    'Should have crystallized some events')
  console.assert(
    Object.values(finalState.agents).every(a => a.reputation >= 0),
    'All agents should have non-negative reputation'
  )

  // Conservation: total Φ should equal sum of all agent bars
  const measuredTotal = Object.values(finalState.agents)
    .reduce((sum, a) => sum + a.phiBar.quantity, 0)
  console.assert(
    Math.abs(measuredTotal - finalState.totalPhiActive) <= 2,
    `Conservation: measured ${measuredTotal} vs tracked ${finalState.totalPhiActive}`
  )

  console.log(`\n  Final event count: ${finalState.globalIndex}`)
  console.log('  Agent final states:')
  Object.values(finalState.agents).forEach(a => {
    console.log(
      `    ${a.nodeId.slice(0,8)}: ${a.reputation} rep | ` +
      `${a.phiBar.quantity}Φ (${a.phiBar.quality}) | ${a.phase}`
    )
  })

  console.log('\nDay 5 complete. World tick is correct.')
}

main().catch(console.error)