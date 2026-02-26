# **0\) Ringkasan Produk**

**Nama MVP:** Zeraphim Ascension  
 **Track:** GameFi (AI optional sebagai roadmap)  
 **Core Loop (30–60 detik):**

1. Pilih 1 quest dari 3 “Path” → 2\) Complete quest (tx OneChain) → 3\) Dapat XP \+ Shards → 4\) Open Loot Box (tx) → 5\) Evolve Wings NFT (tx) → 6\) Leaderboard update.

**Tujuan MVP hackathon:**

* Ada **gameplay loop nyata** (bukan landing/NFT doang)

* Ada **on-chain state & assets** di OneChain (Move)

* Demo 3 menit mulus, end-to-end

---

# **1\) Scope & MVP Definition**

## **1.1 In-Scope (Wajib)**

### **GameFi**

* Quest board (daily/weekly template)

* Completion on-chain (quest record \+ reward)

* Loot box on-chain (reward random sederhana)

* Wings NFT evolving (tier 1–3)

* Profile: level/XP/shards/streak

* Leaderboard (top 10 \+ posisi user)

### **Integrasi OneChain**

* Deploy Move package

* Minimal 3 transaksi sukses bisa ditunjukkan:

  * complete quest

  * open lootbox

  * mint/evolve wings

## **1.2 Out-of-Scope (Roadmap)**

* Cross-chain

* ZK privacy

* RWA

* AI yield optimizer real (boleh UI stub / “coming soon”)

---

# **2\) User Stories (Core)**

1. **Sebagai user**, saya bisa connect wallet dan membuat profile “Angel”.

2. Saya bisa melihat **Quest Board** dan memilih quest dari “Path” tertentu.

3. Saya bisa menekan “Complete Quest” sehingga terjadi **tx on-chain** dan XP/Shards bertambah.

4. Setelah quest selesai, saya dapat **Loot Ticket** dan bisa **Open Loot Box** (tx) untuk reward acak.

5. Saya bisa **Mint Wings** (sekali) lalu **Evolve Wings** saat syarat terpenuhi (tx).

6. Saya bisa melihat **Leaderboard** dan melihat posisi saya.

7. Saya bisa melihat riwayat aktivitas saya (quest completed / loot opened / wings evolved).

---

# **3\) Rules & Game Design (Agar Seru)**

## **3.1 Paths (3 pilihan biar “game kerasa”)**

* **Valor**: reward shards lebih tinggi, cooldown lebih lama

* **Wisdom**: reward XP lebih tinggi, shards medium

* **Grace**: bonus streak & loot ticket lebih sering

## **3.2 Reward & Progression**

* **XP**: menaikkan level (level \= floor(sqrt(xp/100)) atau threshold table)

* **Divine Shards**: bahan evolve wings

* **Loot Ticket**: didapat ketika quest completed (atau chance 50–100%)

## **3.3 Loot Box (Reward Pool)**

* Common: \+50 shards

* Rare: \+100 shards

* Epic: \+200 shards

* Boost: \+20% XP untuk 1 quest berikutnya (status buff disimpan)

RNG boleh pseudo untuk MVP; tulis “VRF-grade randomness \= roadmap”.

## **3.4 Wings Evolution Rules**

* Mint Wings → Tier 1

* Tier 1 → Tier 2: shards ≥ 200 AND total quest completed ≥ 3

* Tier 2 → Tier 3: shards ≥ 500 AND streak ≥ 2 hari

---

# **4\) Arsitektur Sistem (MVP)**

## **4.1 High-Level**

* **Frontend Web**: UI game loop \+ sign & send tx

* **Move Contracts on OneChain**: quest, lootbox, wings

* **Backend (opsional tapi disarankan)**: indexer \+ leaderboard \+ caching \+ metadata server

**Minimal tanpa BE** masih bisa, tapi leaderboard dan metadata akan berat di FE. Untuk hackathon, BE ringan sangat membantu.

---

# **5\) Smart Contract Requirements (Move / OneChain)**

## **5.1 Package Structure**

`move/zeraphim/sources/`

* `quest.move`

* `lootbox.move`

* `wings.move`

* `config.move` (admin configs, optional)

* `events.move` (struct event, optional)

## **5.2 On-Chain Data Structures**

### **UserState (resource per address)**

* `xp: u64`

* `shards: u64`

* `level: u16` (optional: computed off-chain; tapi lebih enak disimpan)

* `streak_count: u16`

* `last_quest_day: u64` (epoch day)

* `loot_tickets: u64`

* `xp_boost_until: u64` (timestamp, optional)

* `quests_completed_total: u64`

* `wings_tier: u8` (0 jika belum mint)

### **QuestConfig (global)**

* `quest_id: u64`

* `path: u8` (0 Valor, 1 Wisdom, 2 Grace)

* `cooldown_secs: u64`

* `base_xp: u64`

* `base_shards: u64`

* `ticket_chance_bp: u16` (basis point)

Untuk MVP, quest list bisa hardcoded di module agar cepat.

## **5.3 Public Entry Functions (Wajib)**

### **Quest**

* `public entry fun init_user(account: &signer)`

  * membuat `UserState` kalau belum ada

* `public entry fun complete_quest(account: &signer, quest_id: u64)`

  * validasi cooldown per quest (boleh simpel)

  * update XP, Shards, total completed

  * update streak harian

  * tambah loot ticket (fixed atau chance)

  * emit `QuestCompletedEvent`

### **LootBox**

* `public entry fun open_lootbox(account: &signer)`

  * require `loot_tickets > 0`

  * RNG pseudo → menentukan reward

  * update shards/XP/buff

  * decrement ticket

  * emit `LootOpenedEvent`

### **Wings**

* `public entry fun mint_wings(account: &signer)`

  * require `wings_tier == 0`

  * set tier 1

  * emit `WingsMintedEvent`

* `public entry fun evolve_wings(account: &signer)`

  * require tier \>= 1

  * require shards & quest/streak rules

  * deduct shards

  * tier++

  * emit `WingsEvolvedEvent`

## **5.4 Events (Harus ada untuk indexer)**

* `QuestCompletedEvent { user, quest_id, xp_gained, shards_gained, new_xp, new_shards, timestamp }`

* `LootOpenedEvent { user, reward_type, reward_amount, timestamp }`

* `WingsMintedEvent { user, tier, timestamp }`

* `WingsEvolvedEvent { user, from_tier, to_tier, timestamp }`

## **5.5 Admin & Safety (Minimal)**

* `pause` flag optional (kalau sempat)

* config setter restricted ke `admin` address (Access Control sederhana)

## **5.6 Security Requirements**

* Validasi input (quest\_id valid)

* Anti-spam: cooldown atau “1 quest per X detik”

* Hindari overflow (Move aman, tapi tetap hati-hati)

* RNG: jelaskan keterbatasan (pseudo) \+ roadmap VRF

## **5.7 Deliverables Smart Contract**

* Unit tests Move (minimal: init user, complete quest, open lootbox, evolve)

* Deploy script \+ alamat contract \+ tx proof

---

# **6\) Backend Requirements (BE)**

BE disarankan untuk: leaderboard cepat, caching state, dan metadata NFT (kalau diperlukan). MVP bisa BE “tipis”.

## **6.1 Tech Stack (Rekomendasi)**

* Node.js \+ Fastify/Express (ringan)

* PostgreSQL (atau SQLite kalau mau super cepat)

* Redis optional (boleh skip)

## **6.2 Responsibilities**

1. **Indexer**: listen event dari OneChain (QuestCompleted/LootOpened/WingsEvolved)

2. **Leaderboard service**: hitung skor per periode (daily/weekly)

3. **User profile cache**: simpan snapshot user untuk UI cepat

4. **Metadata service** (optional): serve JSON metadata Wings berdasarkan tier

## **6.3 Database Schema (Minimal)**

### **`users`**

* `address` (PK)

* `created_at`

* `last_seen_at`

### **`user_stats`**

* `address` (PK/FK)

* `xp`

* `shards`

* `level`

* `streak`

* `quests_completed_total`

* `wings_tier`

* `updated_at`

### **`activities`**

* `id` (PK)

* `address`

* `type` (QUEST|LOOT|EVOLVE|MINT)

* `tx_hash`

* `payload_json`

* `created_at`

### **`leaderboard_entries`**

* `period` (e.g., `2026-W10` or `2026-02-09`)

* `address`

* `score`

* `rank`

* `updated_at`  
   (Composite unique: `period + address`)

## **6.4 Scoring (Leaderboard)**

* Score \= `xp + (shards * 0.2) + (wings_tier * 200)` (contoh)

* Period: weekly (untuk hackathon lebih enak)

## **6.5 API Spec (REST)**

Base URL: `/api`

### **Health**

* `GET /health` → ok

### **User**

* `GET /users/:address`

  * return cached `user_stats`, wings\_tier, streak

* `GET /users/:address/activities?limit=20`

### **Quests (static)**

* `GET /quests`

  * return list quest template \+ path \+ rewards \+ cooldown

### **Leaderboard**

* `GET /leaderboard?period=current&limit=10`

* `GET /leaderboard/:address?period=current`

  * return rank \+ score

### **NFT Metadata (optional)**

* `GET /nft/wings/:tier`

  * return metadata JSON (name, image, attributes)

## **6.6 Non-Functional BE**

* Rate limiting basic (optional)

* Logging (console ok)

* Deterministic leaderboard update cron (mis. tiap 5 menit)

---

# **7\) Frontend Requirements (FE)**

## **7.1 Tech Stack (Rekomendasi Solo)**

* Next.js (atau React+Vite)

* Tailwind UI

* OneChain wallet adapter/SDK (sesuai ekosistem OneChain)

* State: Zustand/Redux kecil (atau React Query)

## **7.2 Pages & Components**

### **Pages**

1. `/` Landing

   * CTA Connect Wallet

   * “How it works” 3 steps

2. `/dashboard`

   * Profile card: level, XP bar, shards

   * Wings card: tier, evolve button, mint button

   * Quest board: 3 path columns \+ quest cards

   * Loot box section: ticket count \+ open button

3. `/leaderboard`

   * Top 10 \+ highlight user position

4. `/activity`

   * list event terbaru (quest, loot, evolve)

5. `/docs` (optional)

   * quick guide \+ proof link (untuk judge)

### **Core Components**

* `WalletConnectButton`

* `ProfilePanel`

* `XPProgressBar` (animated)

* `WingsCard` (tier \+ glow effect)

* `QuestCard` (path badge \+ reward preview)

* `LootBoxModal` (shake → reveal)

* `TxToast` (pending/success/error)

* `LeaderboardTable`

## **7.3 FE State & Data Flow**

* On load dashboard:

  * fetch BE `/users/:address` (cache)

  * fetch `/leaderboard` (top)

  * fetch `/quests` (templates)

* On action (complete/open/evolve):

  * sign & send tx → show pending toast

  * on success: optimistic update UI \+ refetch user stats & leaderboard

## **7.4 Tx Flows (Wajib jelas)**

1. **Complete Quest**

* call Move entry: `complete_quest(quest_id)`

* UI: disable button during pending

* On success: show “XP \+ shards gained”

2. **Open Lootbox**

* call `open_lootbox()`

* UI: open modal animation

* On success: reveal reward

3. **Mint/Evolve Wings**

* call `mint_wings()` sekali

* call `evolve_wings()` jika syarat terpenuhi

## **7.5 Non-Functional FE**

* Mobile-friendly

* Error states jelas (insufficient tickets/shards/cooldown)

* No blank screen: skeleton loading

---

# **8\) Testing Requirements**

## **Smart Contract (Move)**

* Unit test:

  * init\_user membuat state

  * complete quest menaikkan xp/shards \+ ticket

  * open lootbox mengurangi ticket \+ memberikan reward

  * evolve wings validasi syarat & tier naik

* Negative tests:

  * open lootbox tanpa ticket gagal

  * evolve tanpa shards gagal

  * mint wings dua kali gagal

## **Backend**

* Indexer parsing event benar

* Leaderboard compute konsisten

## **Frontend**

* Wallet connect

* Tx pending/success flow

* UI update setelah tx

---

# **9\) Deployment Requirements (Hackathon-ready)**

## **Smart Contract**

* Deploy ke OneChain (testnet atau network hackathon)

* Simpan:

  * package/module address

  * 3 tx hash (quest, loot, evolve)

* Buat `docs/proof.md` berisi link explorer \+ screenshot

## **Frontend**

* Deploy Vercel/Netlify

* Environment:

  * `NEXT_PUBLIC_NETWORK`

  * `NEXT_PUBLIC_PACKAGE_ADDRESS`

  * `NEXT_PUBLIC_API_URL`

## **Backend (optional)**

* Deploy Render/Fly.io/Railway

* DB managed atau SQLite file (tergantung waktu)

---

# **10\) Definition of Done (DoD) MVP**

MVP dianggap selesai bila:

1. User bisa connect wallet dan melihat dashboard

2. User bisa **complete quest** (tx sukses)

3. User bisa **open lootbox** (tx sukses)

4. User bisa **mint/evolve wings** (tx sukses)

5. Leaderboard menampilkan top 10 dan posisi user (dari event)

6. README punya:

   * cara run FE/BE

   * cara deploy Move

   * proof tx links \+ screenshots

7. Demo video 3 menit bisa mengikuti flow di atas

---

# **11\) Backlog Implementasi (Prioritas Solo)**

**P0 (harus jadi)**

* Move: init\_user, complete\_quest, open\_lootbox, mint/evolve wings \+ events

* FE: dashboard \+ tx flows \+ loot modal basic

* Proof: explorer links \+ screenshot

**P1 (bagus untuk menang)**

* Leaderboard via BE indexer

* Animasi UI (xp bar, loot box shake, wings glow)

* Streak mechanic

**P2 (kalau sempat)**

* Metadata server untuk wings tier image

* Mini quest rotation harian

* “AI quest suggestion” (rule-based) di UI

## Struktur repo

## **✅ Struktur Monorepo Final (Fix)**

**`zeraphim-ascension/`**  
  **`README.md`**  
  **`LICENSE`**  
  **`.gitignore`**  
  **`.env.example`**

  **`docs/`**  
    **`pitch.md`**  
    **`demo-script.md`**  
    **`proof.md`**  
    **`architecture.md`**

  **`apps/`**  
    **`web/                      # FRONTEND`**  
      **`src/`**  
        **`app/ or pages/`**  
        **`components/`**  
        **`lib/`**  
        **`hooks/`**  
        **`styles/`**  
      **`public/`**  
      **`.env.example`**  
      **`package.json`**  
      **`tsconfig.json`**  
      **`README.md`**

  **`services/`**  
    **`api/                      # BACKEND (disarankan, ringan)`**  
      **`src/`**  
        **`index.ts`**  
        **`routes/`**  
          **`quests.ts`**  
          **`users.ts`**  
          **`leaderboard.ts`**  
        **`indexer/`**  
          **`onchain-listener.ts`**  
        **`db/`**  
          **`schema.sql (atau prisma/)`**  
      **`.env.example`**  
      **`package.json`**  
      **`README.md`**

  **`move/`**  
    **`zeraphim_ascension/       # SMART CONTRACT (Move - WAJIB)`**  
      **`Move.toml`**  
      **`sources/`**  
        **`quest.move`**  
        **`lootbox.move`**  
        **`wings.move`**  
        **`config.move           # optional`**  
      **`tests/`**  
        **`quest_test.move`**  
        **`lootbox_test.move`**  
        **`wings_test.move`**  
      **`README.md`**

  **`scripts/`**  
    **`faucet.ts                 # request OCT testnet (TypeScript)`**  
    **`deploy-move.sh            # one move build + publish + print package id`**  
    **`set-package-id.ts         # tulis PACKAGE_ID ke env FE/BE (opsional)`**

---

## **🔥 Catatan penting (biar “fix” beneran)**

* **Core hackathon \= folder `move/` \+ tx proof (ini yang judge cari).**

* **`services/api` boleh kamu skip kalau mepet, tapi kalau kamu sanggup, leaderboard jadi jauh lebih “berasa produk”.**

* **`docs/proof.md` wajib berisi:**

  * **PACKAGE\_ID**

  * **3 tx link: complete quest, open lootbox, evolve wings**

  * **screenshot UI \+ explorer**

