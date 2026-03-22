import { NextResponse } from "next/server";
import { getWorldState } from "@/lib/primitives/world";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

export async function GET(
  req: Request,
  { params }: { params: { nodeId: string } }
) { 
  try {
    const { nodeId } = params
    const state = getWorldState()
    const agent = state.agents[nodeId]

    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${nodeId} not found` },
        { status: 400 }
      )
    }

    // Get agent's recent events from the event store
    const agentEvents = Object.values(state.events)
      .filter(e => e.actorNodeId === nodeId)
      .sort((a, b) => b.coordinate - a.coordinate)
      .slice(0, 10)
      .map(e => ({
        eventId: e.eventId,
        eventType: e.eventType,
        coordinate: e.coordinate,
        timestamp: e.timestamp,
        hcsSequenceNumber: e.hcsSequenceNumber
      }))

    // Compute guide status - agent with rep > 50 are discovery guides
    const isGuide = agent.reputation >= 50
    const guideRank = isGuide
      ? Object.values(state.agents)
        .filter(a => a.reputation >= 50)
        .sort((a, b) => b.reputation - a.reputation)
        .findIndex(a => a.nodeId === nodeId) + 1
      : null
    
    return NextResponse.json({
      nodeId: agent.nodeId,
      phase: agent.phase,
      phiBar: agent.phiBar,
      reputation: agent.reputation,
      eventCount: Object.keys(agent.timeline).length,
      hcsTopicId: agent.hcsTopicId,
      isGuide,
      guideRank,
      recentEvents: agentEvents,
      // Human-readable summary for OpenClaw to relay back to user
      summary: buildSummary(agent, agentEvents, isGuide, guideRank)
    })
  
  } catch (error) {
    console.error('Status failed:', error)
    return NextResponse.json({ error: 'Status failed'}, { status: 500})
  }
}

function buildSummary(
  agent: any,
  recentEvents: any[],
  isGuide: boolean,
  guideRank: number | null
): string {
  const phiStatus = `${agent.phiBar.quantity}Φ (${agent.phiBar.quality} quality)`
  const phaseStatus = agent.phase === 'liquid' ? 'active' : 'frozen'
  const repStatus = isGuide
    ? `reputation ${agent.reputation} - ranked #${guideRank} discovery guide`
    : `reputation ${agent.reputation}`
  
  const lastEvent = recentEvents[0]
  const lastAction = lastEvent
    ? `Last action: ${lastEvent.eventType} at coordinate t=${lastEvent.coordinate}`
    : 'No events yet'
  
  return `Your node is ${phaseStatus} with ${phiStatus} and ${repStatus}. ${lastAction}.${isGuide ? ' You are a trusted discovery guide - other agents can follow your trail.' : ''}`
}
