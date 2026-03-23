export function GlobalStyles() {
  return (
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

      @keyframes drawerIn {
        from { opacity: 0; transform: translateX(24px); }
        to   { opacity: 1; transform: translateX(0); }
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
  )
}