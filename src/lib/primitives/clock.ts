let globalIndex = 0

export function getIndex(): number { 
  return globalIndex
}

// authorize(Δt) — Φ authorized → index advanced → coordinate issued
// Returns coordinate or null if Φ insufficient
export function authorize(phiAvailable: number, phiCost: number): number | null {
  if (phiAvailable < phiCost) return null // thermodynamic veto
  globalIndex += 1
  return globalIndex // this is the receipt
}

export function resetClock(): void {
  globalIndex = 0 // test/simulation use only
}

