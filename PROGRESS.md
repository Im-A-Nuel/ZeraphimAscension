# Progress Zeraphim: Ascension

## SELESAI
- [x] Root monorepo: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.env.example`
- [x] Root docs/runbook: `README.md` sudah diisi lengkap
- [x] Scripts: `scripts/faucet.ts`, `scripts/deploy-move.sh`, `scripts/package.json`
- [x] Docs: `docs/proof.md`, `docs/architecture.md`, `docs/pitch.md`, `docs/demo-script.md`
- [x] Struktur `move/zeraphim_ascension` lengkap:
  - `Move.toml`
  - `sources/types.move`
  - `sources/quest.move`
  - `sources/lootbox.move`
  - `sources/wings.move`
  - `tests/quest_test.move`
  - `tests/lootbox_test.move`
  - `tests/wings_test.move`
- [x] Struktur `services/api` lengkap:
  - `package.json`, `tsconfig.json`, `.env.example`
  - `src/types/index.ts`
  - `src/lib/response.ts`, `src/lib/validation.ts`, `src/lib/logger.ts`, `src/lib/index.ts`
  - `src/infra/db/connection.ts`, `migrate.ts`, `index.ts`
  - `src/infra/onchain/client.ts`, `index.ts`
  - `src/infra/index.ts`
  - `src/domain/quests.ts`, `scoring.ts`, `periods.ts`, `index.ts`
  - `src/routes/health/*`, `quests/*`, `users/*`, `leaderboard/*`, `activity/*`, `routes/index.ts`
  - `src/jobs/indexer.ts`, `leaderboard.ts`, `index.ts`
  - `src/server/createServer.ts`, `src/server/index.ts`
  - `src/index.ts`
- [x] Struktur `apps/web` lengkap:
  - `package.json`, `tsconfig.json`, `next.config.js`, `.env.example`, `.eslintrc.json`
  - `tailwind.config.ts`, `postcss.config.js`
  - `src/app/globals.css`, `layout.tsx`, `providers.tsx`
  - `src/types/index.ts`
  - `src/lib/config/index.ts`
  - `src/lib/api/client.ts`, `src/lib/api/index.ts`
  - `src/lib/onchain/executor.ts`, `src/lib/onchain/index.ts`
  - `src/stores/useAuthStore.ts`, `useUserStore.ts`, `useQuestStore.ts`, `useLeaderboardStore.ts`, `useActivityStore.ts`, `useTxStore.ts`, `index.ts`
  - `src/components/pages/(landing)/LandingHero.tsx`, `index.ts`
  - `src/components/pages/(dashboard)/ProfilePanel.tsx`, `QuestCard.tsx`, `QuestBoard.tsx`, `WingsCard.tsx`, `LootBoxPanel.tsx`, `TxToastHandler.tsx`, `DashboardView.tsx`, `index.ts`
  - `src/components/pages/(leaderboard)/LeaderboardTable.tsx`, `index.ts`
  - `src/components/pages/(activity)/ActivityList.tsx`, `index.ts`
  - `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/leaderboard/page.tsx`, `src/app/activity/page.tsx`

## VALIDASI
- [x] `pnpm install` dijalankan (workspace + `pnpm-lock.yaml` sudah terbentuk)
- [x] `pnpm --filter api build` sukses
- [x] `pnpm --filter web build` sukses
- [x] `pnpm run build` (root monorepo) sukses
- [x] `pnpm lint` (root monorepo) sukses
- [x] OneChain CLI `one` sudah terpasang di WSL (`one 1.1.1-f31f8af499c1`)
- [x] `one move build --path move/zeraphim_ascension` sukses (WSL)
- [x] `one move test --path move/zeraphim_ascension` sukses (6/6 test pass, WSL)
- [x] Migrasi Move package dari `AptosFramework` ke OneChain `One` framework selesai

## ATURAN YANG DITERAPKAN
- [x] API response ternormalisasi: `{ status, message, data }`
- [x] Struktur import via index files
- [x] UI monochrome gelap, no gradient, no emoji
- [x] Zustand store + Sonner toast
- [x] Lazy loading untuk komponen berat (dashboard, leaderboard, activity)

## LANGKAH SELANJUTNYA
1. Deploy package ke OneChain testnet dan simpan `PACKAGE_ID`.
2. Eksekusi flow on-chain untuk bukti:
   - `complete_quest`
   - `open_lootbox`
   - `mint_wings` atau `evolve_wings`
3. Isi `docs/proof.md` dengan `PACKAGE_ID` + 3 tx hash + link explorer.
