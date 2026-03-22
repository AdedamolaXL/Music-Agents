import { createPhiBar, deductPhi, replenishPhi,
         shouldFreeze, assertConservation } from '../lib/primitives/phi'
import { authorize, getIndex, resetClock } from '../lib/primitives/clock'
import { PHI_COSTS, PHI_REPLENISHMENT } from '../lib/primitives/constants'
import * as dotenv from 'dotenv'


dotenv.config({ path: '.env.local' })

resetClock()

// Spawn 3 agents with full bars
let agents = [
  { id: 'agent1', bar: createPhiBar(100) },
  { id: 'agent2', bar: createPhiBar(100) },
  { id: 'agent3', bar: createPhiBar(100) },
]

console.log('Initial state:')
agents.forEach(a =>
  console.log(`  ${a.id}: quantity=${a.bar.quantity} quality=${a.bar.quality}`))

let totalDissipated = 0
let totalInjected = 0

// Run 10 ticks
for (let tick = 1; tick <= 10; tick++) {
  const totalBefore = agents.reduce((sum, a) => sum + a.bar.quantity, 0)

  let tickDissipated = 0
  let tickInjected = 0

  agents = agents.map(agent => {
    if (shouldFreeze(agent.bar)) {
      console.log(`  ${agent.id} is frozen, skipping`)
      return agent
    }

    // Try to authorize an observation
    const cost = PHI_COSTS.OBSERVE_NEARBY
    const coordinate = authorize(agent.bar.quantity, cost)

    if (coordinate === null) {
      console.log(`  ${agent.id} veto - insufficient Phi`)
      return agent
    }

    // Deduct Φ
    const newBar = deductPhi(agent.bar,
      { quantity: cost, quality: agent.bar.quality })
    if (!newBar) return agent

    tickDissipated += cost

    // Replenish base
    const finalBar = replenishPhi(newBar, PHI_REPLENISHMENT.BASE_PER_TICK)
    const actualInjected = finalBar.quantity - newBar.quantity
    tickInjected += actualInjected


    return { ...agent, bar: finalBar }
  })

  const totalAfter = agents.reduce((sum, a) => sum + a.bar.quantity, 0)
  totalDissipated += tickDissipated
  totalInjected += tickInjected

  const conserved = assertConservation(
    totalBefore, totalAfter, tickDissipated, tickInjected)

  console.log(`Tick ${tick}: index=${getIndex()} conserved=${conserved}`)
  if (!conserved) {
    console.error('CONSERVATION VIOLATION')
    process.exit(1)
  }
}

console.log('\nFinal state:')
agents.forEach(a =>
  console.log(`  ${a.id}: quantity=${a.bar.quantity} quality=${a.bar.quality} frozen=${shouldFreeze(a.bar)}`))
console.log(`\nGlobal index: ${getIndex()}`)
console.log('Day 1 complete. Kernel is correct.')