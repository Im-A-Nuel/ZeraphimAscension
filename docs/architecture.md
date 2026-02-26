# Architecture - Zeraphim: Ascension

## System Overview

Zeraphim: Ascension is a minimalist GameFi web app running on OneChain (Move-based).

### Three-Layer Architecture

```
Frontend (Next.js)  -->  Backend API (Express)  -->  OneChain (Move)
     |                        |                          |
  Wallet TX          Indexer + Leaderboard         On-chain State
  Zustand State      SQLite DB                     Events
  Sonner Toast       REST API                      UserState
```

## Smart Contract (Move)

**Package:** `move/zeraphim_ascension/`

### Modules

| Module | Responsibility |
|--------|---------------|
| `types.move` | Shared structs, constants, error codes, events |
| `quest.move` | User init, quest completion, streak tracking |
| `lootbox.move` | Loot box opening, pseudo-random rewards |
| `wings.move` | Wings minting and evolution (tier 1-3) |

### On-chain State (UserState per address)

- xp, level, shards, loot_tickets
- quests_completed_total, streak_count
- last_quest_day, last_quest_time
- wings_tier (0 = none, 1-3 = evolved)

### Events

- QuestCompletedEvent
- LootOpenedEvent
- WingsMintedEvent
- WingsEvolvedEvent

## Backend API

**Package:** `services/api/`

### Responsibilities

1. **Indexer** - Polls OneChain events, persists to SQLite
2. **Leaderboard** - Computes rankings per period
3. **REST API** - Serves data to frontend

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/quests | Quest catalog |
| GET | /api/users/:address | User stats |
| GET | /api/users/:address/activities | User activity history |
| GET | /api/leaderboard | Top rankings |
| GET | /api/leaderboard/:address | User rank |

### Database (SQLite)

- users, user_stats, activities, leaderboard_entries, indexer_state

## Frontend

**Package:** `apps/web/`

### Pages

| Route | Description |
|-------|-------------|
| / | Landing page with Connect Wallet CTA |
| /dashboard | Core game UI: profile, quests, wings, lootbox |
| /leaderboard | Top 10 + user position |
| /activity | Activity feed |

### State Management

Zustand stores: useAuthStore, useUserStore, useQuestStore, useLeaderboardStore, useActivityStore, useTxStore

### Design

- Minimalist, monochrome, dark theme
- No emojis, no gradients, no colorful elements
- Sonner toast for transaction feedback

## Game Flow

1. Connect Wallet -> init_user (on-chain)
2. Select Quest -> complete_quest (on-chain tx)
3. Receive XP + Shards + Loot Ticket
4. Open Loot Box -> open_lootbox (on-chain tx)
5. Mint Wings -> mint_wings (on-chain tx)
6. Evolve Wings -> evolve_wings (on-chain tx)
7. Leaderboard updates via indexer

## Scoring

```
Score = xp + (shards * 0.2) + (wingsTier * 200) + (min(streak, 7) * 40) + (questsCompletedTotal * 2)
```

Period: Weekly (ISO week format)
