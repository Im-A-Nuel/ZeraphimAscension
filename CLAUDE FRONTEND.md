# Senior Frontend Engineer - Rules & Guidelines

You are a world-class Senior Frontend Engineer with exceptional expertise in building scalable, high-performance web applications. Your responsibility is to develop features, fix bugs, refactor code, and improve performance strictly according to the rules below.

**Read the task carefully and execute it exactly as instructed. You must strictly follow all rules without exception.**

---

## General Instructions

- Use **pnpm** for all installations and scripts
- Code must follow clean code principles and be highly readable
- Do not write any code comments
- Always create an index file to simplify imports
- Always import through index files to reduce import clutter

---

## Import Structure Rule

**Components must live in:** `src/components/pages/(scope)`
**Index files must live in the same folder**
**Pages must import only from index files**

### Example:

```
landingIndex is imported into → src/app/(landing)/page.tsx
Components are created in → src/components/pages/(landing)
```

---

## Architecture & Code Quality

- Follow **SOLID principles** at all times
- Code structure must be clean, organized, and scalable
- No messy, duplicated, or tightly coupled code
- Optimize for high performance and maintainability
- Types and interfaces must be placed in a dedicated shared types folder, never mixed with business logic
- Use **zustand** for state management and data fetching
- Ensure the website performance is high with efficient, clean logic
- Always make the solution scalable and future-proof
- Always add **lazy loading**
- Always use toast from **sonner** for notifications

---

## UI & UX Rules

- **Never** use emojis
- **Never** use gradients
- **Do not** use colorful designs
- UI and UX must be minimalist, modern, and consistent
- Add `cursor: pointer` where interaction is expected
- Maintain consistent spacing, typography, and layout
- Use professional English copywriting that is clear and easy to understand
- Design must feel modern, clean, and intentional
- Always use `<Image></Image>` for images
- Don't forget to add validation from the response status API indicating error or success

---

## Styling Rules

- Configure global CSS utilities to be reusable
- Example class names: `bg-default`, `bg-main`
- Avoid inline styles unless absolutely necessary
- Keep styling reusable and consistent across the app

---

## Build & Validation

- After finishing the implementation, always run: `pnpm run build`
- Ensure there are no build errors or warnings

---

## Project Overview

**Zeraphim: Ascension** adalah web app GameFi minimalis yang berjalan di OneChain (Move-based) dengan loop utama:

1. User connect wallet (OneWallet)
2. User memilih quest dari 3 path (Valor / Wisdom / Grace)
3. User menjalankan transaksi on-chain untuk `complete_quest`
4. User membuka loot box (`open_lootbox`) dan menerima reward
5. User mint/evolve Wings (`mint_wings` / `evolve_wings`)
6. UI memperbarui profil, activity feed, dan leaderboard

**Key UI principles:** minimal, modern, monochrome, no emoji/gradient, copywriting profesional, interaksi jelas (cursor pointer), dan feedback transaksi via Sonner toast.

---

## Implementation Tasks

### 1. Project Setup & Standards

- Pastikan package manager **pnpm** dipakai untuk semua install & script
- Pastikan Next.js app berjalan (TypeScript)
- Konfigurasi **Sonner** untuk toast global (layout/root)
- Konfigurasi **Zustand** sebagai state management + data fetching (tanpa React Query)
- Konfigurasi global styling utility class (mis. `bg-default`, `bg-main`, dsb) di global CSS
- Pastikan lint/typecheck tidak error, dan build berhasil di akhir

---

### 2. Folder Architecture (wajib sesuai rules)

**Buat struktur FE berikut:**

```
src/app/(landing)/page.tsx
src/app/(dashboard)/page.tsx
src/app/(leaderboard)/page.tsx
src/app/(activity)/page.tsx
src/app/layout.tsx + global providers (sonner)

src/components/pages/(landing)/ + index.ts
src/components/pages/(dashboard)/ + index.ts
src/components/pages/(leaderboard)/ + index.ts
src/components/pages/(activity)/ + index.ts
```

**Import rule enforcement:**

- Semua page (`src/app/.../page.tsx`) hanya import dari `src/components/pages/(scope)/index.ts`
- Semua folder component punya `index.ts` untuk export
- Hindari import langsung file component tanpa index

---

### 3. Shared Types (wajib dipisah)

- Buat folder: `src/types/`
- Buat tipe inti:
  - `UserStats`
  - `Quest`
  - `ActivityItem`
  - `LeaderboardEntry`
  - `ApiResponse<T>` (punya status, message, data)
- Tidak ada type/interface dicampur dengan business logic

---

### 4. Data Layer (Zustand stores + API client)

**API Rules:** selalu validasi `response.status` untuk menentukan success/error, dan tampilkan toast sesuai.

**Buat `src/lib/`:**

- `src/lib/api/` (fetch wrapper + response validation)
- `src/lib/config/` (env access: rpc, package id, api base)

**Buat Zustand stores di `src/stores/`:**

- `useAuthStore` (wallet session state)
- `useUserStore` (profile + stats fetch)
- `useQuestStore` (quest list + selected quest)
- `useLeaderboardStore`
- `useActivityStore`
- `useTxStore` (global tx state: pending/success/error)

**Data fetching:**

- Data fetching dilakukan dari zustand actions (mis. `fetchUserStats`, `fetchQuests`, dll)
- Semua request punya status: idle/loading/success/error
- Semua error tampilkan toast sonner

---

### 5. Lazy Loading (wajib)

- Semua komponen berat (`LootBoxModal`, `LeaderboardTable`, `ActivityList`, dsb) pakai lazy loading (Next dynamic import)
- Pastikan fallback loading state rapi dan minimal

---

### 6. UI Pages & Components (Minimal MVP)

#### **Landing (landing)**

- Komponen: `LandingIndex` (export di index.ts)
- Isi:
  - App title "Zeraphim: Ascension"
  - 1–2 paragraf copy profesional (tanpa emoji)
  - CTA "Connect Wallet"
  - Secondary CTA "View Demo Flow" (scroll/route)
- Pastikan tombol interaktif pakai `cursor: pointer`

#### **Dashboard (dashboard) - CORE**

- Komponen: `DashboardIndex`
- Subcomponents (di folder scope yang sama):
  - `ProfilePanel` (XP, Level, Shards, Tickets, Streak)
  - `QuestBoard` (3 path columns)
  - `QuestCard` (Complete Quest trigger)
  - `WingsCard` (Mint/Evolve)
  - `LootBoxPanel` (Open lootbox)
  - `TxToastHandler` (bridge state tx → sonner toast)
- Setelah tx sukses, trigger refetch stats/leaderboard/activity

#### **Leaderboard (leaderboard)**

- Komponen: `LeaderboardIndex`
- Tampilkan top 10 + highlight current user

#### **Activity (activity)**

- Komponen: `ActivityIndex`
- List activity dari BE/indexer atau fallback client cache

---

### 7. Wallet + Transaction Flow (UI responsibilities)

**Tombol "Complete Quest" memulai flow:**

1. Set pending tx state
2. Lakukan sign & send
3. Jika success: toast success + refresh stores
4. Jika error: toast error (berdasarkan response status/error)

**Tombol "Open Lootbox" flow sama**
**Mint/Evolve wings flow sama**

**Integrasi wallet & tx executor** harus dibuat sebagai service layer (`src/lib/onchain/`) agar SOLID: UI tidak tahu detail tx.

---

### 8. Validation & Error Handling (wajib)

- Semua API response dicek: jika `status !== 'success'` → toast error + set store error
- Semua tx failure menampilkan pesan profesional (tanpa emoji)
- State pending disable button + show loading indicator minimal

---

### 9. Performance & Clean Code (wajib)

- No duplicated logic: gunakan util/shared functions
- Pastikan components kecil, single responsibility
- Hindari rerender berlebihan: selector zustand + memoization seperlunya
- Semua assets gambar pakai `<Image />` (Next Image)

---

### 10. Global Styling Rules (minimalist & reusable)

- Definisikan reusable classes di global CSS:
  - `bg-default`, `bg-main`, `text-default`, `border-default`, `btn-primary`, `btn-secondary`, dll
- Tidak pakai gradient, tidak pakai warna mencolok
- Spacing konsisten (gunakan util Tailwind / util class konsisten)

---

### 11. Build & Validation (wajib terakhir)

- Jalankan: `pnpm run build`
- Pastikan tidak ada error/warning build

---

## Deliverable FE yang Harus Ada di Repo

- Semua page scope punya folder component + index file
- `src/types` lengkap dan dipakai
- `docs/proof.md` bisa diisi nanti (package id + tx links)
- `pnpm run build` sukses