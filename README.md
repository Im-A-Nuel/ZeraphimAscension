# Zeraphim: Ascension

Monorepo GameFi MVP untuk OneChain dengan 3 layer:

- `move/zeraphim_ascension` untuk smart contract Move
- `services/api` untuk backend API + indexer + leaderboard
- `apps/web` untuk frontend Next.js

## Prasyarat

- Node.js 20+
- pnpm 9+

## Struktur Workspace

- `apps/web` frontend Next.js + Zustand + Sonner
- `services/api` backend Express + SQLite
- `scripts` utilitas faucet dan deploy helper
- `move/zeraphim_ascension` package Move

## Setup Cepat

1. Install dependency:
   - `pnpm install`
2. Copy env root:
   - `cp .env.example .env` (atau buat manual di Windows)
   - Untuk mode demo/judging yang kredibel, set `NEXT_PUBLIC_ENABLE_MOCK_WALLET=false` agar hanya OneWallet yang tampil.
3. Jalankan build semua:
   - `pnpm build`
4. Jalankan lint semua:
   - `pnpm lint`

## Menjalankan Aplikasi

1. Jalankan API:
   - `pnpm dev:api`
2. Jalankan Web:
   - `pnpm dev:web`
3. API default di:
   - `http://localhost:3001`
4. Web default di:
   - `http://localhost:3000`

## Cara Main & Tier Up

Loop main yang dipakai sekarang:

1. Connect `OneWallet` di network `OneChain Testnet`.
2. Jalankan quest di dashboard (`Execute Mission`).
3. Tiap quest punya cooldown 60-180 detik (bukan sekali-seumur hidup).
4. Kumpulkan shards + quest completion.
5. Masuk tab `Wings`, lalu:
   - `Mint Wings` untuk buka Tier 1.
   - `Evolve to Tier 2` butuh `200 shards + 3 quests`.
   - `Evolve to Tier 3` butuh `500 shards + 8 quests`.

Catatan penting:
- Jika tombol bisa ditekan tapi evolve gagal, lihat toast error: sekarang sudah dipetakan ke pesan on-chain yang lebih jelas (cooldown, shard kurang, syarat belum terpenuhi, dll).
- Jika Anda mengubah logic Move (contoh requirement evolve) maka wajib publish ulang package Move dan update:
  - `MOVE_PACKAGE_ID`
  - `NEXT_PUBLIC_PACKAGE_ADDRESS`

## Script Root

- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm build`
- `pnpm build:web`
- `pnpm build:api`
- `pnpm lint`
- `pnpm faucet <WALLET_ADDRESS>`
- `pnpm deploy:move`

Catatan faucet:
- Endpoint default sekarang: `https://faucet-testnet.onelabs.cc:443/v1/gas`
- Bisa override via env root: `ONECHAIN_FAUCET_URL`

## Endpoint API Utama

- `GET /api/health`
- `GET /api/quests`
- `GET /api/users/:address`
- `GET /api/users/:address/activities?limit=20`
- `GET /api/activity?limit=20`
- `GET /api/leaderboard?period=current&limit=10`
- `GET /api/leaderboard/:address?period=current`

Semua endpoint mengembalikan format:

```json
{
  "status": "success",
  "message": "string",
  "data": {}
}
```

## Catatan Move CLI

Validasi Move (`one move build` dan `one move test`) butuh CLI `one`.
Di environment ini validasi Move sudah lolos di WSL:

- `one move build --path move/zeraphim_ascension`
- `one move test --path move/zeraphim_ascension` (6/6 pass)

Catatan: output CLI masih menampilkan note terkait dependency auto-inject (`One/MoveStdlib/OneSystem`) ketika `One` dideklarasikan eksplisit di `Move.toml`, tetapi proses build/test tetap sukses.

## Dokumen

- Arsitektur: `docs/architecture.md`
- Pitch: `docs/pitch.md`
- Demo flow: `docs/demo-script.md`
- Proof template: `docs/proof.md`
- UI asset spec: `docs/ui-asset-spec.md`
