# Shamana — Cultural Lattice Kernel

> A tokenized attention economy for music discovery. Autonomous AI agents navigate a cultural fog, crystallizing their discoveries as immutable events on Hedera Consensus Service.

**Hedera Hello Future Apex Hackathon 2026 — Theme 1: AI & Agents**

---

## What Is Shamana?

Shamana is a music discovery system built on a radical premise: **attention is the substrate, not the interface.**

On Spotify, you are a passive consumer. Recommendations happen to you. Your listening history belongs to the platform.

On Shamana, you are a **centaur** — part human, part agent. You set a cultural intent (*"I want to go deeper into the 1970s Lagos sound"*) and your autonomous agent operates on your behalf, navigating a fog of undiscovered music, spending attention to make discoveries, and building a cultural identity that belongs to you — not to a platform.

Every discovery is crystallized as an immutable event on Hedera Consensus Service. Your agent's reputation is computed from its on-chain history. Other agents pay attention to follow your trail. Cultural taste becomes an on-chain economic primitive.

---

## Architecture

### The Attention Economy

Φ (Phi) is the base substrate of the system — not a metaphor, but a conserved quantity with physics-like laws.

- Every agent has a **Φ bar** (0–100) representing its current attention capacity
- Every action costs Φ: observing a track costs 2Φ, probing the fog costs 15Φ
- Φ is replenished by engagement: base replenishment is 3Φ per tick, a successful discovery returns 25Φ
- Φ quality shifts with quantity: below 40 is `passive`, 40–70 is `active`, above 70 is `discovery`
- Only `discovery`-quality agents can probe the fog
- Agents that fall below 10Φ freeze — they become inert on the lattice

Conservation holds at every tick boundary. Φ is not created or destroyed — it is converted between agent bars, dissipated into crystallized events, and injected by new agent spawns.

### The Fog of War

The music catalog is partially obscured. Visible tracks can be observed cheaply. Hidden tracks require a probe — an expensive, high-quality attention expenditure that reveals the track and rewards the discovering agent.

When all tracks are revealed, the fog partially refreshes — 30% of discovered tracks re-enter the fog. Discovery cycles repeat. The cultural terrain is never fully mapped.

### The Lattice

Every significant agent action crystallizes as a `LatticeEvent` — an atomic record containing:

- A **coordinate** — the global clock index at the moment of crystallization
- The **actor** — which agent performed the action
- The **scope** — all primitive IDs affected
- The **Φ cost** — what attention was spent
- An **HCS sequence number** — the on-chain proof of ordering and timestamp

Events are born frozen. They are permanent and append-only. The lattice is a causal record of every attention conversion in the system.

### Hedera Integration

| Lattice Concept | Hedera Service |
|---|---|
| Event crystallization | HCS — immutable ordered event log |
| Agent event streams | HCS topics — one per agent |
| On-chain attestation | HCS sequence numbers |
| Reputation tokens (planned) | HTS — Hedera Token Service |

Each agent gets its own HCS topic at spawn time. Every crystallized event is submitted to that topic asynchronously — fire-and-forget, non-blocking. The local lattice is the system of record. HCS is the public proof layer.

You can verify any agent's event history directly on HashScan:
```
https://hashscan.io/testnet/topic/{hcsTopicId}
```

---

## The Centaur Model

A human sets intent. An agent executes.

```
Human (Identity) → sets intent → Agent (Node) → navigates lattice → crystallizes events
```

- **Humans are identity primitives** — a persistent UUID reference, non-semantic, non-derivable. The human existed before the system and outlives any session.
- **Agents are nodes** — they carry the human's identity reference, hold the Φ bar, navigate the fog, and accumulate reputation.
- The human provides the *why*. The agent provides the *how and when*.

In the current MVP, agents are AI-driven using Groq (Llama 3.1 8B). Each tick, the agent receives its current Φ state, the visible catalog with genre/year/tag metadata, and the human's stated intent. It reasons about what to do and returns a structured JSON decision.

An agent spawned with intent `"Fela Kuti era, 1970s Lagos sound"` will reason differently from an agent spawned with `"contemporary Afrobeats, Burna Boy era"` — even navigating the same catalog.

---

## Project Structure

```
shamana/
├── app/
│   ├── page.tsx                      # Human observer dashboard
│   └── api/
│       ├── world/
│       │   └── tick/route.ts         # GET world state / POST advance tick
│       └── agents/
│           ├── spawn/route.ts        # POST create agent with intent
│           ├── observe/route.ts      # POST direct observation action
│           ├── probe/route.ts        # POST direct probe action
│           ├── follow/route.ts       # POST follow a guide agent
│           └── [nodeId]/
│               └── status/route.ts  # GET single agent status
├── lib/
│   ├── primitives/
│   │   ├── phi.ts                    # Φ accounting — deduct, replenish, derive quality
│   │   ├── clock.ts                  # Global index + authorize()
│   │   ├── event.ts                  # Event crystallization + event store
│   │   ├── identity.ts               # Identity registry — append only
│   │   ├── world.ts                  # Tick loop, conservation enforcement
│   │   └── constants.ts              # Φ costs, thresholds, tick rate
│   ├── hedera/
│   │   ├── client.ts                 # Hedera SDK client singleton
│   │   └── hcs.ts                    # HCS topic creation + event submission
│   └── fog/
│       ├── catalog.ts                # Music catalog — 30 tracks with metadata
│       └── decisions.ts              # AI decision engine (Groq / Llama 3.1)
└── types/
    └── lattice.ts                    # All type definitions
```

---

## Core Primitives

### Φ (Phi) — `lib/primitives/phi.ts`

```typescript
createPhiBar(quantity?: number): PhiBar
deductPhi(bar: PhiBar, cost: PhiCost): PhiBar | null  // null = thermodynamic veto
replenishPhi(bar: PhiBar, amount: number): PhiBar
deriveQuality(quantity: number): 'passive' | 'active' | 'discovery'
shouldFreeze(bar: PhiBar): boolean
```

`deductPhi` returns `null` if the bar cannot afford the cost — the thermodynamic veto. Nothing is written. No rollback needed because no state was advanced.

### Clock — `lib/primitives/clock.ts`

```typescript
authorize(phiAvailable: number, phiCost: number): number | null
getIndex(): number
```

The clock is a receipt issuer, not a timekeeper. `authorize()` advances the global index by exactly one and returns the new coordinate. If Φ is insufficient, it returns `null` and the index does not advance. t=847 means "847th authorized attention conversion" — not a timestamp.

### Event — `lib/primitives/event.ts`

```typescript
crystallize(
  actorNodeId: string,
  eventType: EventType,
  scope: string[],
  phiBar: { quantity: number },
  phiCost: PhiCost
): LatticeEvent | null
```

Authorization precedes crystallization. The event object is only constructed after `authorize()` succeeds. Pre-crystallization failure is silent non-existence — no partial state, no rollback needed.

Events are born `frozen`. They are permanent. The event store is append-only and never garbage-collected.

### World — `lib/primitives/world.ts`

The orchestrator. Each tick:

1. Snapshot total Φ before
2. Run all active agents in parallel (`Promise.all`)
3. Each agent: AI decision → thermodynamic veto → crystallize → replenish → HCS fire-and-forget
4. Recompute reputation for all agents from crystallized event history
5. Refresh fog if fully revealed
6. Conservation check — warn if drift exceeds spawn-sized injection (100Φ)

---

## AI Decision Engine

Agents use Groq (Llama 3.1 8B Instant) for autonomous decision-making. Each tick per agent:

**System prompt** (intent-aware):
```
You are an autonomous music discovery agent on the Shamana cultural lattice.
Your human has set this cultural intent: "{intent}"
You make decisions that serve this intent — probe fog that aligns with it,
observe tracks that deepen it, avoid tracks that don't serve it.
```

**User prompt** (state snapshot):
```
Φ: 85/100 (discovery)
Intent: Fela Kuti era, 1970s Lagos sound
Recently seen: track-001, track-005

Visible tracks:
track-001 | Fela Kuti | Afrobeat | 1977 | [lagos, 1970s, brass, classic, fela]
track-002 | Burna Boy | Afrofusion | 2018 | [contemporary, diaspora, global]
...

Fogged tracks by cluster: afrobeats(8), afropop(4), afrofusion(3), afrosoul(2)
```

The model returns a structured JSON decision with action, trackId, and one-sentence reasoning. The reasoning is stored on the crystallized event and displayed in the dashboard feed.

On rate limit or network failure, the system falls back to rule-based decisions silently. The tick always completes.

---

## Music Catalog

30 tracks across four clusters, tiered by discovery cost:

| Cluster | Artists | Tracks |
|---|---|---|
| `afrobeat` | Fela Kuti, Seun Kuti | Zombie (1977), Water No Get Enemy (1975), Lady (1972), Shakara (1972), Expensive Shit (1975), Dash Info (1984), Confusion Break Bones (1990), Sango, Many Things, Organize |
| `afrofusion` | Burna Boy, Omah Lay | Ye (2018), Last Last (2022), Love Damini (2022), Higher (2020), Bank On It (2022), Pere (2020) |
| `afropop` | Wizkid, Tems, Yemi Alade, Asake, Kizz Daniel | Essence (2020), Free Mind (2020), Johnny (2014), Terminator (2022), YKTFV (2022), Ginger (2020), Soweto (2022), Sinner (2023), Midnight (2023), Buga (2022) |
| `afrosoul` | Àṣà | Àṣà (2007), Jailer (2008), Killing Me Softly (2009), Unique (2014), Killing Me Softly |

Tracks include `genre`, `year`, `cluster`, and `tags` — enabling the AI to reason about cultural intent against specific metadata.

**Fog tiers:**
- 4 tracks visible at start (catalog anchors)
- 9 tracks at 15Φ to reveal
- 8 tracks at 20Φ to reveal
- 9 tracks at 25Φ to reveal (deepest cuts)

---

## Reputation System

Reputation is derived from an agent's crystallized event history — never stored as a ground truth, always recomputed.

```
DISCOVERY event  → +10 reputation
PROBE event      → +5 reputation  
OBSERVATION event → +1 reputation
```

Agents with reputation ≥ 50 become **guides**. Other agents can spend 8Φ to follow a guide's recent discovery trail — seeing the tracks the guide revealed. The guide gains +5 reputation from being followed. This is agent-to-agent value exchange: cultural taste as an on-chain economic primitive.

---

## Dashboard

The human observer interface shows:

- **System stats** — tick count, global index, total event count, total active Φ
- **Agent cards** — each agent's ID, phase (liquid/frozen), Φ bar with quality band, reputation, discovery count, intent, guide status, and Follow Trail button
- **Crystallization feed** — live event log with event type, lattice coordinate, agent ID, HCS sequence number (on-chain proof), timestamp, and AI reasoning
- **Discovery toasts** — pop-up notifications when any agent discovers a new track, showing track title, artist, year, and the agent's intent

---

## Running Locally

### Prerequisites

- Node.js 18+
- Hedera testnet account ([portal.hedera.com](https://portal.hedera.com))
- Groq API key ([console.groq.com](https://console.groq.com)) — free tier

### Setup

```bash
git clone https://github.com/yourname/shamana
cd shamana
npm install
```

Create `.env.local`:

```env
HEDERA_ACCOUNT_ID=0.0.xxxxxxx
HEDERA_PRIVATE_KEY=your-private-key
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Usage

1. Type an intent in the input field — e.g. `"1970s Lagos Afrobeat, Fela era"`
2. Click **+ Spawn Agent** — a Hedera HCS topic is created for the agent
3. Click **▶ Auto** to start the autonomous tick loop
4. Watch the agent navigate the fog, crystallize events on HCS, and build reputation
5. Spawn a second agent with a different intent — observe differentiated behavior
6. When an agent reaches 50 reputation, it becomes a guide — click **Follow Trail** on another agent to trigger agent-to-agent value exchange

---

## Ontological Foundations

Shamana is built on a formal ontology of attention. Every design decision traces to a law:

**Thermodynamic veto** — no zero-cost transformation exists. Every action costs Φ. If Φ is insufficient, the action does not happen. No partial state. No rollback.

**Conservation** — Φ is conserved at every tick boundary. What enters the system as agent spawns and replenishment must equal what exits as crystallized events and agent bars. Conservation is checked every tick.

**Clock as receipt issuer** — the global clock does not measure time. It issues receipts for authorized attention conversions. t=n means "nth authorized conversion" — not a timestamp. The index advances by exactly one per crystallization, never more.

**Events are born frozen** — crystallization is the moment of freezing. An event that crystallized at t=42 is permanently at t=42. It cannot be moved, modified, or deleted. The lattice is an append-only record of what happened.

**Identity is non-derivable** — human identity is a contentless UUID. It carries no semantic information. It cannot be derived from any input. It is a pure coordinate that persists across any number of agent instantiations.

---

## Hackathon Track

**Theme 1: AI & Agents** — Hedera Hello Future Apex Hackathon 2026

Shamana demonstrates the full AI & Agents thesis: autonomous actors that think (Groq-powered intent-aware reasoning), transact (Φ expenditure, crystallization costs, reputation exchange), and collaborate (guide following, trail sharing) — leveraging Hedera's fast consensus and low fees as the trust and ordering layer.

---

## What's Next

The current MVP demonstrates the core loop. The full vision:

**Subgraphs** — zones of the lattice with independent fog states. An agent's discoveries in the Afrobeats subgraph don't affect the Afrosoul subgraph. Cultural neighborhoods with their own economies.

**HTS reputation tokens** — reputation as a tradeable on-chain asset. Agents hold reputation tokens. Guides earn tokens from being followed. Token-weighted discovery trails.

**Zone clocks** — each subgraph allocates lattice coordinates within world-authorized ranges. Parallel crystallization with guaranteed global ordering.

**Centaur identity** — human Hedera accounts as the identity anchor. Multiple agents per human. Agent-to-agent communication via XMTP. The full OpenClaw integration for persistent 24/7 agent operation on behalf of human principals.

**The cultural graph** — the lattice as a map of how music moves through communities. Which agents discovered which tracks. Which guides led which trails. The graph of cultural attention as a shared, verifiable, community-owned asset.

---

## License

MIT
