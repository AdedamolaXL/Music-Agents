import { AgentNode, PhiBar, FogCatalog } from "@/types/lattice";
import { getFoggedTracks, getVisibleTracks } from "./catalog";
import { PHI_COSTS, PHI_THRESHOLDS } from "../primitives/constants";

const DECISION_SYSTEM_PROMPT = `You are an autonomous music discovery agent on the Shamana cultural lattice.
You make decisions about where to spend your attention (Φ) each tick.

You will receive your current state and the catlog state. Respond with ONLY a JSON object - no explanation, no markdown:
{
  "action": "PROBE" | "OBSERVE" | "IDLE",
  "trackId": "string or null",
  "reasoning": "one sentence"
}`

export type AgentDecision =
  | { type: 'OBSERVE'; trackId: string; phiCost: number; reasoning?: string }
  | { type: 'PROBE';   trackId: string; phiCost: number; reasoning?: string }
  | { type: 'IDLE';    reason: string }

console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY)


export async function agentDecideWithAI(
  phiBar: PhiBar,
  catalog: FogCatalog,
  recentTrackIds: string[],
  intent?: string
): Promise<AgentDecision> {


  // Thermodynamic veto — agent cannot act
  if (phiBar.quantity <= 10) {
    return { type: 'IDLE', reason: 'phi_exhausted' }
  }

  console.log('Agent intent:', intent)

  const fogged = getFoggedTracks(catalog)
  const visible = getVisibleTracks(catalog)

  // Score each cluster by how relevant it is to the intent
const clusterRelevance = fogged.reduce((acc, t) => {
  if (!acc[t.cluster]) acc[t.cluster] = { count: 0, score: 0, ids: [] }
  acc[t.cluster].count++
  acc[t.cluster].ids.push(t.trackId)

  // Score this track against intent
  if (intent) {
    const intentWords = intent.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const trackText = [t.genre, t.cluster, ...t.tags].join(' ').toLowerCase()
    acc[t.cluster].score += intentWords.filter(w => trackText.includes(w)).length
  }
  return acc
}, {} as Record<string, { count: number; score: number; ids: string[] }>)

// Sort clusters by relevance score, not size
const rankedClusters = Object.entries(clusterRelevance)
  .sort(([, a], [, b]) => b.score - a.score || b.count - a.count)
  
  // Full detail — only for tracks not recently seen (novel to the agent)
const unseenVisible = visible.filter(t => !recentTrackIds.includes(t.trackId))

// Brief mention — for tracks the agent has already observed
const seenVisible = visible.filter(t => recentTrackIds.includes(t.trackId))

  
const statePrompt = `
Φ: ${phiBar.quantity}/100 (${phiBar.quality})
Intent: ${intent || 'none — explore freely'}
Recently seen: ${recentTrackIds.slice(-3).join(', ') || 'none'}

Visible tracks (unseen — full detail):
${unseenVisible.slice(0, 8).map(t => 
  `${t.trackId} | ${t.artist} | ${t.genre} | ${t.year} | [${t.tags.join(', ')}]`
).join('\n')}

Already observed (brief):
${seenVisible.map(t => `${t.trackId}:${t.artist}`).join(', ')}

FFogged tracks — probe these trackIds (ranked by relevance to your intent):
${rankedClusters.map(([cluster, data]) => 
  `${cluster}(${data.count} hidden, relevance:${data.score}): ${data.ids.slice(0, 3).join(', ')}...`
).join('\n')}

Rules:
- PROBE: discovery quality (${PHI_THRESHOLDS.QUALITY_DISCOVERY}Φ+) required. Reveals a hidden track. Returns 25Φ. Use this to find hidden tracks that serve your intent.
- OBSERVE: costs ${PHI_COSTS.OBSERVE_NEARBY}Φ. Choose a visible track that serves your intent.
- IDLE: if Φ too low.`
  
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 8000) // 8 second timeout
  

const systemPrompt = intent
    ? `You are an autonomous music discovery agent on the Shamana cultural lattice.
Your human has set this cultural intent: "${intent}"
You make decisions that serve this intent — probe fog that aligns with it, observe tracks that deepen it, avoid tracks that don't serve it.
IMPORTANT: When probing, choose trackIds from clusters with HIGH RELEVANCE scores first. Do not probe the largest cluster — probe the most relevant cluster. The relevance score tells you how well that cluster matches the intent.
Respond with ONLY a JSON object:
{
  "action": "PROBE" | "OBSERVE" | "IDLE",
  "trackId": "string or null",
  "reasoning": "one sentence explaining how this serves the intent"
}`
    : DECISION_SYSTEM_PROMPT

  try {
    const response = await fetch(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: statePrompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    }),
    signal: controller.signal
  }
)
  
  
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''

console.log('Groq status:', response.status)
console.log('Groq response:', JSON.stringify(data).slice(0, 300))

// Check for API-level errors first
if (data.error) {
  throw new Error(`Groq API error: ${data.error.message}`)
}

// Check for safety blocks or empty candidates
if (!text) {
  throw new Error(`Groq returned no text. FinishReason: ${data.choices?.[0]?.finish_reason}`)
}

// Extract JSON object even if model added surrounding prose
const jsonMatch = text.match(/\{[\s\S]*\}/)
if (!jsonMatch) {
  throw new Error(`No JSON object found in Groq response: ${text}`)
}

    const decision = JSON.parse(jsonMatch[0])
    
    // Sanitize trackId — model sometimes appends artist name e.g. "track-003:Àṣà"
    if (decision.trackId && typeof decision.trackId === 'string') {
    decision.trackId = decision.trackId.split(':')[0].trim()
    }

    if (decision.action === 'PROBE' && fogged.length > 0 && phiBar.quality === 'discovery') {
  const modelChoice = fogged.find(t => t.trackId === decision.trackId)
  const target = modelChoice ?? fogged[Math.floor(Math.random() * fogged.length)]
  return {
    type: 'PROBE',
    trackId: target.trackId,
    phiCost: PHI_COSTS.PROBE_FOG,
    reasoning: decision.reasoning
  }
}

  if (decision.action === 'OBSERVE' && visible.length > 0) {
  // Trust the model's choice first — intent overrides recency
  const modelChoice = visible.find(t => t.trackId === decision.trackId)
  if (modelChoice) {
    return {
      type: 'OBSERVE',
      trackId: modelChoice.trackId,
      phiCost: PHI_COSTS.OBSERVE_NEARBY,
      reasoning: decision.reasoning
    }
  }
  // Fallback: pick unseen track
  const unseen = visible.filter(t => !recentTrackIds.includes(t.trackId))
  const target = unseen.length > 0
    ? unseen[Math.floor(Math.random() * unseen.length)]
    : visible[Math.floor(Math.random() * visible.length)]
  return {
    type: 'OBSERVE',
    trackId: target.trackId,
    phiCost: PHI_COSTS.OBSERVE_NEARBY,
    reasoning: decision.reasoning
  }
}

    return { type: 'IDLE', reason: decision.reasoning ?? 'model_decided_idle' }
  
  } catch (err) {
    // LLM failed - fall back to rule-based silently
    console.error('AI decision failed, falling back:', err)
    return agentDecideFallback(phiBar, catalog, recentTrackIds)
  } finally {
    clearTimeout(timeout) 
  }
}

function agentDecideFallback(
  phiBar: PhiBar,
  catalog: FogCatalog,
  recentTracksIds: string[]
): AgentDecision {
  const visible = getVisibleTracks(catalog)
  const fogged = getFoggedTracks(catalog)


  if (phiBar.quality === 'discovery' && fogged.length > 0) {
    const target = fogged[Math.floor(Math.random() * fogged.length)]
    if (phiBar.quantity >= target.phiToReveal) {
      return { type: 'PROBE', trackId: target.trackId, phiCost: target.phiToReveal }
    }
  }

  const unseen = visible.filter(t => !recentTracksIds.includes(t.trackId))
  const target = unseen.length > 0
    ? unseen[Math.floor(Math.random() * unseen.length)]
    : visible[Math.floor(Math.random() * visible.length)]
    
  return {
    type: "OBSERVE", trackId: target.trackId, phiCost: PHI_COSTS.OBSERVE_NEARBY
  }
}
