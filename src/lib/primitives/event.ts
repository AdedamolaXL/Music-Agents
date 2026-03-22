import { v4 as uuid4 } from 'uuid';
import { LatticeEvent, EventType, PhiCost } from '@/types/lattice';
import { authorize } from './clock';


// Event store - append only 
const eventStore = new Map<string, LatticeEvent>()

export function crystallize(
  actorNodeId: string,
  eventType: EventType,
  scope: string[],
  phiBar: { quantity: number },
  phiCost: PhiCost,
): LatticeEvent | null { 
  // l3 - advancement precedes event
  const coordinate = authorize(phiBar.quantity, phiCost.quantity)
  if (coordinate === null) return null // thermodynamic vet

  // Pre-crystallization state does not exist
  // We only construct the event after authorization succeds
  const event: LatticeEvent = {
    eventId: uuid4(),
    coordinate,
    actorNodeId,
    eventType,
    scope,
    phiCost,
    phase: 'frozen', // born frozen
    timestamp: Date.now()
  }

  eventStore.set(event.eventId, event)
  return event
}

export function getEvent(eventId: string): LatticeEvent | null {
  return eventStore.get(eventId) ?? null
}

export function attachHcsSequenceNumber(
  eventId: string,
  sequenceNumber: number
): LatticeEvent | null {
  const event = eventStore.get(eventId)
  if (!event) return null
  const updated = { ...event, hcsSequenceNumber: sequenceNumber }
  eventStore.set(eventId, updated)
  return updated
}

export function liquefy(eventId: string): void {
  const event = eventStore.get(eventId)
  if (!event) return
  eventStore.set(eventId, { ...event, phase: 'liquid' })
}

export function freeze(eventId: string): void { 
  const event = eventStore.get(eventId)
  if (!event) return
  eventStore.set(eventId, { ...event, phase: 'frozen' })
}

export function getEventsByNode(nodeId: string): LatticeEvent[] {
  return Array.from(eventStore.values())
    .filter(e => e.actorNodeId === nodeId)
}

export function getEventCount(): number {
  return eventStore.size
}