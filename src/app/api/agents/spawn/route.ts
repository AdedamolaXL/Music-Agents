import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createAgentTopic } from '@/lib/hedera/hcs'
import { assignIdentity } from '@/lib/primitives/identity'
import { spawnNode } from '@/lib/primitives/node'
import { crystallize } from '@/lib/primitives/event'
import { registerAgent } from '@/lib/primitives/world'
import { PHI_COSTS } from '@/lib/primitives/constants'

export async function POST(req: Request) {
  try {
    const { hederaAccountId, intent } = await req.json()
    console.log('Spawning agent with intent:', intent)

    if (!hederaAccountId) {
      return NextResponse.json(
        { error: 'hederaAccountId is required' },
        { status: 400 }
      )
    }

    // Create HCS topic for this agent's event stream
    const hcsTopicId = await createAgentTopic(
      `agent-${Date.now()}`
    )

    // Crystallize origin event — identity is born here
    const originEvent = crystallize(
      'world',           // world is the actor for spawning
      'AGENT_SPAWN',
      [hederaAccountId],
      { quantity: 100 }, // world has unlimited Φ for spawning
      { quantity: PHI_COSTS.SPAWN_AGENT, quality: 'discovery' }
    )

    if (!originEvent) {
      return NextResponse.json(
        { error: 'Origin event crystallization failed' },
        { status: 500 }
      )
    }

    // Assign identity — anchored to origin event
    const identity = assignIdentity(
      hederaAccountId,
      originEvent.eventId
    )

    // Spawn node with identity reference
    const node = spawnNode(identity.id, hcsTopicId, 100, intent)

    // Register with world — injects Φ into system total
    registerAgent(node)

    return NextResponse.json({
  success: true,
  agent: {
    nodeId: node.nodeId,
    identityId: identity.id,
    hcsTopicId,
    phiBar: node.phiBar,
    phase: node.phase,
    reputation: node.reputation,
    intent: node.intent  // add this
  },
  originEvent: {
    eventId: originEvent.eventId,
    coordinate: originEvent.coordinate
  }
})

  } catch (error) {
    console.error('Agent spawn failed:', error)
    return NextResponse.json(
      { error: 'Agent spawn failed' },
      { status: 500 }
    )
  }
}