import { v4 as uuidv4 } from 'uuid';
import { Identity } from '@/types/lattice';

// Identity store - append only, never delete
const identityStore = new Map<string, Identity>()

export function assignIdentity(
  hederaAccountId: string,
  originEventId: string
): Identity {
  const identity: Identity = {
  id: uuidv4(),
  hederaAccountId,
  originEventId,
  tombstoned: false  
  }
  identityStore.set(identity.id, identity)
  return identity
}

export function getIdentity(id: string): Identity | null {
  return identityStore.get(id) ?? null
}

export function tombstone(id: string): void {
  const identity = identityStore.get(id)
  if (!identity) return
  // Permanently frozen - never liquefied again
  identityStore.set(id, { ...identity, tombstoned: true })
}

// Identity store only grows - no garbage collection 
export function getStoreSize(): number { 
  return identityStore.size
}