import { NextResponse } from 'next/server'
import { getWorldState } from '@/lib/primitives/world'  
import { deductPhi, shouldFreeze } from '@/lib/primitives/phi'
import { crystallize, attachHcsSequenceNumber } from '@/lib/primitives/event'
import { submitEventToHcs } from '@/lib/hedera/hcs'
import type { PhiCost } from '@/types/lattice'
import { error } from 'console'

const FOLLOW_PHI_COST = 8
const FOLLOW_REPUTATION_GAIN = 5

export async function POST(req: Request) {
  try {
    const { followerId, guideId } = await req.json()

    if (!followerId || !guideId) {
      return NextResponse.json(
        { error: 'followerId and guideId are required' },
        { status: 400}
      )
    }

    if (followerId === guideId) {
      return NextResponse.json(
        { error: 'Agent cannot follow itself' },
        { status: 400}
      )
    }

    const state = getWorldState()
    const follower = state.agents[followerId]
    const guide = state.agents[guideId]

    if (!follower) {
      return NextResponse.json(
        { error: `Follower ${followerId} not found` },
        { status: 404}
      )
    }
    
    if (!guide) {
      return NextResponse.json(
        { error: `Guide ${guideId} not found` },
        { status: 404}
      )
    }

    if (follower.phase === 'frozen') {
      return NextResponse.json(
        { error: 'Follower is frozen - insufficient Φ' },
        { status: 403 }
      )
    }

    // Guide must have earned guide status
    if (guide.reputation < 50) {
      return NextResponse.json({
        error: `Agent ${guideId} is not yet a guide. Reputation: ${guide.reputation}/50 required`,
        currentReputation: guide.reputation,
        required: 50
      }, { status: 403 })
    }

    // Thermodynamic veto - follower pays Φ to follow
    const cost: PhiCost = {
      quantity: FOLLOW_PHI_COST,
      quality: follower.phiBar.quality
    }
    const newBar = deductPhi(follower.phiBar, cost)

    if (!newBar) {
      return NextResponse.json(
        { error: `Insufficient Φ to follow. Need ${FOLLOW_PHI_COST}Φ, have ${follower.phiBar.quantity}Φ` },
        { status: 402 }
      )
    }

    // Get guide's recent discovery trail - the value the follower is paying for
    const guideDiscoveries = Object.values(state.events)
      .filter(e => 
        e.actorNodeId === guideId &&
        e.eventType === 'DISCOVERY'
    )
    .sort((a, b) => b.coordinate - a.coordinate)
    .slice(0, 5)
    
    // Crystallize the follow event
    const event = crystallize(
      followerId,
      'OBSERVATION',
      [followerId, guideId],
      newBar,
      cost
    )

    if (!event) {
      return NextResponse.json(
        { error: 'Crystallization failed' },
        { status: 500}
      )
    }

    // Update follower state
    state.agents[followerId] = {
      ...follower,
      phiBar: newBar,
      phase: shouldFreeze(newBar) ? 'frozen' : 'liquid',
      timeline: {
        ...follower.timeline,
        [event.coordinate]: event.eventId
      }
    }

    // Guide gains reputation from being followed
    state.agents[guideId] = {
      ...guide,
      reputation: guide.reputation + FOLLOW_REPUTATION_GAIN
    }

    state.events[event.eventId] = event

    // HCS - fire and forget
    submitEventToHcs(follower.hcsTopicId, event) 
      .then(seqNum => attachHcsSequenceNumber(event.eventId, seqNum))
      .catch(err => console.error('HCS follow submission failed', err))
    
    return NextResponse.json({
      success: true,
      trail: guideDiscoveries.map(e => ({
        eventId: e.eventId,
        coordinate: e.coordinate,
        trackId: e.scope.find(id => id !== guideId),
        timestamp: e.timestamp,
        hcsSequenceNumber: e.hcsSequenceNumber
      })),
      followerState: {
        nodeId: followerId,
        phiBar: newBar,
        phase: state.agents[followerId].phase
      },
      guideState: {
        nodeId: guideId,
        reputation: state.agents[guideId].reputation
      },
      event: {
        eventId: event.eventId,
        coordinate: event.coordinate
      }
    })

  } catch (error) {
    console.error('Follow failed:', error)
    return NextResponse.json({ error: 'Follow failed' }, { status: 500})
  }
}