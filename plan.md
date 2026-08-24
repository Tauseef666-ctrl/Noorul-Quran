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

## Phase 1 — Data Layer (Abstraction First)

- [ ] Define types: Surah, Ayah, Page, Juz, Hizb, Rub, Ruku, Manzil, Sajdah, Translation, Tafsir, Reciter
- [ ] `services/quran/quranProvider.ts` — provider interface (UI never couples to one API)
- [ ] `services/quran/quranFoundationProvider.ts` — Quran.com / Quran Foundation API
- [ ] `services/quran/alQuranCloudProvider.ts` — Al Quran Cloud API
- [ ] `services/quran/audioProvider.ts` — recitation/audio sources
- [ ] `services/quran/translationProvider.ts` + tafsir access
- [ ] API response caching layer (memory + storage)
- [ ] API keys via env vars, server-side only, nothing committed

## Phase 2 — Quran Text Integrity & Validation

- [ ] Authoritative canonical source wired (Tanzil / Quran Foundation) — verbatim, unmodified
- [ ] NO AI-generated/paraphrased/truncated verses anywhere
- [ ] `npm run validate:quran` dev script
  - [ ] Exactly 114 Surahs, correct ordering
  - [ ] Expected ayah counts per surah
  - [ ] Correct ayah numbering, no duplicate IDs, no missing ayahs
  - [ ] No empty Arabic text / diacritics intact
  - [ ] Valid page mappings & audio references
- [ ] Tanzil attribution + license compliance if used

## Phase 3 — Design System, Theme & Typography

- [ ] Global theme controller: Light / Dark / System (localStorage + `prefers-color-scheme`)
- [ ] Light palette: warm ivory, white glass, emerald, muted gold, soft shadows
- [ ] Dark palette: deep forest green, near-black emerald, dark glass, gold/cream type
- [ ] Subtle glassmorphism (blur, translucent surfaces, thin borders) — never on Quran text itself
- [ ] Quran-compatible Arabic font(s); separate translation typography
- [ ] Arabic font sizes: large / medium / small setting
- [ ] Correct RTL handling throughout
- [ ] Peaceful/scholarly aesthetic — no cyberpunk/neon/gaming vibes

## Phase 4 — Routes & Pages

- [ ] `/` Home — hero (نور القرآن, tagline), Continue Reading, Daily Ayah, explorers, featured recitations, footer
- [ ] `/quran` Main reader hub
- [ ] `/surahs` — all 114 Surah cards (number, Arabic/English names, name meaning, ayah count, revelation, juz info, Play/Read buttons) + search/filter/sort (Arabic + English)
- [ ] `/surah/:surahId` — header, Bismillah where appropriate, all ayahs + translations + audio + actions, smooth transitions
- [ ] `/mushaf` + `/mushaf/:page` — page-by-page reader (see Phase 6)
- [ ] `/juz` + `/juz/:id` — 30 juz, start/end refs, progress, read/play
- [ ] Explore section — Hizb, Rub al-Hizb, Ruku, Manzil, Sajdah verses (reliable data only)
- [ ] `/search` (see Phase 7)
- [ ] `/bookmarks` (see Phase 8)
- [ ] `/daily-ayah` — Arabic, translation, ref, audio, bookmark, share (from real dataset)
- [ ] `/tafsir` — clearly separated from Quran/translation/notes
- [ ] `/listen` Audio-first browsing
- [ ] `/plans` reading plans (see Phase 8)
- [ ] `/settings` theme, fonts, reciter, preferences
- [ ] `/resources`, `/sources`, `/about`
- [ ] Custom 404 / error pages

## Phase 5 — Interactive Ayah Actions (Every Verse)

- [ ] Play / Pause / Replay per ayah
- [ ] Bookmark / Copy / Share per ayah
- [ ] View translation / tafsir / verse info
- [ ] Personal notes (if accounts implemented later)

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
