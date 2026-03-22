export const PHI_COSTS = {
  OBSERVE_NEARBY: 2,
  OBSERVE_DISTANT: 8,
  PROBE_FOG: 15,
  CRYSTALLIZE_EVENT: 5,
  MAINTAIN_MEMORY: 1, // per tick per liquid event
  SPAWN_AGENT: 10,
} as const 

export const PHI_THRESHOLDS = {
  FREEZE_BELOW: 10, // node freezes when bar drops here
  QUALITY_PASSIVE: 0, 
  QUALITY_ACTIVE: 40,
  QUALITY_DISCOVERY: 70,
} as const

export const PHI_REPLENISHMENT = {
  REWARDING_DISCOVERY: 25,
  BASE_PER_TICK: 3,
} as const

export const TICK_INTERVAL_MS = 15000

