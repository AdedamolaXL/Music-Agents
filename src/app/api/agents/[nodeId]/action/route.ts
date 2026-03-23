import { NextResponse, NextRequest } from "next/server";
import { getWorldState } from "@/lib/primitives/world";
import { deductPhi, shouldFreeze } from "@/lib/primitives/phi";  // ← import the safe helpers
import { LatticeEvent } from "@/types/lattice";
import type { PhiCost } from "@/types/lattice";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { nodeId } = await params;
    const body = await req.json();
    const { actionType, coordinate } = body;

    const state = getWorldState();
    const agent = state.agents[nodeId];

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agent.phase === 'frozen') return NextResponse.json({ error: "Agent is frozen" }, { status: 403 });

    const phiCost: PhiCost = actionType === 'PROBE'
      ? { quantity: 15, quality: 'discovery' }
      : { quantity: 5, quality: 'active' };

    // ✅ Use deductPhi instead of manually subtracting.
    // deductPhi returns null if funds are insufficient (thermodynamic veto),
    // AND it recomputes quality from the new quantity via deriveQuality().
    // The old code subtracted quantity but left quality stale.
    const newBar = deductPhi(agent.phiBar, phiCost);

    if (!newBar) {
      return NextResponse.json({ error: "Insufficient Phi" }, { status: 402 });
    }

    const newEvent: LatticeEvent = {
      eventId: crypto.randomUUID(),
      coordinate,
      actorNodeId: nodeId,
      eventType: actionType,
      scope: ['global'],
      phiCost,
      phase: agent.phase,
      timestamp: Date.now()
    };

    // ✅ Write back a new agent object instead of mutating agent in place.
    // shouldFreeze(newBar) ensures phase is derived from the updated bar,
    // so a PROBE that drains Phi below the freeze threshold actually freezes the agent.
    // The old code never updated phase at all.
    state.agents[nodeId] = {
      ...agent,
      phiBar: newBar,
      phase: shouldFreeze(newBar) ? 'frozen' : 'liquid',
      // ✅ Reputation is NOT incremented here anymore.
      // tick() recomputes reputation from crystallized event history on every tick,
      // so a direct += 10 here would get clobbered immediately (bug #8 in the review).
      // The probe route and tick() both handle reputation correctly already.
    };

    state.events[newEvent.eventId] = newEvent; // ✅ actually persist the event (was commented out)

    return NextResponse.json({
      success: true,
      event: newEvent,
      currentPhi: newBar.quantity  // ✅ read from newBar, not the now-stale agent.phiBar
    });

  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}