# NoorulQuran — Build Plan

> **Read. Listen. Reflect.**
>
> Tracking file for building the complete NoorulQuran web app per `prompt.md`.
>
> **Workflow rule:** After every completed step — check the box `[x]`, commit, and push to GitHub.

---

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done & pushed

---

## Phase 0 — Project Setup ✅ *(2026-08-24)*

- [x] Scaffold Vite + React + TypeScript project (`noorulquran`) — Vite 8
- [x] Install & configure Tailwind CSS — Tailwind v4 via `@tailwindcss/vite`
- [x] Install Motion/Framer Motion + Lucide icons
- [x] Create folder structure: `src/{components,pages,layouts,hooks,services/quran,data,types,utils,store,styles}`
- [x] Lint + typecheck scripts wired up — `npm run lint` / `npm run typecheck`
- [x] Initial app runs locally — dev server 200 OK; typecheck/lint/build all pass

## Phase 1 — Data Layer (Abstraction First) ✅ *(2026-08-24)*

- [x] Define types: Surah, Ayah, Page, Juz, Hizb, Rub, Ruku, Manzil, Sajdah, Translation, Tafsir, Reciter
- [x] `services/quran/quranProvider.ts` — provider interface (UI never couples to one API)
- [x] `services/quran/alQuranCloudProvider.ts` — Al Quran Cloud API (verified against live API shapes)
- [x] `services/quran/quranFoundationProvider.ts` — Quran.com API (+ paginated verse fetch, count cross-check)
- [x] `services/quran/audioProvider.ts` — islamic.network CDN verse/surah URLs, curated reciter catalog
- [x] `services/quran/translationProvider.ts` + tafsir access methods
- [x] Caching layer: memory TTL + localStorage persistence (`services/http.ts`)
- [x] API keys via env vars only — `.env.example` committed, `.env` gitignored
- [x] Canonical global-ayah math + `surahOfGlobal()` (`src/data/ayahCounts.ts`)
- [x] Embedded-basmala handling for correct canonical verse segmentation (never alters verse text otherwise)
- [x] **REQ:** English + Urdu surah-name meanings via Quran Foundation localized chapters API (`nameTranslationUrdu`)
- [x] **REQ:** Default visible translations = English (en.sahih) + Urdu (ur.jalandhry) together
- [ ] Audio always recites Arabic; EN/UR text layers follow the same active-ayah sync *(implemented in Phase 9 player)*

## Phase 2 — Quran Text Integrity & Validation ✅ *(2026-08-24)*

- [x] Authoritative canonical source wired (Quran Foundation API; Tanzil-lineage) — verbatim, unmodified, checksummed (`src/data/canonical-quran.json` + `canonicalProvider`)
- [x] NO AI-generated/paraphrased/truncated verses anywhere — text enters only via `npm run generate:quran`, guarded by SHA-256
- [x] `npm run validate:quran` dev script (28 checks; `--live` adds dual-API cross-check + CDN HEAD probes)
  - [x] Exactly 114 Surahs, correct ordering
  - [x] Expected ayah counts per surah
  - [x] Correct ayah numbering, no duplicate IDs, no missing ayahs
  - [x] No empty Arabic text / diacritics intact (96.3% verses carry harakat; Uthmani glyphs verified)
  - [x] Valid page mappings & audio references (604 pages covered, monotonic; 6 reciters × 228 ayah URLs)
- [x] Tanzil attribution + license compliance — `src/data/attribution.ts`, README table

## Phase 3 — Design System, Theme & Typography ✅ *(2026-08-24)*

- [x] Global theme controller: Light / Dark / System (localStorage + `prefers-color-scheme`), pre-paint FOUC guard in index.html
- [x] Light palette: warm ivory `#f6f1e7`, white glass `rgba(255,255,255,0.78)`, emerald `#0e7a63`, muted gold `#a07d24`, soft shadows
- [x] Dark palette: deep forest green `#0b1613`, near-black emerald `#07100d`, dark glass `rgba(19,35,29,0.62)`, gold `#d4af37`, cream text `#ede5d3`
- [x] Subtle glassmorphism (`.glass`, `.card`) — never on Quran text surfaces (`.quran-text` is always opaque)
- [x] Quran-compatible Arabic fonts: Amiri Quran (Quran), Amiri (headings), Noto Nastaliq Urdu (UR), Lora Variable (EN translations), Inter Variable (UI)
- [x] Arabic font sizes: small / medium / large via `[data-arabic-size]` + `var(--quran-size)`
- [x] Correct RTL handling (`lang`+`dir` on Arabic/Urdu elements, `.translation-ur` line-height 2.2)
- [x] Peaceful/scholarly aesthetic — ambient radial washes, gold divider accents, no neon/cyberpunk

## Phase 4 — Routes & Pages ✅

- [x] `/` Home — hero (نور القرآن, tagline), Continue Reading, Daily Ayah, explorers, featured recitations, footer
- [x] `/surahs` — all 114 Surah cards (number, Arabic/English names, name meaning, ayah count, revelation, juz info, Play/Read buttons) + search/filter/sort (Arabic + English)
- [x] `/surah/:surahId` — header, Bismillah where appropriate, all ayahs + translations + actions (bookmark, copy, share), smooth transitions
- [x] `/mushaf` + `/mushaf/:page` — page-by-page reader with nav, keyboard controls, fullscreen
- [x] `/juz` + `/juz/:id` — 30 juz, start/end refs, read with translations
- [x] `/search` — Arabic + translation search with debounce
- [x] `/bookmarks` — localStorage bookmarks for ayahs/surahs/pages
- [x] `/daily-ayah` — Arabic, translation, ref, bookmark, share (from real dataset)
- [x] `/tafsir` — clearly separated from Quran/translation/notes
- [x] `/listen` — audio-first browsing with reciter list
- [x] `/plans` — 30-day, 60-day, custom reading plans
- [x] `/settings` — theme, Arabic font size, cache management
- [x] `/sources` — data attribution, integrity statement, font licenses
- [x] `/about` — mission, text integrity, content distinction, technology
- [x] Custom 404 / error page
- [x] App layout — desktop sidebar + mobile bottom nav + slide-out menu
- [x] Reading progress tracking (localStorage)
- [x] Bookmark store (localStorage)
- [x] `useAsyncData` hook for clean async data fetching

## Phase 5 — Interactive Ayah Actions (Every Verse) ✅

- [x] Play / Pause / Replay per ayah (curated reciter audio, toggle state per verse)
- [x] Bookmark / Copy / Share per ayah
- [x] View translation / tafsir / verse info (TafsirModal with Jalalayn, VerseInfoPanel with navigation metadata)
- [x] AudioProvider store (reciter selection, playback state, per-ayah URL)
- [ ] Personal notes (deferred — requires accounts/later)
- [x] Wired per-ayah actions into SurahReader + JuzReader

## Phase 6 — Mushaf Reader (Page-by-Page)

- [ ] Prev/next page navigation, desktop controls
- [ ] Mobile swipe navigation
- [ ] Jump to: page number, surah, juz, ayah
- [ ] Full-screen reading mode
- [ ] Reading progress indicator; last page saved locally
- [ ] Mushaf layout selection (Uthmani / IndoPak / supported layouts)
- [ ] Page boundaries respect selected mushaf edition (not assumed identical)
- [ ] Dark/light aware, highly readable sacred text

## Phase 7 — Search

- [ ] Search across: Arabic text, translations, surah names, ayah references
- [ ] Results: `SurahName 2:255` + Arabic excerpt + translation excerpt + Play/Read actions
- [ ] Empty state + zero-AI-invented-text guarantee
- [ ] Loading/error/debounce handling

## Phase 8 — Personal Features

- [ ] Bookmarks for ayahs/surahs/pages via localStorage (`/bookmarks`)
- [ ] Continue Reading: last surah/ayah/page/juz + % on Home
- [ ] Notes attached to ayahs, explicitly labeled "Personal Note", visually distinct
- [ ] Plans: 30-Day (1 juz/day), 60-Day, custom goal — calm, non-gamified
- [ ] Optional cloud sync path noted for later (auth APIs)

## Phase 9 — Audio Recitation System

- [ ] Persistent bottom audio player across app
- [ ] Playback modes: single ayah, ayah range, whole surah, continuous Quran (cross-surah)
- [ ] Auto-advance ayah → next surah (when enabled)
- [ ] Controls: play/pause, prev/next ayah, seek, volume, repeat ayah/surah, auto-next
- [ ] Speeds: 0.75x / 1x / 1.25x / 1.5x
- [ ] Reciter selector (Alafasy, Abdul Basit, Husary, Ghamdi… — only providers actually supplying them)
- [ ] Active ayah sync: subtle highlight, scroll-into-view, current surah/ayah + total progress shown
- [ ] Respect audio licensing/attribution per source

## Phase 10 — Translations & Tafsir

- [ ] Multiple published translations (English, Urdu, Hindi, Arabic + supported langs), attribution retained
- [ ] No browser auto-retranslation of vetted translations
- [ ] Tafsir view clearly separated from Quran text/translation/notes/AI content

## Phase 11 — Animation & Responsiveness

- [ ] Smooth page/card/nav/modal/search transitions; hover states; audio progress visuals
- [ ] Honor `prefers-reduced-motion`
- [ ] Fully responsive; mobile: swipe mushaf, bottom player, sticky nav, one-handed use, no horizontal scroll
- [ ] Desktop: sidebar nav, large mushaf, persistent player, optional verse-info panel

## Phase 12 — Accessibility

- [ ] Semantic HTML, keyboard navigation, ARIA labels, screen-reader support
- [ ] Focus indicators, high contrast, adjustable font size, RTL support
- [ ] Accessible audio controls

## Phase 13 — PWA

- [ ] Manifest + app icons
- [ ] Service worker + offline app shell
- [ ] Caching strategy that does NOT cache copyrighted audio/translations against license terms

## Phase 14 — Performance & Error States

- [ ] Lazy loading, virtualized long lists, code splitting, API caching, image optimization
- [ ] Efficient audio loading (never bulk-download entire library)
- [ ] Handle every failure: API down, audio unavailable, missing translation, invalid surah/ayah/page, network fail, rate limit, loading skeletons, empty search — always retry options, never blank screens

## Phase 15 — SEO

- [ ] Per-page metadata (Home/Surah/Juz/reader/Search/Resources)
- [ ] OpenGraph + Twitter cards, canonical URLs, sitemap.xml, robots.txt

## Phase 16 — Content Safety & Attribution

- [ ] `/sources` page: Quran text, translations, recitations, tafsir, fonts, APIs, assets
- [ ] Clear visual distinction: Quran ≠ Translation ≠ Tafsir ≠ Hadith ≠ Notes ≠ Educational info
- [ ] No fabricated fatwas / authoritative-sounding AI religious answers

## Phase 17 — README & Docs

- [ ] Logo, description, screenshots, live demo link
- [ ] Features, tech stack, architecture diagram
- [ ] Data/audio sources + attribution + licensing
- [ ] Local dev instructions, env vars, API config
- [ ] Deployment guide, accessibility notes, roadmap, contribution guide

## Phase 18 — Final QA (Gate Before "Complete")

- [ ] All 114 surahs present, every ayah accessible, none missing/generated
- [ ] Mushaf paging, surah reading, juz nav, search all work
- [ ] Single-ayah, surah, continuous playback + active-ayah highlighting work
- [ ] Bookmarks, continue-reading, dark/light, mobile/desktop, RTL, a11y pass
- [ ] Attribution visible; API keys server-side; no secrets committed
- [ ] README complete; production build succeeds
- [ ] `npm run validate:quran` passes clean

---

## Progress Log

| Date | Step | Commit |
|------|------|--------|
| 2026-08-24 | Repo created, build plan committed | `53dde11`, `3f6ed59` |
| 2026-08-24 | Phase 0 — Project Setup complete | scaffold commit (below) |
| 2026-08-24 | Phase 1 — Data Layer complete | `c52ccaf` |
| 2026-08-24 | Phase 2 — Text Integrity & Validation complete (canonical dataset + validate:quran) | `94265be` |
| 2026-08-24 | Phase 3 — Design System, Theme & Typography complete (light/dark/system + fonts + glass) | `7434a40` |
| 2026-08-26 | Phase 4 — Routes & Pages complete (17 routes, layout, home, surahs, surah reader, juz, mushaf, search, bookmarks, daily ayah, tafsir, listen, plans, settings, sources, about, 404) | `e07c551` |
| 2026-08-28 | Phase 5 — Interactive Ayah Actions complete (per-ayah play/pause/replay, tafsir modal, verse info panel, AudioProvider store) | *(below)* |
