import { PhiQuality } from './types'

export const QUALITY_COLORS: Record<PhiQuality, string> = {
  passive:   '#f59e0b',
  active:    '#22d3ee',
  discovery: '#c084fc',
}

export const EVENT_COLORS: Record<string, string> = {
  DISCOVERY:   '#c084fc',
  PROBE:       '#22d3ee',
  OBSERVATION: '#94a3b8',
  AGENT_SPAWN: '#34d399',
  AGENT_FREEZE:'#f87171',
  default:     '#94a3b8',
}

export const TICK_INTERVAL = 3500

export const INTENT_SUGGESTIONS = [
  "that Fela song about the police and the toilet",
  "a highlife song about a mermaid",
  "that talking drum wedding song from the 80s",
  "the one about soldiers marching that everyone knows",
  "a juju song about heaven and going home",
  "Fela's song about corrupt businessmen",
]