import { NextResponse, NextRequest } from 'next/server'
import { tick, getWorldState } from '@/lib/primitives/world'

export async function POST(req: NextRequest) {
  try {
    const newState = await tick()

    const recentEvents = Object.values(newState.events)
      .sort((a, b) => b.coordinate - a.coordinate)
      .slice(0, 20)
      .map(e => ({
        eventId: e.eventId,
        agentId: e.actorNodeId,
        eventType: e.eventType,
        coordinate: e.coordinate,
        timestamp: e.timestamp,
        hcsSequenceNumber: e.hcsSequenceNumber,
        reasoning: e.reasoning,
        trackTitle: e.trackMeta?.title,
  trackArtist: e.trackMeta?.artist,
  trackYear: e.trackMeta?.year,
  trackGenre: e.trackMeta?.genre,
  trackCluster: e.trackMeta?.cluster,
  trackTags: e.trackMeta?.tags,  
      }))

    return NextResponse.json({
      tick: newState.tick,
      globalIndex: newState.globalIndex,
      totalPhiActive: newState.totalPhiActive,
      agentCount: Object.keys(newState.agents).length,
      eventCount: Object.keys(newState.events).length,
      agents: Object.values(newState.agents).map(agent => ({
        nodeId: agent.nodeId,
        phase: agent.phase,
        phiBar: agent.phiBar,
        reputation: agent.reputation,
        eventCount: Object.keys(agent.timeline).length,
        hcsTopicId: agent.hcsTopicId,
        intent: agent.intent,
        discoveryCount: Object.values(newState.events)
        .filter(e => e.actorNodeId === agent.nodeId && e.eventType === 'DISCOVERY')
        .length
        })),
      recentEvents
    })
  } catch (error) {
    console.error('Tick failed:', error)
    return NextResponse.json(
      { error: 'Tick failed' },
      { status: 500 }
    )
  }
}


export async function GET(req: NextRequest) {
  const state = getWorldState()
  const recentEvents = Object.values(state.events)
  .sort((a, b) => b.coordinate - a.coordinate)  // most recent first
  .slice(0, 20)
  .map(e => ({
    eventId: e.eventId,
    agentId: e.actorNodeId,
    eventType: e.eventType,
    coordinate: e.coordinate,
    timestamp: e.timestamp,
    hcsSequenceNumber: e.hcsSequenceNumber,
    reasoning: e.reasoning,
     trackTitle: e.trackMeta?.title,
  trackArtist: e.trackMeta?.artist,
  trackYear: e.trackMeta?.year,
  trackGenre: e.trackMeta?.genre,
  trackCluster: e.trackMeta?.cluster,
  trackTags: e.trackMeta?.tags,
  }))

  return NextResponse.json({
  tick: state.tick,
  globalIndex: state.globalIndex,
  totalPhiActive: state.totalPhiActive,
  agentCount: Object.keys(state.agents).length,
  eventCount: Object.keys(state.events).length,
  agents: Object.values(state.agents).map(agent => ({
    nodeId: agent.nodeId,
    phase: agent.phase,
    phiBar: agent.phiBar,
    reputation: agent.reputation,
    eventCount: Object.keys(agent.timeline).length,
    hcsTopicId: agent.hcsTopicId,
    intent: agent.intent,
    discoveryCount: Object.values(state.events)
    .filter(e => e.actorNodeId === agent.nodeId && e.eventType === 'DISCOVERY')
    .length
  })),
  recentEvents
  })
}