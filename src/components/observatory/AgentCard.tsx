import { AgentSummary } from './types'
import { QUALITY_COLORS } from './constants'
import { shortId } from './utils'
import { PhiBar } from './PhiBar'

export function AgentCard({
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
          fontFamily: 'var(--mono)', fontSize: 11, color: '#94a3b8', fontStyle: 'italic',
          marginTop: 10, padding: '6px 10px', background: '#0f172a',
          borderRadius: 6, borderLeft: '2px solid #334155', lineHeight: 1.4,
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
                color: '#c084fc', marginLeft: 8, cursor: 'pointer',
                borderBottom: '1px solid #c084fc44', paddingBottom: 1, transition: 'color 0.2s',
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