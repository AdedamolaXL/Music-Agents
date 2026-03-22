import { NextResponse } from 'next/server'
import { getWorldState, getCatalog } from '@/lib/primitives/world'
import { deductPhi, replenishPhi, shouldFreeze } from '@/lib/primitives/phi'
import { crystallize, attachHcsSequenceNumber } from '@/lib/primitives/event'
import { submitEventToHcs } from '@/lib/hedera/hcs'
import { getVisibleTracks } from '@/lib/fog/catalog'
import { PHI_COSTS, PHI_REPLENISHMENT } from '@/lib/primitives/constants'
import type { PhiCost } from '@/types/lattice'

export async function POST(req: Request) {
  try {
    const { nodeId, trackId } = await req.json()

    if (!nodeId || !trackId) {
      return NextResponse.json(
        { error: 'nodeId and trackId are required' },
        { status: 400 }
      )
    }

    const state = getWorldState()
    const agent = state.agents[nodeId] 

    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${nodeId} not found` },
        { status: 404 }
      )
    }

    if (agent.phase === 'frozen') {
      return NextResponse.json(
        { error: 'Agent is frozen - Φ too low to act' },
        { status: 403 }
      )
    }
    
    // Verify track is visible (not fogged)
    const catalog = getCatalog()

    const visibleTracks = getVisibleTracks(catalog)
    const track = visibleTracks.find(t => t.trackId === trackId)

    if (!track) {
      return NextResponse.json(
        { error: `Track ${trackId} not visible or does not exist` },
        { status: 404 }
      )
    }

    // Thermodynamic veto - deduct Φ
    const cost: PhiCost = { quantity: PHI_COSTS.OBSERVE_NEARBY, quality: agent.phiBar.quality }
    const newBar = deductPhi(agent.phiBar, cost)

    if (!newBar) {
      return NextResponse.json(
        { error: `Insufficient Φ to observe. Need ${PHI_COSTS.OBSERVE_NEARBY}Φ, have ${agent.phiBar.quantity}Φ` },
        { status: 402 }
      )
    }

    const event = crystallize(
      nodeId,
      'OBSERVATION',
      [nodeId, trackId],
      newBar,
      cost
    )

    if (!event) {
      return NextResponse.json(
        { error: 'Crystallization failed - clock veto' },
        { status: 500 }
      )
    }

    // Base replenishment after observation
    const finalBar = replenishPhi(newBar, PHI_REPLENISHMENT.BASE_PER_TICK)

    // Update agent state
    state.agents[nodeId] = {
      ...agent,
      phiBar: finalBar,
      timeline: { ...agent.timeline, [event.coordinate]: event.eventId },
      phase: shouldFreeze(finalBar) ? 'frozen' : 'liquid'
    }
    state.events[event.eventId] = event

    // HCS submission - fire and forget
    submitEventToHcs(agent.hcsTopicId, event)
      .then(seqNum => {
        attachHcsSequenceNumber(event.eventId, seqNum)
      })
      .catch(err => {
        console.error('HCS submission failed:', err)
      })

    return NextResponse.json({
      event: {
        eventId: event.eventId,
        eventType: event.eventType,
        coordinate: event.coordinate,
        hcsTopicId: agent.hcsTopicId
      },
      track: {
        trackId: track.trackId,
        title: track.title,
        artist: track.artist
      },
      agentState: {
        nodeId,
        phiBar: finalBar,
        phase: state.agents[nodeId].phase,
        reputation: agent.reputation,
        eventCount: Object.keys(state.agents[nodeId].timeline).length
      }
    })

  } catch (error) {
    console.error('Observe failed:', error)
    return NextResponse.json({ error: 'Observe failed' }, { status: 500 })
  }
}