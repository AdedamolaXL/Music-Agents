import { v4 as uuidv4 } from 'uuid'
import { AgentNode, PhaseState } from '@/types/lattice' 
import { createPhiBar, shouldFreeze, deductPhi, replenishPhi } from './phi'
import { PHI_THRESHOLDS } from './constants'

const nodeStore = new Map<string, AgentNode>()

export function spawnNode(
  identityRef: string,
  hcsTopicId: string,
  initialPhi = 100,
  intent?: string  // add this
): AgentNode {
  const node: AgentNode = {
    nodeId: uuidv4(),
    identityRef,
    phiBar: createPhiBar(initialPhi),
    timeline: {},
    phase: 'liquid',
    reputation: 0,
    hcsTopicId,
    intent  // add this
  }
  nodeStore.set(node.nodeId, node)
  return node
}

export function getNode(nodeId: string): AgentNode | null {
  return nodeStore.get(nodeId) ?? null
}

export function getAllNodes(): AgentNode[] {
  return Array.from(nodeStore.values())
}
  
export function updateNode(nodeId: string, updates: Partial<AgentNode>): AgentNode | null {
  const node = nodeStore.get(nodeId)
  if (!node) return null
  const updated = { ...node, ...updates }
  nodeStore.set(nodeId, updated)
  return updated
}

export function recordEventOnTimeline(
  nodeId: string,
  coordinate: number,
  eventId: string
): AgentNode | null {
  const node = nodeStore.get(nodeId)
  if (!node) return null
  return updateNode(nodeId, {
    timeline: {
      ...node.timeline, [coordinate]: eventId }
    }) 
}

export function enforcePhaseState(nodeId: string): AgentNode | null {
  const node = nodeStore.get(nodeId)
  if (!node) return null
  const correctPhase: PhaseState = shouldFreeze(node.phiBar)
  ? 'frozen' : 'liquid'
  if (node.phase === correctPhase) return node
  return updateNode(nodeId, { phase: correctPhase })
}