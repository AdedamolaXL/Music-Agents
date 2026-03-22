import { PhiBar, PhiCost } from '@/types/lattice'
import { PHI_THRESHOLDS } from './constants'

export function createPhiBar(quantity = 100): PhiBar {
  return {
    quantity,
    quality: deriveQuality(quantity)
  }
}

export function deductPhi(bar: PhiBar, cost: PhiCost): PhiBar | null {
  if (bar.quantity < cost.quantity) return null // thermodynamic veto
  const newQuantity = bar.quantity - cost.quantity
  return { quantity: newQuantity, quality: deriveQuality(newQuantity) }
}

export function replenishPhi(bar: PhiBar, amount: number): PhiBar { 
  const newQuantity = Math.min(100, bar.quantity + amount)
  return { quantity: newQuantity, quality: deriveQuality(newQuantity)}
}

export function deriveQuality(quantity: number): PhiBar['quality'] {
  if (quantity >= PHI_THRESHOLDS.QUALITY_DISCOVERY) return 'discovery'
  if (quantity >= PHI_THRESHOLDS.QUALITY_ACTIVE) return 'active'
  return 'passive'
}

export function shouldFreeze(bar: PhiBar): boolean { 
  return bar.quantity <= PHI_THRESHOLDS.FREEZE_BELOW
}

// Conservation check - call this on every tick
export function assertConservation(
  totalBefore: number,
  totalAfter: number,
  dissipated: number,
  injected: number
): boolean {
  return totalBefore + injected - dissipated === totalAfter
}

