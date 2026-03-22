import { NextResponse } from "next/server"
import { getWorldState, getCatalog } from "@/lib/primitives/world"
import { deductPhi, replenishPhi, shouldFreeze } from '@/lib/primitives/phi'
import { crystallize, attachHcsSequenceNumber } from '@/lib/primitives/event'
import { submitEventToHcs } from "@/lib/hedera/hcs"
import { getFoggedTracks } from "@/lib/fog/catalog"
import { PHI_COSTS, PHI_REPLENISHMENT, PHI_THRESHOLDS } from "@/lib/primitives/constants" 
import type { PhiCost } from '@/types/lattice'

export async function POST(req: Request) {
  try {
    const { nodeId } = await req.json()

    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId is required' },
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
        { error: 'Agent is frozen - Φ too low to probe' },
        { status: 403 }
      )
    }

    // Probing requires discovery quality
    if (agent.phiBar.quality !== 'discovery') {
      return NextResponse.json({
        error: `Insufficient attention quality for probing. Current: ${agent.phiBar.quality}. Need: discovery (${PHI_THRESHOLDS.QUALITY_DISCOVERY}Φ+). Current Φ: ${agent.phiBar.quantity}`,
        currentQuality: agent.phiBar.quality,
        required: 'discovery',
        currentPhi: agent.phiBar.quantity,
        requiredPhi: PHI_THRESHOLDS.QUALITY_DISCOVERY
      }, { status: 403 })
    }

    const catalog = getCatalog()

    const foggedTracks = getFoggedTracks(catalog)

    if (foggedTracks.length === 0) {
      return NextResponse.json({
        discovered: null,
        message: 'No fogged tracks remain - the catalog is fully illuminated',
        agentState: {
          nodeId,
          phiBar: agent.phiBar,
          phase: agent.phase,
          reputation: agent.reputation
        }
      })
    }

    // Pick a random fogged track to probe
    const target = foggedTracks[Math.floor(Math.random() * foggedTracks.length)]

    const cost: PhiCost = { quantity: PHI_COSTS.PROBE_FOG, quality: agent.phiBar.quality }
    const newBar = deductPhi(agent.phiBar, cost)

    // Thermodynamic veto
    if (!newBar) {
      return NextResponse.json(
        { error: `Insufficient Φ to probe. Need ${PHI_COSTS.PROBE_FOG}Φ, have ${agent.phiBar.quantity}Φ` },
        { status: 402 }
      )
    }

    // Reveal the track - probe always succeeds at this Φ quality
    target.visible = true

    // Reputation reward for discovery
    const reputationGain = 10
    const newReputation = agent.reputation + reputationGain

    // Crystallize as DISCOVERY event
    const event = crystallize(
      nodeId,
      'DISCOVERY',
      [nodeId, target.trackId],
      newBar,
      cost
    )

    if (!event) {
      // Roll back fog reveal if crystallization fails
      target.visible = false
      return NextResponse.json(
        { error: 'Crystallization failed - clock veto' },
        { status: 500}
      )
    }

    // Replenishment reward for successful discovery
    const finalBar = replenishPhi(newBar, PHI_REPLENISHMENT.REWARDING_DISCOVERY)

    // Update agent
    state.agents[nodeId] = {
      ...agent,
      phiBar: finalBar,
      reputation: newReputation,
      timeline: { ...agent.timeline, [event.coordinate]: event.eventId },
      phase: shouldFreeze(finalBar) ? 'frozen' : 'liquid'
    }
    state.events[event.eventId] = event

    // HCS - fire and forget
    submitEventToHcs(agent.hcsTopicId, event)
      .then(seqNum => {
        attachHcsSequenceNumber(event.eventId, seqNum)
      })
      .catch(err => {
        console.error('HCS submission failed:', err)
      })

    return NextResponse.json({
      discovered: {
        trackId: target.trackId,
        title: target.title,
        artist: target.artist
      },
      event: {
        eventId: event.eventId,
        eventType: 'DISCOVERY',
        coordinate: event.coordinate,
        hcsTopicId: agent.hcsTopicId
      },
      reputationGained: reputationGain,
      agentState: {
        nodeId,
        phiBar: finalBar,
        phase: state.agents[nodeId].phase,
        reputation: newReputation,
        eventCount: Object.keys(state.agents[nodeId].timeline).length
      }
    })

  } catch (error) {
    console.error('Probe failed:', error)
    return NextResponse.json({ error: 'Probe failed' }, { status: 500 })
  }
}