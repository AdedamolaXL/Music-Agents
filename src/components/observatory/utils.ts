export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

export function timeAgo(timestamp: number) {
  const delta = Date.now() - timestamp
  if (delta < 2000) return 'just now'
  if (delta < 60000) return `${Math.floor(delta / 1000)}s ago`
  return `${Math.floor(delta / 60000)}m ago`
}

export function filterAndScoreByIntent(
  intentWords: string[],
  trackFields: (string | undefined)[]
): { matches: number; score: number } {
  const trackText = trackFields.filter(Boolean).join(' ').toLowerCase()
  const matches = intentWords.filter(w => trackText.includes(w)).length
  const score = intentWords.length > 0 ? matches / intentWords.length : 0
  return { matches, score }
}

export function parseIntentWords(intent: string): string[] {
  return intent
    .toLowerCase()
    .replace(/\b(that|the|a|an|about|and|or|with|from|its|it|is|in|of|for|this|song|music|one|find|me)\b/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)
}