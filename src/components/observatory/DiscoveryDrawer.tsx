import { AgentSummary, RecentEvent } from './types'
import { parseIntentWords, filterAndScoreByIntent } from './utils'

export function DiscoveryDrawer({
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

  const intentWords = agent.intent ? parseIntentWords(agent.intent) : []

  const getTrackFields = (e: RecentEvent) => [
    e.trackTitle, e.trackArtist, e.trackYear?.toString(),
    e.trackGenre, e.trackCluster, ...(e.trackTags ?? []),
  ]

  const discoveries = allEvents.filter(e => {
    if (e.agentId !== agent.nodeId) return false
    if (e.eventType !== 'DISCOVERY' && e.eventType !== 'OBSERVATION') return false
    if (!agent.intent || intentWords.length === 0) return e.eventType === 'DISCOVERY'

    const { matches, score } = filterAndScoreByIntent(intentWords, getTrackFields(e))

    if (e.eventType === 'DISCOVERY') return matches >= 1 && score >= 0.2
    return score >= 0.5
  }).sort((a, b) => {
    const scoreOf = (e: RecentEvent) =>
      filterAndScoreByIntent(intentWords, getTrackFields(e)).matches
    const typeScore = (e: RecentEvent) => e.eventType === 'OBSERVATION' ? 1 : 0
    return (scoreOf(b) + typeScore(b)) - (scoreOf(a) + typeScore(a)) || b.coordinate - a.coordinate
  })

  const bestFitEventId = discoveries.length > 0 ? discoveries[0].eventId : null
  const allAgentDiscoveries = allEvents.filter(e => e.agentId === agent.nodeId && e.eventType === 'DISCOVERY')
  const filtered = allAgentDiscoveries.length - discoveries.length

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: '#00000088', zIndex: 900,
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 420,
        background: '#0a0f1e', borderLeft: '1px solid #1e293b', zIndex: 1000,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                Matches Found
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                {agent.nodeId.slice(0, 8).toUpperCase()}
              </div>
              {agent.intent && (
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', fontStyle: 'italic',
                  padding: '5px 10px', background: '#111827', borderRadius: 6,
                  borderLeft: '2px solid #334155', display: 'inline-block',
                }}>
                  "{agent.intent}"
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: '1px solid #1e293b', borderRadius: 8,
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#94a3b8', fontSize: 16, flexShrink: 0, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e293b' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            {[
              { label: 'Discoveries', value: discoveries.length },
              { label: 'Reputation', value: agent.reputation },
              { label: 'Events', value: agent.eventCount },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: '#111827', borderRadius: 8, padding: '10px 14px', border: '1px solid #1e293b' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: s.label === 'Discoveries' ? '#c084fc' : '#f1f5f9' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {filtered > 0 && agent.intent && (
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10, color: '#64748b',
              marginTop: 12, padding: '6px 12px', background: '#111827',
              borderRadius: 6, borderLeft: '2px solid #1e293b',
            }}>
              Showing {discoveries.length} of {allAgentDiscoveries.length} discoveries matching "{agent.intent}" · {filtered} filtered out
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {discoveries.length === 0 ? (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#64748b', textAlign: 'center', paddingTop: 40 }}>
              No discoveries yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {discoveries.map((event, i) => {
                const isBestFit = event.eventId === bestFitEventId && !!agent.intent
                return (
                  <div
                    key={event.eventId}
                    style={{
                      background: isBestFit ? '#1a1130' : '#111827',
                      border: '1px solid #1e293b',
                      borderLeft: `3px solid ${isBestFit ? '#c084fc' : '#c084fc66'}`,
                      borderRadius: 10,
                      padding: '14px 16px',
                      animation: `drawerIn 0.3s ease ${i * 0.04}s both`,
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 9,
                      color: event.eventType === 'OBSERVATION' ? '#22d3ee' : '#c084fc',
                      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600,
                    }}>
                      {event.eventType === 'OBSERVATION' ? 'Recognised' : 'Discovered'}
                    </div>

                    <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
                      {event.trackTitle ?? `Track at t=${event.coordinate}`}
                    </div>

                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                      {event.trackArtist ?? '—'}{event.trackYear ? ` · ${event.trackYear}` : ''}
                    </div>

                    {event.reasoning && (
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', fontStyle: 'italic',
                        lineHeight: 1.5, borderTop: '1px solid #1e293b', paddingTop: 8,
                      }}>
                        "{event.reasoning}"
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#334155' }}>
                        t={event.coordinate}
                      </span>
                      {event.hcsSequenceNumber && (
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#34d399', fontWeight: 600 }}>
                          ✓ on-chain #{event.hcsSequenceNumber}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}