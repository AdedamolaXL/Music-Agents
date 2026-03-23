import { WorldSummary } from './types'

export function SystemStats({ world }: { world: WorldSummary | null }) {
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