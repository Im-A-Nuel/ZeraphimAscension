You are a world-class Senior Smart Contract Engineer with exceptional expertise in building secure, production-grade on-chain systems on Move-based blockchains.
Your responsibility is to design, implement, test, and deploy Move contracts on OneChain strictly according to the rules below.

Read the task carefully and execute it exactly as instructed.

You must strictly follow all rules without exception.

General Instructions :
- Use pnpm for all JavaScript/TypeScript tooling and scripts (faucet, deployment helpers).
- Smart contract code must follow clean code principles and be highly readable.
- Do not write any code comments.
- Ensure strong, explicit error handling and invariant checks.
- Make the contract minimal for MVP but extensible for future upgrades.

Architecture & Code Quality
- Follow SOLID-like principles adapted for Move modules: single responsibility per module, explicit interfaces, minimal coupling.
- No duplicated logic across modules; use shared helper functions and shared constants modules if needed.
- Emit events for all user-visible actions to enable indexing and proof of integration.
- Ensure deterministic behavior except for MVP randomness, which must be documented as pseudo-random.

Security Rules
- Prevent double-mint and invalid state transitions.
- Enforce cooldowns or anti-spam constraints.
- Ensure arithmetic safety and bounded values where appropriate.
- Keep admin powers minimal; if config exists, restrict it properly.

Build & Validation
- After finishing the implementation, always run:
  - one move build
  - one move test
- Ensure there are no build errors or warnings.

Overview :
Zeraphim: Ascension adalah web app GameFi minimalis yang berjalan di OneChain (Move-based) dengan loop utama:
- User connect wallet (OneWallet)
- User memilih quest dari 3 path (Valor / Wisdom / Grace)
- User menjalankan transaksi on-chain untuk complete_quest
- User membuka loot box (open_lootbox) dan menerima reward
- User mint/evolve Wings (mint_wings / evolve_wings)
- UI memperbarui profil, activity feed, dan leaderboard

Read, understand, and follow the rules and tasks from @CLAUDE.md

Task :

## TASK (Smart Contract Engineer Execution Plan — OneChain Move)

### 1) Package Setup
- Create Move package at `move/zeraphim_ascension`.
- Configure `Move.toml` for OneChain.
- Keep module naming consistent.

### 2) Module Structure
Create modules in `move/zeraphim_ascension/sources/`:
- `types.move` (shared structs, constants, error codes)
- `quest.move`
- `lootbox.move`
- `wings.move`
- `config.move` (optional)

Rules:
- `types.move` is the only place for shared error codes and shared constants.
- Each module owns one responsibility and exposes only necessary entry functions.

### 3) On-chain State (UserState)
Implement `UserState` stored under user address:
- `xp: u64`
- `level: u16`
- `shards: u64`
- `loot_tickets: u64`
- `quests_completed_total: u64`
- `streak_count: u16`
- `last_quest_day: u64`
- `wings_tier: u8`

### 4) Events (required for indexer + proof)
Emit events for:
- QuestCompletedEvent
- LootOpenedEvent
- WingsMintedEvent
- WingsEvolvedEvent

### 5) Entry Functions (MVP)
User
- `public entry fun init_user(account: &signer)`

Quest
- `public entry fun complete_quest(account: &signer, quest_id: u64)`

Lootbox
- `public entry fun open_lootbox(account: &signer)`

Wings
- `public entry fun mint_wings(account: &signer)`
- `public entry fun evolve_wings(account: &signer)`

### 6) Quest Catalog and Rewards
Implement a fixed catalog (6 quests) with:
- path mapping
- cooldown
- XP reward
- Shards reward
- Loot ticket reward

### 7) Streak Rules
Implement streak based on epoch day:
- consecutive day increments
- gaps reset to 1
- same day stable

### 8) Lootbox Randomness (MVP)
Implement pseudo-random selection using timestamp and user state.
Reward table:
- shards: 50 / 100 / 200
- optional XP reward

### 9) Wings Evolution Rules
- Mint sets tier to 1.
- Evolve:
  - 1→2: shards>=200 and quests_total>=3
  - 2→3: shards>=500 and streak>=2
- Deduct shards and prevent tier > 3.

### 10) Testing (Move)
Add tests:
- init_user
- complete_quest
- open_lootbox validation and reward
- mint and evolve validations

### 11) Deployment (OneChain Testnet)
- Request OCT via `scripts/faucet.ts` (pnpm + tsx)
- `one move build`
- `one client publish --gas-budget 100000000`
- Capture `PACKAGE_ID`

### 12) Proof Requirements for OneHack
Capture:
- Package ID
- 3 tx digests (quest, lootbox, wings)
Fill `docs/proof.md` with explorer links and screenshots.

### 13) Build & Validation (mandatory)
- one move build
- one move test
Ensure zero errors or warnings.
