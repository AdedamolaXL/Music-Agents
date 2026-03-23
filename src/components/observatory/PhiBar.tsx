import { PhiQuality } from './types'
import { QUALITY_COLORS } from './constants'

export function PhiBar({ quantity, quality }: { quantity: number; quality: PhiQuality }) {
  const color = QUALITY_COLORS[quality]
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
          color, textTransform: 'uppercase', letterSpacing: '0.08em',
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