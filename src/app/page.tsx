'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PhiQuality = 'passive' | 'active' | 'discovery'

type AgentSummary = {
  nodeId: string
  phase: 'liquid' | 'frozen'
  phiBar: { quantity: number; quality: PhiQuality }
  reputation: number
  eventCount: number
  hcsTopicId: string,
  intent?: string 
  discoveryCount?: number
}

type WorldSummary = {
  tick: number
  globalIndex: number
  totalPhiActive: number
  agentCount: number
  eventCount: number
  agents: AgentSummary[]
  recentEvents?: RecentEvent[]
}

type RecentEvent = {
  eventId: string
  agentId: string
  eventType: string
  coordinate: number
  timestamp: number
  hcsSequenceNumber?: number
  reasoning?: string
  trackTitle?: string
  trackArtist?: string
  trackYear?: number
  trackGenre?: string
  trackCluster?: string
  trackTags?: string[] 
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const QUALITY_COLORS: Record<PhiQuality, string> = {
  passive:   '#f59e0b',
  active:    '#22d3ee',
  discovery: '#c084fc',
}

const EVENT_COLORS: Record<string, string> = {
  DISCOVERY:   '#c084fc',
  PROBE:       '#22d3ee',
  OBSERVATION: '#94a3b8',
  AGENT_SPAWN: '#34d399',
  AGENT_FREEZE:'#f87171',
  default:     '#94a3b8',
}

const TICK_INTERVAL = 3500

// ─── Utility ─────────────────────────────────────────────────────────────────

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

function timeAgo(timestamp: number) {
  const delta = Date.now() - timestamp
  if (delta < 2000) return 'just now'
  if (delta < 60000) return `${Math.floor(delta / 1000)}s ago`
  return `${Math.floor(delta / 60000)}m ago`
}

// ─── PhiBar ───────────────────────────────────────────────────────────────────

function PhiBar({ quantity, quality }: { quantity: number; quality: PhiQuality }) {
  const color = QUALITY_COLORS[quality]
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {quality}
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>
          {quantity}<span style={{ color: '#94a3b8' }}>/100</span>
        </span>
      </div>
      <div style={{ width: '100%', height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${quantity}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 4,
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 12px ${color}55`,
        }} />
      </div>
    </div>
  )
}

// ─── AgentCard ────────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  onFollow,
  onOpenDrawer,
}: {
  agent: AgentSummary
  onFollow?: (id: string) => void
  onOpenDrawer?: (agent: AgentSummary) => void
}) {
  const isFrozen = agent.phase === 'frozen'
  const qualityColor = QUALITY_COLORS[agent.phiBar.quality]
  const isGuide = agent.reputation >= 50

  return (
    <div style={{
      background: isFrozen ? '#0f172a' : '#111827',
      border: `1px solid ${isFrozen ? '#1e293b' : qualityColor + '44'}`,
      borderRadius: 16,
      padding: '20px 22px',
      opacity: isFrozen ? 0.55 : 1,
      transition: 'all 0.4s ease',
      boxShadow: isFrozen ? 'none' : `0 4px 32px ${qualityColor}0d`,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {!isFrozen && agent.phiBar.quality === 'discovery' && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 140, height: 140,
          background: 'radial-gradient(circle, #c084fc0f, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#94a3b8', letterSpacing: '0.15em', marginBottom: 4, textTransform: 'uppercase' }}>
            Agent
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: isFrozen ? '#94a3b8' : '#f1f5f9', letterSpacing: '0.03em', marginBottom: 8 }}>
            {shortId(agent.nodeId)}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: isFrozen ? '#1e293b' : '#0f172a',
            border: `1px solid ${isFrozen ? '#334155' : qualityColor + '44'}`,
            borderRadius: 20, padding: '3px 10px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isFrozen ? '#475569' : qualityColor,
              boxShadow: isFrozen ? 'none' : `0 0 8px ${qualityColor}`,
              animation: isFrozen ? 'none' : 'pulse 2s infinite',
            }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: isFrozen ? '#94a3b8' : qualityColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {agent.phase}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            Reputation
          </div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, lineHeight: 1,
            color: isGuide ? '#c084fc' : agent.reputation > 20 ? '#22d3ee' : '#94a3b8',
          }}>
            {agent.reputation}
          </div>
          {isGuide && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6,
              background: '#c084fc1a', border: '1px solid #c084fc44',
              borderRadius: 20, padding: '3px 10px',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 8px #c084fc' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#c084fc', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                Guide
              </span>
            </div>
          )}
        </div>
      </div>

      <PhiBar quantity={agent.phiBar.quantity} quality={agent.phiBar.quality} />

      {agent.intent && (
  <div style={{
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 10,
    padding: '6px 10px',
    background: '#0f172a',
    borderRadius: 6,
    borderLeft: '2px solid #334155',
    lineHeight: 1.4,
  }}>
    "{agent.intent}"
  </div>
)}


      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e293b',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#94a3b8' }}>
  {agent.eventCount} events
  {agent.discoveryCount ? (
    <span
      onClick={() => onOpenDrawer?.(agent)}
      style={{
        color: '#c084fc',
        marginLeft: 8,
        cursor: 'pointer',
        borderBottom: '1px solid #c084fc44',
        paddingBottom: 1,
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#d8b4fe')}
      onMouseLeave={e => (e.currentTarget.style.color = '#c084fc')}
    >
      · {agent.discoveryCount} ✦
    </span>
  ) : null}
</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#64748b', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {agent.hcsTopicId}
        </span>
      </div>

      {onFollow && !isGuide && (
  <button
    onClick={() => onFollow(agent.nodeId)}
    style={{
      marginTop: 12, width: '100%', padding: '9px 0',
      background: 'transparent', border: '1px solid #334155', borderRadius: 8,
      fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8',
      letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
    }}
  >
    ⟶ Follow a Guide — 8Φ
  </button>
)}
    </div>
  )
}

// ─── EventFeed ────────────────────────────────────────────────────────────────

function EventFeed({ events }: { events: RecentEvent[] }) {
  if (events.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
        Awaiting crystallization...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 480, overflowY: 'auto' }}>
      {events.map((event, i) => {
        const color = EVENT_COLORS[event.eventType] ?? EVENT_COLORS.default
        return (
          <div key={event.eventId} style={{
            padding: '10px 14px', borderRadius: 8,
            background: i === 0 ? `${color}0f` : 'transparent',
            borderLeft: `3px solid ${i === 0 ? color : '#1e293b'}`,
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                color, letterSpacing: '0.06em', textTransform: 'uppercase', minWidth: 92,
              }}>
                {event.eventType.replace(/_/g, ' ')}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#94a3b8', minWidth: 44 }}>
                t={event.coordinate}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#94a3b8', flex: 1 }}>
                {shortId(event.agentId)}
              </span>
              {event.hcsSequenceNumber && (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                  ✓{event.hcsSequenceNumber}
                </span>
              )}
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', minWidth: 52, textAlign: 'right' }}>
                {timeAgo(event.timestamp)}
              </span>
            </div>
            {event.reasoning && (
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8',
                marginTop: 5, paddingLeft: 2, lineHeight: 1.5, fontStyle: 'italic',
              }}>
                "{event.reasoning}"
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── SystemStats ──────────────────────────────────────────────────────────────

function SystemStats({ world }: { world: WorldSummary | null }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {[
        { label: 'Tick',     value: world?.tick ?? 0 },
        { label: 'Index',    value: world?.globalIndex ?? 0 },
        { label: 'Events',   value: world?.eventCount ?? 0 },
        { label: 'Φ Active', value: world?.totalPhiActive ?? 0 },
      ].map(stat => (
        <div key={stat.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            {stat.label}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}

function DiscoveryDrawer({
  agent,
  open,
  onClose,
  allEvents,
}: {
  agent: AgentSummary | null
  open: boolean
  onClose: () => void
  allEvents: RecentEvent[]
}) {
  if (!agent) return null

const discoveries = allEvents.filter(e => {
  if (e.agentId !== agent.nodeId) return false
  if (e.eventType !== 'DISCOVERY' && e.eventType !== 'OBSERVATION') return false
  if (!agent.intent) return e.eventType === 'DISCOVERY'

  const intentWords = agent.intent
    .toLowerCase()
    .replace(/\b(that|the|a|an|about|and|or|with|from|its|it|is|in|of|for|this|song|music|one|find|me)\b/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)

  if (intentWords.length === 0) return e.eventType === 'DISCOVERY'

  const trackText = [
    e.trackTitle,
    e.trackArtist,
    e.trackYear?.toString(),
    e.trackGenre,
    e.trackCluster,
    ...(e.trackTags ?? []),
  ].filter(Boolean).join(' ').toLowerCase()

  const matches = intentWords.filter(word => trackText.includes(word)).length
  const score = matches / intentWords.length

  // DISCOVERY: show if any match
  if (e.eventType === 'DISCOVERY') return matches >= 1 && score >= 0.2

  // OBSERVATION: only show if strong match — agent recognising the song
  return score >= 0.5

}).sort((a, b) => {
  // Discoveries and strong observations both sorted by score
  const intentWords = agent.intent
    ? agent.intent.toLowerCase()
        .replace(/\b(that|the|a|an|about|and|or|with|from|its|it|is|in|of|for|this|song|music|one|find|me)\b/g, '')
        .split(/\s+/).filter(w => w.length > 2)
    : []

  const scoreOf = (e: RecentEvent) => {
    const trackText = [
      e.trackTitle, e.trackArtist, e.trackYear?.toString(),
      e.trackGenre, e.trackCluster, ...(e.trackTags ?? []),
    ].filter(Boolean).join(' ').toLowerCase()
    return intentWords.filter(w => trackText.includes(w)).length
  }

  // Prioritise observations of already-visible tracks that match intent
  const typeScore = (e: RecentEvent) => e.eventType === 'OBSERVATION' ? 1 : 0
  return (scoreOf(b) + typeScore(b)) - (scoreOf(a) + typeScore(a)) || b.coordinate - a.coordinate
})
  
  // Best fit is the first item after score-sorting (already done above)
const bestFitEventId = discoveries.length > 0 ? discoveries[0].eventId : null
  
  const allAgentDiscoveries = allEvents.filter(
  e => e.agentId === agent.nodeId && e.eventType === 'DISCOVERY'
)
const filtered = allAgentDiscoveries.length - discoveries.length

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#00000088',
          zIndex: 900,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 420,
        background: '#0a0f1e',
        borderLeft: '1px solid #1e293b',
        zIndex: 1000,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Drawer header */}
        <div style={{
          padding: '28px 28px 20px',
          borderBottom: '1px solid #1e293b',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: '#94a3b8',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Matches Found
              </div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 20,
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: 8,
              }}>
                {agent.nodeId.slice(0, 8).toUpperCase()}
              </div>
              {agent.intent && (
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: '#94a3b8',
                  fontStyle: 'italic',
                  padding: '5px 10px',
                  background: '#111827',
                  borderRadius: 6,
                  borderLeft: '2px solid #334155',
                  display: 'inline-block',
                }}>
                  "{agent.intent}"
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #1e293b',
                borderRadius: 8,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: 16,
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e293b'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'
              }}
            >
              ✕
            </button>
          </div>

          {/* Summary stats */}
          <div style={{
            display: 'flex',
            gap: 16,
            marginTop: 16,
          }}>
            {[
              { label: 'Discoveries', value: discoveries.length },
              { label: 'Reputation', value: agent.reputation },
              { label: 'Events', value: agent.eventCount },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1,
                background: '#111827',
                borderRadius: 8,
                padding: '10px 14px',
                border: '1px solid #1e293b',
              }}>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  color: '#94a3b8',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: s.label === 'Discoveries' ? '#c084fc' : '#f1f5f9',
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {filtered > 0 && agent.intent && (
  <div style={{
    fontFamily: 'var(--mono)',
    fontSize: 10,
    color: '#64748b',
    marginTop: 12,
    padding: '6px 12px',
    background: '#111827',
    borderRadius: 6,
    borderLeft: '2px solid #1e293b',
  }}>
    Showing {discoveries.length} of {allAgentDiscoveries.length} discoveries matching "{agent.intent}" · {filtered} filtered out
  </div>
)}

        </div>

        {/* Discovery list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 28px',
        }}>
          {discoveries.length === 0 ? (
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 13,
              color: '#64748b',
              textAlign: 'center',
              paddingTop: 40,
            }}>
              No discoveries yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {discoveries.map((event, i) => (
                <div
                  key={event.eventId}
  style={{
    background: event.eventId === bestFitEventId && agent.intent ? '#1a1130' : '#111827',
    border: '1px solid #1e293b',
    borderLeft: `3px solid ${event.eventId === bestFitEventId && agent.intent ? '#c084fc' : '#c084fc66'}`,
    borderRadius: 10,
    padding: '14px 16px',
    animation: `drawerIn 0.3s ease ${i * 0.04}s both`,
  }}
                >
                  {/* Status label */}
<div style={{
  fontFamily: 'var(--mono)',
  fontSize: 9,
  color: event.eventType === 'OBSERVATION' ? '#22d3ee' : '#c084fc',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 6,
  fontWeight: 600,
}}>
  {event.eventType === 'OBSERVATION' ? 'Recognised' : 'Discovered'}
</div>

{/* Track info */}
<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
  <div style={{
    fontFamily: 'var(--display)',
    fontSize: 15,
    fontWeight: 700,
    color: '#f1f5f9',
    flex: 1,
  }}>
    {event.trackTitle ?? `Track at t=${event.coordinate}`}
  </div>
</div>

                  {/* Reasoning */}
                  {event.reasoning && (
                    <div style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: '#94a3b8',
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                      borderTop: '1px solid #1e293b',
                      paddingTop: 8,
                    }}>
                      "{event.reasoning}"
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                  }}>
                    {event.eventId === bestFitEventId && agent.intent && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#c084fc22',
                        border: '1px solid #c084fc66',
                        borderRadius: 20,
                        padding: '2px 8px',
                        marginLeft: 8,
                        flexShrink: 0,
                      }}>
                        <div style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#c084fc',
                          boxShadow: '0 0 6px #c084fc',
                        }} />
                        <span style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 9,
                          color: '#c084fc',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}>
                          Best fit
                        </span>
                      </div>)}
                    {event.hcsSequenceNumber && (
                      <span style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        color: '#34d399',
                        fontWeight: 600,
                      }}>
                        ✓ on-chain #{event.hcsSequenceNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}



// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [world, setWorld] = useState<WorldSummary | null>(null)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [autoTick, setAutoTick] = useState(false)
  const [loading, setLoading] = useState(false)
  const [spawnLoading, setSpawnLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intentInput, setIntentInput] = useState('')
  const [drawerAgent, setDrawerAgent] = useState<AgentSummary | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [intentFocused, setIntentFocused] = useState(false)

  const openDrawer = useCallback((agent: AgentSummary) => {
  setDrawerAgent(agent)
  setDrawerOpen(true)
}, [])

const closeDrawer = useCallback(() => {
  setDrawerOpen(false)
  setTimeout(() => setDrawerAgent(null), 300) // wait for close animation
}, [])

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/world/tick', { method: 'GET' })
      if (!res.ok) return
      const data = await res.json()
      setWorld(data)
      
if (data.recentEvents) {
  setRecentEvents(data.recentEvents)
}
    } catch {}
  }, [])

 const advanceTick = useCallback(async () => {
  if (loading) return
  setLoading(true)
  setError(null)
  try {
    const res = await fetch('/api/world/tick', { method: 'POST' })
    if (!res.ok) { const err = await res.json(); setError(err.error ?? 'Tick failed'); return }
    const data = await res.json()
      const discoveries = data.recentEvents?.filter((e: RecentEvent) => e.eventType === 'DISCOVERY')
console.log('Discoveries in response:', discoveries)
    setWorld(data)
    if (data.recentEvents) {
  setRecentEvents(data.recentEvents)
}
  } catch { setError('Network error') }
  finally { setLoading(false) }
 }, [loading])
  


  const spawnAgent = useCallback(async () => {
    if (spawnLoading) return
    setSpawnLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/agents/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  hederaAccountId: `0.0.${Math.floor(Math.random() * 9000000) + 1000000}`,
  intent: intentInput.trim() || undefined
})
      })
      if (!res.ok) { const err = await res.json(); setError(err.error ?? 'Spawn failed'); return }
      await fetchState()
    } catch { setError('Spawn failed') }
    finally { setSpawnLoading(false) }
  }, [spawnLoading, fetchState, intentInput])

  const handleFollow = useCallback(async (followerId: string) => {
    const guide = world?.agents
      .filter(a => a.reputation >= 50 && a.nodeId !== followerId)
      .sort((a, b) => b.reputation - a.reputation)[0]
    if (!guide) { setError('No guide available — needs 50+ reputation'); return }
    const res = await fetch('/api/agents/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId, guideId: guide.nodeId })
    })
    const data = await res.json()
    if (data.success) await fetchState()
    else setError(data.error)
  }, [world, fetchState])

  useEffect(() => {
    if (!autoTick) return
    const interval = setInterval(advanceTick, TICK_INTERVAL)
    return () => clearInterval(interval)
  }, [autoTick, advanceTick])

  useEffect(() => { fetchState() }, [fetchState])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap');

        :root {
          --mono: 'JetBrains Mono', monospace;
          --display: 'Outfit', sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #030712;
          color: #f1f5f9;
          min-height: 100vh;
          font-family: var(--display);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        if (data.recentEvents) {
  setRecentEvents(data.recentEvents)
}

        .agent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .btn {
          font-family: var(--mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          border-radius: 8px;
          padding: 11px 22px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .btn-primary { background: #c084fc; color: #0a0014; font-weight: 700; }
        .btn-primary:hover:not(:disabled) { background: #d8b4fe; box-shadow: 0 0 28px #c084fc44; }

        .btn-secondary { background: transparent; color: #94a3b8; border: 1px solid #334155; }
        .btn-secondary:hover:not(:disabled) { border-color: #475569; color: #e2e8f0; }

        .btn-active { background: #22d3ee1a; color: #22d3ee; border: 1px solid #22d3ee44; }
        .btn-active:hover:not(:disabled) { background: #22d3ee28; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 28px', animation: 'fadeUp 0.5s ease' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid #1e293b',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
              Shamana // Cultural Lattice
            </div>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 42, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 10 }}>
              Agent Observatory
            </h1>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#94a3b8' }}>
              Human observer interface — agents operate autonomously
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {error && (
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: '#fca5a5',
                background: '#f8717114', border: '1px solid #f8717130',
                borderRadius: 6, padding: '7px 14px', maxWidth: 260,
              }}>
                {error}
              </div>
            )}
            {/* Intent input with suggestions */}
<div style={{ position: 'relative' }}>
  <input
    type="text"
    placeholder="Describe a song you're trying to find..."
    value={intentInput}
    onChange={e => setIntentInput(e.target.value)}
    onFocus={() => setIntentFocused(true)}
    onBlur={() => setTimeout(() => setIntentFocused(false), 150)}
    style={{
      fontFamily: 'var(--mono)',
      fontSize: 11,
      background: '#0f172a',
      border: `1px solid ${intentFocused ? '#475569' : '#334155'}`,
      borderRadius: 8,
      padding: '10px 14px',
      color: '#e2e8f0',
      width: 300,
      outline: 'none',
      letterSpacing: '0.02em',
      transition: 'border-color 0.2s',
    }}
  />

  {/* Suggestions dropdown */}
  {intentFocused && !intentInput && (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      right: 0,
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: 10,
      overflow: 'hidden',
      zIndex: 100,
      boxShadow: '0 8px 32px #00000066',
    }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 9,
        color: '#475569',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        padding: '10px 14px 6px',
      }}>
        Try one of these
      </div>
      {[
        "that Fela song about the police and the toilet",
        "a highlife song about a mermaid",
        "that talking drum wedding song from the 80s",
        "the one about soldiers marching that everyone knows",
        "a juju song about heaven and going home",
        "Fela's song about corrupt businessmen",
      ].map((suggestion, i) => (
        <div
          key={i}
          onMouseDown={() => setIntentInput(suggestion)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: '#cbd5e1',
            padding: '9px 14px',
            cursor: 'pointer',
            borderTop: i === 0 ? 'none' : '1px solid #1e293b',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          "{suggestion}"
        </div>
      ))}
    </div>
  )}
</div>

<button className="btn btn-secondary" onClick={spawnAgent} disabled={spawnLoading}>
  {spawnLoading ? 'Spawning...' : '+ Spawn Agent'}
            </button>
            
            <button className={`btn ${autoTick ? 'btn-active' : 'btn-secondary'}`} onClick={() => setAutoTick(v => !v)}>
              {autoTick ? '⏸ Pause' : '▶ Auto'}
            </button>
            <button className="btn btn-primary" onClick={advanceTick} disabled={loading || autoTick}>
              {loading ? 'Ticking...' : 'Tick →'}
            </button>
          </div>
        </div>

        <SystemStats world={world} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, marginTop: 28 }}>

          {/* Agents */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              Active Agents — {world?.agentCount ?? 0}
            </div>

            {(!world || world.agentCount === 0) && (
              <div style={{ border: '1px dashed #1e293b', borderRadius: 16, padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#64748b' }}>
                  No agents — spawn one to begin
                </div>
              </div>
            )}

            <div className="agent-grid">
              {world?.agents.map(agent => (
  <AgentCard
    key={agent.nodeId}
    agent={agent}
    onFollow={handleFollow}
    onOpenDrawer={openDrawer}
  />
))}
            </div>
          </div>

          {/* Right panel */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
              Event Feed
            </div>

            <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <EventFeed events={recentEvents} />
            </div>

            {/* Legend */}
            <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
                Event Types
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {Object.entries(EVENT_COLORS).filter(([k]) => k !== 'default').map(([type, color]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#94a3b8', letterSpacing: '0.04em' }}>
                      {type.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 56, paddingTop: 24, borderTop: '1px solid #1e293b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#1e293b', letterSpacing: '0.08em' }}>
            SHAMANA LATTICE KERNEL v0.1 — HEDERA TESTNET
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#1e293b', letterSpacing: '0.08em' }}>
            Φ CONSERVATION ENFORCED — ALL EVENTS IMMUTABLE
          </span>
        </div>
      </div>

      <DiscoveryDrawer
  agent={drawerAgent}
  open={drawerOpen}
  onClose={closeDrawer}
  allEvents={recentEvents}
/>
    
    </>
  )
}