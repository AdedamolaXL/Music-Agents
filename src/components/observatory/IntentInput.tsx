import { useState } from 'react'
import { INTENT_SUGGESTIONS } from './constants'

export function IntentInput({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Describe a song you're trying to find..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          background: '#0f172a',
          border: `1px solid ${focused ? '#475569' : '#334155'}`,
          borderRadius: 8,
          padding: '10px 14px',
          color: '#e2e8f0',
          width: 300,
          outline: 'none',
          letterSpacing: '0.02em',
          transition: 'border-color 0.2s',
        }}
      />

      {focused && !value && (
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
            fontFamily: 'var(--mono)', fontSize: 9, color: '#475569',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '10px 14px 6px',
          }}>
            Try one of these
          </div>
          {INTENT_SUGGESTIONS.map((suggestion, i) => (
            <div
              key={i}
              onMouseDown={() => onChange(suggestion)}
              style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: '#cbd5e1',
                padding: '9px 14px', cursor: 'pointer',
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
  )
}