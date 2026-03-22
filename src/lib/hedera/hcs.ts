import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
} from "@hashgraph/sdk";
import { getHederaClient } from "./client";
import { LatticeEvent } from "@/types/lattice";

type MirrorNodeMessage = {
  consensus_timestamp: string
  message: string          // base64-encoded payload
  payer_account_id: string
  running_hash: string
  sequence_number: number
  topic_id: string
}

type MirrorNodeResponse = {
  messages: MirrorNodeMessage[]
  links?: {
    next: string | null   // pagination cursor
  }
}

export async function createAgentTopic(
  agentNodeId: string
): Promise<string> {
  const client = getHederaClient()

  const transaction = await new TopicCreateTransaction()
    .setTopicMemo(`shamana:agent:${agentNodeId}`)
    .execute(client)

  const receipt = await transaction.getReceipt(client)

  if (!receipt.topicId) {
    throw new Error(`Topic creation failed for agent ${agentNodeId}`)
  }

  return receipt.topicId.toString()
}

export type HcsEventPayload = {
  eventId: string
  coordinate: number
  eventType: string
  actorNodeId: string
  phiCost: number
  phiQuality: string
  scope: string[]
  timestamp: number
}

// Submit a crystallized event to HCS
export async function submitEventToHcs(
  topicId: string,
  event: LatticeEvent
): Promise<number> {
  const client = getHederaClient()

  const payload: HcsEventPayload = {
    eventId: event.eventId,
    coordinate: event.coordinate,
    eventType: event.eventType,
    actorNodeId: event.actorNodeId,
    phiCost: event.phiCost.quantity,
    phiQuality: event.phiCost.quality,
    scope: event.scope,
    timestamp: event.timestamp
  }

  const message = JSON.stringify(payload)

  const transaction = await new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(topicId))
    .setMessage(message)
    .execute(client)

  const receipt = await transaction.getReceipt(client)

  if (!receipt.topicSequenceNumber) {
    throw new Error(`HCS submission failed for event ${event.eventId}`)
  }

  return receipt.topicSequenceNumber.toNumber()
}

// Read agent's event history from HCS 
export async function getAgentEventHistory(
  topicId: string
): Promise<HcsEventPayload[]> {
  const mirrorUrl =
    `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`

  const response = await fetch(mirrorUrl)

  if (!response.ok) {
    throw new Error(`Mirror node query failed: ${response.status}`)
  }

  const data: MirrorNodeResponse = await response.json()
  const messages = data.messages ?? []

  return messages.map((msg: MirrorNodeMessage) => {
    const decoded = Buffer.from(msg.message, 'base64').toString('utf-8')
    return JSON.parse(decoded) as HcsEventPayload
  })
}

// Compute reputation from HCS event history 
export function computeReputation(
  events: HcsEventPayload[]
): number {
  return events.reduce((reputation, event) => {
    switch (event.eventType) {
      case 'DISCOVERY': return reputation + 10
      case 'PROBE':     return reputation + 5
      case 'OBSERVATION': return reputation + 1
      default:          return reputation
    }
  }, 0)
}




