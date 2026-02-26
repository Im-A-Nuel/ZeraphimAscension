# Asset List - Zeraphim: Ascension

## 🎨 Asset yang Dibutuhkan untuk UI/UX yang WOW

### 1. **Wings Evolution Assets** (Priority: CRITICAL)
**Folder**: `public/assets/wings/`

- `wings-tier-0.svg` atau `.png` (512x512)
  - Wings belum terbentuk / embryo / spiritual essence
  - Style: Abstract glow, particle form, soft golden outline

- `wings-tier-1.svg` atau `.png` (512x512)
  - Wings tahap awal, small, feather baru tumbuh
  - Style: Simple 2-3 feather pairs, soft glow, golden white

- `wings-tier-2.svg` atau `.png` (512x512)
  - Wings menengah, full spread, detail feather
  - Style: 6-8 feather pairs, glowing edges, ethereal aura

- `wings-tier-3.svg` atau `.png` (512x512)
  - Wings maksimal, majestic, divine form
  - Style: Multiple layers, radiant halo effect, divine light rays

**Gunakan di**:
- Dashboard profile preview
- Wings evolution modal
- Leaderboard user badges
- Quest completion rewards screen

---

### 2. **Quest Path Icons** (Priority: HIGH)
**Folder**: `public/assets/quests/`

- `path-valor.svg` (256x256)
  - Icon: Crossed swords atau shield
  - Color scheme: Red-orange gradient (#E94B3C → #F4A460)
  - Style: Bold, geometric, warrior theme

- `path-wisdom.svg` (256x256)
  - Icon: Open book atau scroll with runes
  - Color scheme: Blue-cyan gradient (#4B9EE9 → #60D4F4)
  - Style: Mystical symbols, ancient text

- `path-grace.svg` (256x256)
  - Icon: Heart with wings atau lotus
  - Color scheme: Purple-pink gradient (#B34BE9 → #E960F4)
  - Style: Flowing curves, divine compassion

**Gunakan di**:
- Quest selection cards
- Quest board categories
- User profile path badge
- Leaderboard path indicators

---

### 3. **Divine UI Elements** (Priority: HIGH)
**Folder**: `public/assets/ui/`

- `halo-top.svg` (800x200)
  - Golden halo arc untuk header decorations
  - Animated glow compatible (export dengan opacity layers)

- `divine-separator.svg` (600x20)
  - Horizontal divider dengan wing motif
  - Gunakan di antara sections

- `corner-ornament.svg` (120x120)
  - Angular ornament untuk card corners (4 variations: TL, TR, BL, BR)
  - Divine geometric pattern

- `particle-star.svg` (32x32)
  - Small star/sparkle untuk particle effects
  - Export dalam 3 size: small (16px), medium (32px), large (64px)

**Gunakan di**:
- Section headers
- Card decorations
- Loading states
- Transition effects

---

### 4. **Lootbox Visuals** (Priority: MEDIUM)
**Folder**: `public/assets/lootbox/`

- `lootbox-closed.svg` (400x400)
  - Chest atau divine container tertutup
  - Golden lock detail, ethereal glow

- `lootbox-opening.svg` (400x400)
  - Animation frame: chest opening dengan light burst
  - Export as sprite sheet (5 frames) atau individual frames

- `lootbox-rewards-bg.svg` (600x400)
  - Background untuk reward reveal screen
  - Divine light rays, particle effects

**Gunakan di**:
- Lootbox open modal
- Inventory preview
- Reward animation sequence

---

### 5. **Character/Avatar Silhouettes** (Priority: MEDIUM)
**Folder**: `public/assets/characters/`

- `avatar-placeholder.svg` (256x256)
  - Generic angel silhouette dengan wings outline
  - Gunakan untuk user yang belum set avatar

- `seraphim-silhouette.svg` (512x512)
  - Full body seraphim figure dengan wings
  - Background untuk hero section atau about page

**Gunakan di**:
- User profile default avatar
- Landing page hero decoration
- Loading screen

---

### 6. **Background Textures** (Priority: LOW)
**Folder**: `public/assets/backgrounds/`

- `divine-texture.png` (1920x1080)
  - Subtle texture overlay: clouds, ethereal mist
  - Low opacity (10-20%), tileable

- `starfield.png` (2048x2048)
  - Scattered stars, distant galaxies
  - Tileable, untuk deep space background

**Gunakan di**:
- Page backgrounds (overlay)
- Section backgrounds

---

### 7. **Quest Completion Badges** (Priority: MEDIUM)
**Folder**: `public/assets/badges/`

- `quest-complete-valor.svg` (128x128)
- `quest-complete-wisdom.svg` (128x128)
- `quest-complete-grace.svg` (128x128)
  - Circular badge dengan path icon + checkmark
  - Glow effect

- `streak-badge.svg` (128x128)
  - Fire icon atau lightning untuk streak bonus
  - Animated glow version

**Gunakan di**:
- Quest completion notification
- User achievement panel
- Leaderboard badges

---

### 8. **Icon Set** (Priority: HIGH)
**Folder**: `public/icons/`

Yang sudah ada:
- `icon.svg` (Zeraphim logo) ✅

Yang perlu ditambahkan:
- `icon-xp.svg` (32x32) - Experience point icon
- `icon-shard.svg` (32x32) - Crystal shard icon
- `icon-ticket.svg` (32x32) - Loot ticket icon
- `icon-level.svg` (32x32) - Level up icon
- `icon-leaderboard.svg` (32x32) - Trophy/ranking icon
- `icon-wallet.svg` (32x32) - Wallet connection icon

**Gunakan di**:
- Dashboard stats cards
- Navigation menu
- Buttons
- Tooltips

---

## 📐 Design Guidelines

### Color Palette (Zeraphim Divine Theme)
```css
Primary Gold:    #EAA635, #F1CE7A, #FAD889
Secondary Blue:  #A4BFD9, #164191
Accent Purple:   #B34BE9, #E960F4
Background Dark: #050505, #0A0A0A, #121212
Text Light:      #FAF6E1, #F5E0A0, #E8D9B8
```

### Style Requirements
- **Vector format preferred**: SVG untuk scalability
- **PNG with transparency**: Untuk complex illustrations (512x512 minimum, 1024x1024 optimal)
- **Consistent line weight**: 2-3px untuk outline
- **Glow effects**: Export dengan soft edges, compatible dengan CSS filters
- **Angular shapes**: Polygon/hexagon untuk divine geometric theme
- **Feather details**: Organic curves untuk wings, subtle gradients

---

## 🎯 Impact Priority untuk Hackathon Win

### Must Have (Implement First):
1. **Wings Tier Visuals** - Core gameplay identity
2. **Quest Path Icons** - Clear user journey
3. **Icon Set** - Professional UI polish

### Should Have (High Impact):
4. **Divine UI Elements** - Visual coherence
5. **Lootbox Visuals** - Engagement boost
6. **Quest Badges** - Achievement feedback

### Nice to Have (Polish):
7. **Character Silhouettes** - Brand personality
8. **Background Textures** - Depth & atmosphere

---

## 🛠️ Tools untuk Generate Assets (Jika Solo)

Jika Anda solo dev dan perlu generate cepat:

1. **Midjourney / DALL-E 3**:
   - Prompt: "divine angel wings tier 3, golden feathers, ethereal glow, vector art style, transparent background, game asset, 4k"
   - Prompt: "crossed swords icon, valor path, red orange gradient, game UI asset, minimalist, vector"

2. **Figma + Community Plugins**:
   - Iconify plugin untuk base icons
   - Glassmorphism plugin untuk glow effects
   - Export as SVG

3. **Canva Pro**:
   - Background remover untuk transparency
   - Template untuk badges & icons

4. **Free Resources**:
   - Flaticon.com (basic shapes, edit dengan Figma)
   - Freepik.com (wings, angels illustrations)
   - Unsplash.com (texture overlays)

---

## 📂 Folder Structure (Final)

```
public/
├── assets/
│   ├── wings/
│   │   ├── tier-0.svg
│   │   ├── tier-1.svg
│   │   ├── tier-2.svg
│   │   └── tier-3.svg
│   ├── quests/
│   │   ├── path-valor.svg
│   │   ├── path-wisdom.svg
│   │   └── path-grace.svg
│   ├── ui/
│   │   ├── halo-top.svg
│   │   ├── divine-separator.svg
│   │   ├── corner-ornament-tl.svg
│   │   └── particle-star.svg
│   ├── lootbox/
│   │   ├── closed.svg
│   │   ├── opening-frame-1.svg
│   │   └── rewards-bg.svg
│   ├── characters/
│   │   └── avatar-placeholder.svg
│   ├── backgrounds/
│   │   └── divine-texture.png
│   └── badges/
│       ├── quest-valor.svg
│       ├── quest-wisdom.svg
│       ├── quest-grace.svg
│       └── streak.svg
└── icons/
    ├── icon.svg (existing)
    ├── icon-xp.svg
    ├── icon-shard.svg
    ├── icon-ticket.svg
    └── icon-wallet.svg
```

---

## ✅ Implementation Checklist

- [ ] Create asset folders
- [ ] Generate/source Wings tier 0-3
- [ ] Generate Quest path icons (3)
- [ ] Generate core icon set (6 icons)
- [ ] Create divine UI elements (halo, separators)
- [ ] Design lootbox visuals
- [ ] Integrate assets into components
- [ ] Add lazy loading for images
- [ ] Optimize file sizes (SVGO, TinyPNG)
- [ ] Test on mobile devices

---

**Priority Order untuk Demo**:
Wings → Quest Icons → Core Icons → UI Elements → Lootbox → Badges
