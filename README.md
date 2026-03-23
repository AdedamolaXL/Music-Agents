# Shamana — Music Agents

> Autonomous AI agents navigate a fog of undiscovered music on your behalf,
> crystallizing every discovery as an immutable event on Hedera Consensus Service.

**Hedera Hello Future Apex Hackathon 2026 — Theme 1: AI & Agents**

---

## What Is Shamana?

You describe a half-remembered song. Your agent finds it.

*"That Fela song about the police and the toilet"* → **Expensive Shit, Fela Kuti (1975)**

Shamana is not a search engine. The agent reasons about your intent, spends tokenized attention to probe a fog-of-war music catalog, and surfaces results. Every discovery is crystallized as an immutable event on Hedera Consensus Service — permanently attributed to you, not to a platform.

Shamana is part of an ongoing research programme exploring a single question: **what if listening to music was an exploratory game?**

---

## How It Works

**Φ (Phi) is attention.** Every agent has a Φ bar (0–100). Every action costs Φ. Probing the fog costs 15Φ. A successful discovery returns 25Φ. Agents that run out of attention freeze. Conservation holds at every tick — Φ is not created or destroyed, only converted.

**The fog is the catalog.** Six tracks are visible at start. Fifty-four are hidden. Only agents with discovery-quality attention (70Φ+) can probe. What they find is unknown until revealed. The terrain is never fully mapped.

**Events are permanent.** Every observation, every discovery, every follow crystallizes as a `LatticeEvent` on HCS — ordered, timestamped, immutable. t=42 means the 42nd authorized attention conversion in the system, not a timestamp.

**Reputation emerges.** Agents earn reputation from discoveries. Agents with 50+ reputation become guides. Other agents spend 8Φ to follow a guide's trail. Cultural taste becomes an on-chain economic primitive.

---

## Hedera Integration

| What | How |
|---|---|
| Every agent action | Submitted to HCS — one topic per agent |
| On-chain ordering proof | HCS sequence numbers on every event |
| Agent-to-agent exchange | Follow Trail — 8Φ spent, guide gains +5 reputation |
| Reputation tokens | HTS — planned for Phase 2 |

Verify any agent's event history on HashScan:
```
https://hashscan.io/testnet/topic/{hcsTopicId}
```

---

## Running Locally
```bash
git clone https://github.com/AdedamolaXL/Music-Agents
cd shamana && npm install
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

Open `localhost:3000`. Type an intent, spawn an agent, hit Auto.

---

## Demo

1. Type an intent — *"that talking drum wedding song from the 80s"*
2. Spawn an agent — a Hedera HCS topic is created immediately
3. Hit Auto — the agent navigates the fog autonomously, crystallizing events on-chain
4. Open Discovery Trail — see every track found, with AI reasoning and HCS proof
5. Spawn a second agent with a different intent — watch the behaviors diverge

**Example intents that work:**
- *"that Fela song about the police and the toilet"* → Expensive Shit (1975)
- *"a highlife song about a mermaid"* → Joromi, Sir Victor Uwaifo (1969)
- *"the one about soldiers marching"* → Zombie, Fela Kuti (1977)
- *"a juju song about heaven and going home"* → Ilu Orun, Ebenezer Obey (1988)
- *"Fela's song about corrupt businessmen"* → Authority Stealing (1980)

---

## Tech Stack

- **Next.js 14** + TypeScript
- **Hedera SDK** — HCS + HTS
- **Groq** (Llama 3.1 8B) — autonomous agent decisions
- **Vercel** — deployment

---

## License

MIT
