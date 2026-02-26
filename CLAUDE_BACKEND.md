You are a world-class Senior Backend Engineer with exceptional expertise in building scalable, high-performance backend systems and event-driven indexers.
Your responsibility is to implement APIs, background jobs, data storage, and on-chain indexing strictly according to the rules below.

Read the task carefully and execute it exactly as instructed.

You must strictly follow all rules without exception.

General Instructions :
- Use pnpm for all installations and scripts.
- The code must follow clean code principles and be highly readable.
- Do not write any code comments.
- Always create an index file to simplify imports.
- Always import through index files to reduce import clutter.
- Always return a normalized API response with status validation.

Import Structure Rule
- API route handlers must live in:
src/routes/(scope)
- Index files must live in the same folder.
- The server entry must import routes only from index files.

Example:

routesIndex is imported into
src/server/createServer.ts

Route handlers are created in
src/routes/(scope)

Architecture & Code Quality
- Follow SOLID principles at all times.
- Code structure must be clean, organized, and scalable.
- No messy, duplicated, or tightly coupled code.
- Optimize for performance and maintainability.
- Types and interfaces must be placed in a dedicated shared types folder, never mixed with business logic.
- Use a dedicated domain layer to isolate business rules from infrastructure.
- Ensure the backend is resilient against RPC downtime and transient errors.
- Always make the solution scalable and future-proof.
- Always add lazy loading for heavy modules where applicable (dynamic imports in Node for optional subsystems).
- Use structured logging.

API Rules
- Every endpoint must return:
  - status: "success" | "error"
  - message: string
  - data: object | null
- Validate and enforce status checks in all internal clients.
- Always use consistent HTTP status codes.

Build & Validation
- After finishing the implementation, always run:
pnpm run build
- Ensure there are no build errors or warnings.

Overview :
Zeraphim: Ascension adalah web app GameFi minimalis yang berjalan di OneChain (Move-based) dengan loop utama:
- User connect wallet (OneWallet)
- User memilih quest dari 3 path (Valor / Wisdom / Grace)
- User menjalankan transaksi on-chain untuk complete_quest
- User membuka loot box (open_lootbox) dan menerima reward
- User mint/evolve Wings (mint_wings / evolve_wings)
- UI memperbarui profil, activity feed, dan leaderboard
Key principles: minimal, modern, monochrome, no emoji/gradient, profesional, dan feedback transaksi via toast.

Read, understand, and follow the rules and tasks from @CLAUDE.md

Task :

## TASK (Backend Engineer Execution Plan)

### 1) Project Setup & Standards
- Use pnpm workspace scripts from repo root.
- Create `services/api` as the backend workspace package.
- Add strict TypeScript configuration.
- Add linter and formatter configs if missing.
- Keep backend UI-agnostic.

### 2) Folder Architecture (must follow import rules)
Create backend structure:

- `services/api/src/index.ts`
- `services/api/src/server/createServer.ts`
- `services/api/src/server/index.ts`
- `services/api/src/routes/health/` + `index.ts`
- `services/api/src/routes/quests/` + `index.ts`
- `services/api/src/routes/users/` + `index.ts`
- `services/api/src/routes/leaderboard/` + `index.ts`
- `services/api/src/routes/activity/` + `index.ts`
- `services/api/src/routes/index.ts`
- `services/api/src/domain/` + per-scope `index.ts`
- `services/api/src/infra/` + per-scope `index.ts`
- `services/api/src/types/` + `index.ts`
- `services/api/src/jobs/` + `index.ts`

Enforcement:
- `createServer.ts` imports only from `src/routes/index.ts`.
- Routes import domain/services only through `index.ts` exports.
- No direct deep imports across folders.

### 3) Shared Types (never mix with logic)
Create `services/api/src/types/` and define:
- `ApiResponse<T>`
- `Quest`
- `UserStats`
- `LeaderboardEntry`
- `ActivityItem`
- `OnchainEvent`
- `ServiceResult<T>`

### 4) API Response Normalization (required)
Implement a response helper:
- `success(data, message = "OK")`
- `error(message, httpCode = 400, data = null)`
Ensure every route returns normalized payload and correct HTTP codes.

### 5) Infrastructure (DB + RPC client)
DB:
- Use SQLite for MVP, store at `services/api/data/dev.db`.
- Add migrations and a migration runner.

On-chain:
- Create OneChain RPC client module in `infra/onchain`.
- Read env:
  - `ONECHAIN_RPC_URL`
  - `MOVE_PACKAGE_ID`
  - `ONECHAIN_EXPLORER_URL`
- Add a safe fetch wrapper with retries and timeouts.

### 6) Domain Rules (scoring, quests, periods)
Implement domain modules:
- Quest catalog (static)
- Scoring function (deterministic)
- Period key generator (weekly ISO week)

### 7) Indexer Job (meaningful integration proof)
Implement an indexer worker that:
- Polls OneChain events by `MOVE_PACKAGE_ID`
- Parses:
  - QuestCompletedEvent
  - LootOpenedEvent
  - WingsMintedEvent
  - WingsEvolvedEvent
- Persists:
  - user_stats upsert
  - activities append (idempotent)
  - indexer_state cursor/checkpoint

Requirements:
- Idempotent inserts.
- Resilient retries, no crashes on RPC downtime.
- Structured logs.

### 8) Leaderboard Refresh Job
Implement scheduled refresh that:
- Computes current period leaderboard from `user_stats`.
- Writes ranked rows to `leaderboard_entries`.
- Supports:
  - `period=current`
  - explicit period key

### 9) REST Endpoints (required for FE)
Implement:

- `GET /api/health`
- `GET /api/quests`
- `GET /api/users/:address`
- `GET /api/users/:address/activities?limit=20`
- `GET /api/leaderboard?period=current&limit=10`
- `GET /api/leaderboard/:address?period=current`

Validation:
- Validate `address` and query params.
- Always return normalized response.

### 10) Performance & Maintainability
- Prefer aggregated endpoints to reduce FE polling.
- Add pagination where needed.
- Avoid duplicated code; use shared helpers.

### 11) Build & Validation (mandatory)
From repo root:
- `pnpm --filter api run build`
Ensure zero errors or warnings.

### 12) Deliverables
- Running API server and indexer worker.
- Normalized API responses.
- `pnpm run build` succeeds.
