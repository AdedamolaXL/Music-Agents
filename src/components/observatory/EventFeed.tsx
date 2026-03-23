import { RecentEvent } from './types'
import { EVENT_COLORS } from './constants'
import { shortId, timeAgo } from './utils'

export function EventFeed({ events }: { events: RecentEvent[] }) {
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