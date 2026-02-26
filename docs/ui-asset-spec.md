# UI Asset Specification - Zeraphim Ascension

Dokumen ini adalah spesifikasi lengkap aset visual agar Anda bisa langsung cari/buat desain lalu drop ke project tanpa ubah kode.

## 1) Lokasi dan Integrasi

- Folder ikon utama: `apps/web/public/icons/`
- Slot ikon sudah terhubung di kode: `apps/web/src/lib/assets/iconSlots.ts`
- Komponen pemakai aset (dengan fallback otomatis jika file belum ada):
  - `apps/web/src/components/pages/(dashboard)/ProfilePanel.tsx`
  - `apps/web/src/components/pages/(dashboard)/QuestBoard.tsx`
  - `apps/web/src/components/pages/(dashboard)/WingsCard.tsx`
  - `apps/web/src/components/pages/(dashboard)/LootBoxPanel.tsx`
  - `apps/web/src/components/pages/(dashboard)/DashboardView.tsx`

Catatan:
- Jika file ikon belum tersedia, UI tetap jalan (fallback ke icon bawaan).
- Begitu file Anda ditaruh sesuai nama, otomatis dipakai.

## 2) Daftar Ikon Wajib (Drop-In)

### Core dashboard icons

| File name | Slot key | Dipakai di | Ukuran kanvas |
|---|---|---|---|
| `icon-xp.svg` | `xp` | Experience, XP boost | `24x24` |
| `icon-shard.svg` | `shard` | Shards, loot reward chip | `24x24` |
| `icon-wings.svg` | `wings` | Wings tier, wings header | `24x24` |
| `icon-halo.svg` | `halo` | Dashboard crest/header mark | `24x24` |
| `icon-ticket.svg` | `ticket` | Loot tickets | `24x24` |
| `icon-streak.svg` | `streak` | Streak stat | `24x24` |
| `icon-level.svg` | `level` | Level stat | `24x24` |
| `icon-lootbox.svg` | `lootbox` | Lootbox core icon | `32x32` |

### Quest path icons

| File name | Slot key | Dipakai di | Ukuran kanvas |
|---|---|---|---|
| `icon-path-valor.svg` | `pathValor` | Path of Valor header | `24x24` |
| `icon-path-wisdom.svg` | `pathWisdom` | Path of Wisdom header | `24x24` |
| `icon-path-grace.svg` | `pathGrace` | Path of Grace header | `24x24` |

## 3) Aset Ilustrasi Tema Malaikat/Sayap (High Impact)

Folder rekomendasi: `apps/web/public/assets/`

### Wings progression (sangat disarankan)

| File name | Ukuran | Format | Catatan |
|---|---|---|---|
| `assets/wings/tier-0.svg` | `512x512` | SVG | Essence/awakening state |
| `assets/wings/tier-1.svg` | `512x512` | SVG | Sayap awal (small span) |
| `assets/wings/tier-2.svg` | `512x512` | SVG | Sayap menengah |
| `assets/wings/tier-3.svg` | `512x512` | SVG | Seraphim final form |

### Angelic identity assets

| File name | Ukuran | Format | Catatan |
|---|---|---|---|
| `assets/angel/seraphim-silhouette.svg` | `900x1400` | SVG/PNG | Siluet malaikat utama |
| `assets/angel/halo-ornament.svg` | `512x512` | SVG | Halo detail untuk hero/header |
| `assets/angel/feather-ornament.svg` | `512x512` | SVG | Ornamen feather cluster |

### UI ornaments

| File name | Ukuran | Format | Catatan |
|---|---|---|---|
| `assets/ui/divine-divider.svg` | `1200x48` | SVG | Divider antar section |
| `assets/ui/corner-wing-tl.svg` | `160x160` | SVG | Ornamen sudut top-left |
| `assets/ui/corner-wing-tr.svg` | `160x160` | SVG | Ornamen sudut top-right |
| `assets/ui/corner-wing-bl.svg` | `160x160` | SVG | Ornamen sudut bottom-left |
| `assets/ui/corner-wing-br.svg` | `160x160` | SVG | Ornamen sudut bottom-right |

## 4) Style Guide Visual (Agar Konsisten)

### Direction

- Tema: `Divine sci-fi`, `angelic`, `seraphim`, `sacred-tech`.
- Tone: elegan, high-contrast, mystical, jangan cartoon.

### Warna utama

- Gold core: `#F3C95D`
- Gold deep: `#D7AA3B`
- Pale gold: `#FFD966`
- Base black: `#050505`
- Panel dark: `#120F08`
- Accent white-gold: `#F5EAD0`

### Bentuk dan stroke

- Gunakan bentuk tegas/geometry, selaras dengan panel berpotongan.
- Stroke ikon: `2` atau `2.5` px untuk 24px icon.
- Hindari detail terlalu tipis (<1.5px) agar tetap jelas di ukuran kecil.

### Glow

- Soft outer glow radius kecil-sedang.
- Hindari glow berlebihan yang bikin blur/bleeding.

## 5) Spesifikasi Teknis File

- Format prioritas: `SVG` (vector clean).
- PNG hanya untuk ilustrasi kompleks (transparent background).
- Background ikon: transparan.
- Viewbox ikon 24px: `0 0 24 24`.
- Safe area: sisakan padding visual 8-12% dari tepi kanvas.
- Ukuran file:
  - Ikon SVG: target `< 20 KB`
  - Ilustrasi SVG: target `< 200 KB`
  - PNG hero: target `< 500 KB` (setelah kompres)

## 6) Prompt Siap Pakai (Jika Generate AI)

### Icon prompt template

`minimalist angelic game UI icon, sacred tech style, sharp geometric lines, gold monochrome on transparent background, svg vector style, centered, no text, no background`

### Wings prompt template

`seraphim wings evolution tier [0/1/2/3], divine golden feathers, ethereal sacred-tech style, high detail vector illustration, transparent background, game asset`

### Halo prompt template

`futuristic divine halo emblem, angelic sacred geometry, gold luminous lines, transparent background, icon-ready vector style`

## 7) Checklist Produksi Cepat

- [ ] Semua file di Section 2 selesai
- [ ] Nama file 100% sama dengan tabel
- [ ] SVG bersih (tanpa embedded bitmap)
- [ ] Uji di ukuran kecil (18-24px) tetap terbaca
- [ ] Kompres dengan SVGO
- [ ] Cek kontras di background gelap dashboard

## 8) Status Saat Ini

- Core icon pack sudah terpasang di:
  - `apps/web/public/icons/icon-xp.svg`
  - `apps/web/public/icons/icon-shard.svg`
  - `apps/web/public/icons/icon-wings.svg`
  - `apps/web/public/icons/icon-halo.svg`
  - `apps/web/public/icons/icon-ticket.svg`
  - `apps/web/public/icons/icon-streak.svg`
  - `apps/web/public/icons/icon-level.svg`
  - `apps/web/public/icons/icon-lootbox.svg`
  - `apps/web/public/icons/icon-path-valor.svg`
  - `apps/web/public/icons/icon-path-wisdom.svg`
  - `apps/web/public/icons/icon-path-grace.svg`
- Source pack asli saat ini ada di: `zeraphim_icons_full_pack/`
