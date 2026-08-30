# NoorulQuran — Build Plan

> **Read. Listen. Reflect.**
>
> Tracking file for building the complete NoorulQuran web app per `prompt.md`.
>
> **Workflow rule:** After every completed step — check the box `[x]`, commit, and push to GitHub.
>
> **Current direction (2026-08-29):** `prompt.md` restructured → Premium UI/UX Upgrade.
> Visual identity = *Luxury Islamic + Deep Black + Emerald + Subtle Gold + Frosted Glass + Cinematic Motion*.
> Never cyberpunk / hacker / neon / gaming HUD. Priority: Quran → readability → accessibility → performance → aesthetics → animation. Phase 10 delivered (`17f2ab6` → `4e16f2b`); remaining: 10.11 nav toggle, 10.6 mobile touch states, 10.15 reduced-motion & low-end tuning. Phase 11 delivered (`634434d` → `28d200c`): translations catalogue + persisted selection, dynamic translation rendering, Arabic tafsir fix + selector + hard safety guard, attribution, content-safety guardrails. Phase 12 delivered (`cb7ecbd` → `32841b4`): skip link + landmarks + modal focus trap + per-route titles, slider focus/reduced-motion/contrast, adjustable UI text size, bidi isolation, accessible audio announcements. Remaining follow-up: 12.4 mirrored-UI RTL layout. Phase 13 delivered (`c653599` → `f8a9b0d`): PWA manifest + generated icon suite, license-safe offline service worker, honest About copy. Now working on **Phase 14 — Performance & Error States**.

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
- [x] Audio always recites Arabic; EN/UR text layers follow the same active-ayah sync *(implemented in Phase 9 player)*

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
- [x] Personal notes, device-only, explicitly labeled "Personal Note", cloud-sync path noted (implemented in Phase 8 — `/notes`, NoteModal, per-ayah blocks)
- [x] Wired per-ayah actions into SurahReader + JuzReader

## Phase 6 — Mushaf Reader (Page-by-Page) ✅

- [x] Prev/next page navigation (desktop buttons, keyboard arrows, bottom nav, fullscreen toolbar)
- [x] Mobile swipe navigation (RTL-aware)
- [x] Jump to: page number, surah, juz, ayah (`JumpToDialog` with tabs, powered by bundled page index)
- [x] Full-screen reading mode (dedicated toolbar, arrows, Escape/F to exit)
- [x] Reading progress bar (page X/604); last page auto-saved and restored on `/mushaf`
- [x] Mushaf layout selection (Uthmani / Imlaei; only layouts the active provider supports, persisted to localStorage)
- [x] Page boundaries respect selected mushaf edition — provider fetches with `{ mushaf: layout }`, so each edition's own page mapping is used; jump index is the canonical 604-page reference
- [x] Dark/light aware, highly readable sacred text (existing design tokens)

## Phase 7 — Search ✅

- [x] Search across: Arabic text (offline canonical corpus, tashkeel-insensitive), translations (provider), surah names (Arabic/transliterated/meaning), and exact ayah references (`2:255`, `2 255`)
- [x] Results: `SurahName 2:255` + Arabic excerpt + translation excerpt + Play/Read actions, plus surah-name cards
- [x] Empty state + zero-AI-invented-text guarantee (every hit verbatim from bundled dataset or public API)
- [x] Mode tabs: All / Arabic (offline) / Translation (provider); reference queries always resolve locally
- [x] Diacritic-neutral Arabic matching (alef/hamza/wasla/ta-marbuta folding)
- [x] Loading/error/debounce handling

## Phase 8 — Personal Features ✅

- [x] Bookmarks for ayahs/surahs/pages via localStorage (`/bookmarks`)
- [x] Continue Reading: last surah/ayah/page/juz + % on Home
- [x] Notes attached to ayahs, explicitly labeled "Personal Note", visually distinct (`/notes`, NoteModal, per-ayah note button + inline blocks in surah & juz readers)
- [x] Plans: 30-Day (1 juz/day), 60-Day, custom goal — calm, non-gamified (persisted, gentle day tracking + progress bar)
- [x] Optional cloud sync path noted for later (auth APIs) — device-only note surfaced in UI + plan

## Phase 9 — Audio Recitation System

- [x] Persistent bottom audio player across app (queue engine + `AudioPlayer`, mobile/dark-aware)
- [x] Playback modes: single ayah, ayah range, whole surah, continuous Quran (cross-surah)
- [x] Auto-advance ayah → next surah (when enabled)
- [x] Controls: play/pause, prev/next ayah, seek, volume, repeat ayah/surah, auto-next
- [x] Speeds: 0.75x / 1x / 1.25x / 1.5x
- [x] Reciter selector (Alafasy, Abdul Basit, Husary, Minshawi, Shaatree, Hudhaify — only providers actually supplying them)
- [x] Active ayah sync: subtle highlight, scroll-into-view, current surah/ayah + total progress shown
- [x] Respect audio licensing/attribution per source (islamic.network CDN, on-demand, no bulk cache)

## Phase 10 — Premium UI/UX Upgrade (Luxury Glass + Cinematic Motion)

> Supersedes the former "Animation & Responsiveness" phase. Built directly from `prompt.md` §1–§35.
> Identity: **Luxury Islamic + Deep Black + Emerald + Subtle Gold + Frosted Glass + Cinematic Motion**,
> meditative and respectful. Gold is an accent, never dominant. The Quran stays the brightest element.

### 10.1 Visual identity & dual themes *(prompt §1, §22, §23, §24)*
- [ ] Dark-first core: deep black (`#050807`-style), near-black charcoal, very dark emerald; subtle black→emerald radial gradients behind major sections; never pure flat black; never distract from Quran text
- [ ] Restrained accents: emerald + deep green primary, muted gold secondary (accent only), warm ivory + soft white text — no bright neon green, no excessive glow
- [ ] Complete light-mode redesign (NOT inverted colors): ivory background, white glass, emerald text/accent, muted gold, soft gray, warm shadows; full contrast pass
- [ ] Animated theme switch: soft cross-fade of background/glass/text; no white flash when switching to dark; system preference respected by default (keep pre-paint FOUC guard)

### 10.2 Glassmorphism design system *(prompt §2)*
- [ ] Four glass levels app-wide: Glass 1 navigation (very transparent) · Glass 2 cards (medium) · Glass 3 important controls (slightly stronger) · Glass 4 modals (maximum readability)
- [ ] Consistent glass recipe: translucent background + backdrop blur/saturation + subtle translucent border + soft depth shadow + faint inner highlight
- [ ] Quran text surfaces stay opaque — never blurred or dimmed behind glass

### 10.3 Animated background, geometry & loading states *(prompt §3, §4, §25, §26)*
- [ ] Meditative animated background: slow gradient drift, soft light diffusion, extremely subtle floating particles, slow ambient glow — "felt, not noticed"; GPU-friendly, rAF-throttled, paused under `prefers-reduced-motion`
- [ ] Islamic geometric pattern component (very low opacity): hero background, section separators, empty states, footer decoration, loading screen; never interferes with Quran text
- [ ] Quran-inspired loading screen: نور القرآن · "Loading Quran..." with subtle geometric animation — short, never a long splash
- [ ] Glass skeleton loaders that softly pulse (replace raw placeholder blocks across pages)

### 10.4 Animation design system *(prompt §28, §5, §7)*
- [x] Central reusable variant library — `src/animations/`: pageTransition, fadeIn, fadeUp, fadeScale, staggerContainer, cardHover, modalEnter, drawerEnter, audioPulse, activeAyah, themeTransition
- [x] Consume system variants everywhere — one coherent motion language, no ad-hoc per-component animation
- [x] Route transitions app-wide: fade + slight vertical movement + progressive content reveal, ~250–600ms, never long
- [x] Viewport-entry reveals: fade + translate + subtle scale 0.97→1, blur→sharp; ordered heading → description → staggered cards → ambient glow
- [x] Staggered card entrances on grids (Surahs, Juz/Explore, Bookmarks, Notes, Search results)

### 10.5 Home cinematic hero *(prompt §6)*
- [x] Staged hero on first load — never simultaneous: background fades in → Islamic pattern appears → logo → heading fades upward → subtitle → CTA buttons → ambient glow drifts behind content
- [x] Layout: نور القرآن / NoorulQuran / "Read. Listen. Reflect." / [Read Quran] [Listen] → then "Explore the Quran" section below

### 10.6 Surah & Ayah cards *(prompt §8, §9)*
- [x] Surah card premium hover: glass brightens, border appears, card lifts, faint emerald/gold glow, Arabic title micro-move, play button activates — smooth, never abrupt
- [ ] Mobile: replace hover with touch-friendly pressed/active states
- [x] Ayah card elegance: clean surface (# + 🔖 + ⋮ · Arabic · translation · ▶ Play); selected = border softly illuminates, background lightens, audio indicator shows, subtle animated highlight
- [x] NEVER animate the Arabic text itself

### 10.7 Audio playback & active-ayah visuals *(prompt §10)*
- [x] Restrained waveform/equalizer indicator on the active play control while reciting (subtle, non-music-player)
- [x] Active-ayah lifecycle: previous ayah smoothly reverts to normal, new ayah activates, reader scrolls smoothly to it (extends Phase 9 sync)

### 10.8 Mushaf reader & page-turn animation *(prompt §11, §12)*
- [x] Distinct centered Mushaf reading surface: readable Quran page as the focus; surrounding UI stays dark glass
- [x] Page-turn animation: desktop subtle slide + fade; mobile horizontal swipe; NO heavy 3D book — performance beats effects

### 10.9 Focus Reading mode *(prompt §13)*
- [x] Full-screen Focus Reading: navigation/sidebar/chrome disappear, background darkens further, Quran content primary, audio controls stay reachable, minimal controls appear on tap/click
- [x] Enter = smooth fade + scale; exit = reverse animation

### 10.10 Floating glass audio player *(prompt §14)*
- [x] Player upgraded to floating glass: blur + rounded corners + subtle border + shadow; smooth expand/collapse
- [x] Collapsed: minimal pill (▶ + now-playing); expanded: full controls (track, seek, prev/next, volume, speed, repeat/auto-next) with animated transition between states

### 10.11 Navigation & mobile menu *(prompt §15, §16)*
- [ ] Desktop: floating glass sidebar, active item gets subtle emerald/gold indicator
- [ ] Mobile: glass bottom navigation or animated glass drawer; bottom audio player stays reachable above it
- [ ] Menu behavior: glass panel slides in → backdrop darkens → items stagger in; closing reverses it; no abrupt `display:none` transitions

### 10.12 Search & micro-interactions *(prompt §17, §18, §27)*
- [x] Search bar expands elegantly (icon → full field); results stagger in; matched text subtly highlighted
- [x] Bookmark feedback: immediate response, small scale pop, icon transitions, tiny glow (optional restrained ripple)
- [x] Consistent micro-interactions: buttons hover/press/focus; cards hover/active; inputs focus-glow; dialogs fade+scale; dropdowns slide/fade; tooltips subtle fade

### 10.13 Daily Ayah & Juz/Explore showcase *(prompt §19, §20)*
- [x] Daily Ayah = signature component: large Arabic typography, glass surface, subtle geometric background, soft emerald illumination, gold detail, audio + bookmark actions
- [x] Daily Ayah staged load: background → card → Arabic → translation → actions
- [x] Juz / Explore: animated grid, cards stagger in, subtle lift on hover/tap

### 10.14 Journey stats & footer *(prompt §21, §32)*
- [x] "Your Quran Journey" indicators (surahs explored / reading progress / current juz): bars animate on viewport entry — elegant, NOT game XP bars
- [x] Large elegant footer: NoorulQuran · "Read. Listen. Reflect." · links (Quran, Listen, Explore, Resources, Sources, About) · Data & attribution · GitHub link · subtle geometric pattern

### 10.15 Performance, accessibility & responsiveness *(prompt §29, §30, §31)*
- [x] Animate only transform + opacity (GPU-friendly composited properties); no expensive continuous animations; ambience rAF-throttled
- [ ] Honor `prefers-reduced-motion`: disable decorative animations, keep essential state transitions, navigation, and audio highlighting functional
- [x] Maintain accessibility: keyboard nav, visible focus (global focus-visible ring), readable contrast, screen-reader support, RTL, adjustable font size
- [x] Responsive animation scaling: spacious desktop, moderate tablet, short + light mobile — never lag on low-end devices
- [x] Mobile ergonomics: swipe mushaf, bottom player, sticky bottom nav, one-handed use, no horizontal scroll · Desktop: floating glass sidebar, large mushaf, persistent player, verse-info panel available

### 10.16 Final cohesion audit *(prompt §33, §34, §35)*
- [x] Full walk of every surface (Home, Surahs, Reader, Mushaf, Juz, Listen, Search, Tafsir, Bookmarks, Daily Ayah, Plans, Settings, Resources, About, Error) + loading states, modals, navigation, audio player — one cohesive premium identity
- [x] Absolute-rules audit: no cyberpunk / hacker UI / neon text / gaming HUD / excessive particles / excessive glow / flashing / animated Quranic letters / distracting 3D / parallax abuse / AI-generated or fake Quran content

## Phase 11 — Translations & Tafsir

> Builds on the existing alQuran.cloud plumbing. Every edition is a *published* translation/tafsir from the
> Al Quran Cloud catalogue — vetted, never machine-paraphrased, always attributed. Browser auto-translation
> of vetted content is suppressed with explicit `lang`/`dir` + `translate="no"`.

### 11.1 Translation catalogue & persisted selection
- [ ] Expanded edition catalogue (`translationProvider.ts`): English (Saheeh International, Muhammad Asad, Pickthall), Urdu (Jalandhry), Hindi (Farooq), Arabic (Al-Muyassar) — every entry a real Al Quran Cloud edition with name + translator metadata
- [ ] Persisted selection store (`src/store/translations.tsx`, localStorage `nq:translations`) mounted app-wide; default = English (Saheeh International) + Urdu (Jalandhry); gracefully falls back if a stored id is unknown
- [ ] Settings → Translations: selectable cards grouped by language, translator names visible, toggle on/off per edition (min one active)

### 11.2 Dynamic translation rendering
- [ ] Shared `AyahTranslations` component: renders each *active* edition with the right `lang`/`dir` + typography + `translate="no"`, with a single skeleton line while data is loading
- [ ] Readers (Surah + Juz) and Daily Ayah fetch exactly the active editions — no hard-coded `en.sahih`/`ur.jalandhry` keys; stale edition text cleared when selection changes
- [ ] Home Daily Ayah shows the primary (first) active edition
- [ ] Per-language typography classes: `.translation-en / -ur / -hi / -ar` (Nastaliq Urdu, Amiri Arabic, system Devanagari); Mushaf stays Arabic-only by design
- [ ] Reader headers show an attribution caption with the active translators' names

### 11.3 Tafsir fixes & edition selector
- [x] `TafsirModal` no longer gate-kept by provider capabilities — fetch from alQuran.cloud directly (same pattern as translations); Arabic tafsir default `ar.muyassar`, edition `<select>` fed by live `getTafsirs()` with static catalogue fallback
- [x] Standalone `/tafsir` page gets the same edition selector + attribution line
- [x] Safety: `getTafsir` rejects any edition the API is not actually serving as commentary (`type !== 'tafsir'`) — historically advertised English tafsirs now silently return Quran text, so only the published Arabic tafsir editions (Al-Muyassar, Jalalayn, Al-Qurtubi, Al-Waseet, Al-Baghawi, Tanwir al-Miqbas) are offered; choice persisted (`nq:tafsir`)
- [x] Tafsir separation: rendered in its own surface with explicit "commentary, not Quranic text" line in both modal and page; `translate="no"` + edition `lang`/`dir`; never styled as Quran glyphs

### 11.4 Attribution & sources
- [x] `attribution.ts`: dedicated `tafsir`-kind data-source row (naming the six published Arabic tafsir editions + safety note) and translation-editions note naming the in-use translators (Saheeh International, Fateh Muhammad Jalandhry, catalogue of 20); `/sources` tafsir filter auto-populated via `kind`
- [x] Footer + About copy updated to name the translators & tafsirs in use

### 11.5 Content-safety guardrails
- [x] Explicit `lang` + `dir` + `translate="no"` on every Arabic surface (Quran ayahs in readers/Daily/Home/Mushaf, bismillah, surah names, brand wordmark) and on every translation & tafsir paragraph — no browser auto-retranslation
- [x] All Settings/reader copy is truthful (real selector, real editions shown); placeholder wording removed

## Phase 12 — Accessibility

### 12.1 Semantic landmarks, keyboard nav & screen-reader support
- [x] Skip-to-content link (visually hidden until focused) + `<main id="main-content" tabindex="-1">` in `AppLayout`
- [x] Modal focus trap + focus restore to opener on close (`useFocusTrap`) for TafsirModal and NoteModal (Tab/Shift+Tab cycles inside; initial focus lands on the dialog)
- [x] `aria-expanded` + `aria-controls` on the mobile menu button; `id` on the drawer nav; per-route `document.title` (central route-title map) so the active page is announced/readable
- [x] Screen-reader audit of existing good practices retained (icon `aria-label`s, `aria-pressed` toggles, native range inputs, `role`/`aria-modal` dialogs, radio groups)

### 12.2 Focus indicators & high contrast
- [x] Global `:focus-visible` emerald ring (Phase 10.15) extended to custom range sliders (`.slider-audio` thumb) and select elements
- [x] Non-color-only state signals verified (active audio ayah gold glow, bookmarks, navigation `aria-current` from NavLink); selected/active states never rely on colour alone
- [x] `prefers-reduced-motion: reduce` CSS guard (disable smooth scroll / long animations); high-contrast pass on `text-ink-faint` commentary captions inside cards

### 12.3 Adjustable font size
- [x] New `uiSize` preference (`nq:ui-size`: small | medium | large) in the preferences store + `[data-ui-size]` root CSS scaling all rem-based text (Tailwind default) — pure-CSS, no layout flashes
- [x] Settings "Interface text size" selector (radiogroup, same a11y pattern as `ArabicSizeSelector`); Arabic size stays separate (`nq:arabic-size`)

### 12.4 RTL & bidi correctness
- [x] Bidi isolation guard: `.num-ltr` utility (`unicode-bidi: isolate; direction: ltr`) applied to surah:ayah references, timecodes, and queue counters so they never reorder inside RTL flows
- [x] Verified `lang` + `dir` on every Arabic / Urdu / Hindi / Farsi surface (Phase 11.5 baseline) and documented the RTL content status below
- [ ] Follow-up: full mirrored-UI RTL layout (`dir="rtl"` document toggle) — deferred, would need logical-property pass over the premium fixed layout (player, drawer, sidebar)

### 12.5 Accessible audio controls
- [x] `aria-live="polite"` announce region in `AudioPlayer` announcing current recitation, play/pause state, mode toggles
- [x] `aria-expanded` on the player expand control; `aria-valuetext` (time) on the seek slider; focus-visible styling for `.slider-audio`
- [x] Labelled transparent controls kept minimal but complete (existing `aria-label`s retained)

## Phase 13 — PWA

- [x] Manifest + app icons
- [x] Service worker + offline app shell
- [x] Caching strategy that does NOT cache copyrighted audio/translations against license terms

### 13.1 Manifest & icons
- [x] `public/manifest.webmanifest` — name/short_name/description, standalone display, brand `theme_color` + dark `background_color`, purpose `any` + `maskable` icons
- [x] Dependency-free icon pipeline: `scripts/generate-pwa-icons.mjs` PNG-encodes the brand mark (deep-emerald gradient, gold crescent, sparkle motes) into 192/512/maskable-512/apple-touch-180/favicon-32; `npm run generate:icons`
- [x] `index.html`: manifest link, apple-touch-icon, `mobile-web-app-*` meta, PNG favicon (SVG favicon retained)

### 13.2 Service worker & offline shell
- [x] `public/sw.js`: cache-on-install app shell (`/`, manifest, icons); network-first navigations with offline shell fallback; cache-first for Vite hashed `/assets/` (immutable) with background revalidate
- [x] Production-only registration in `main.tsx` (never shadows the dev server); old cache versions pruned on activate; `clients.claim` for instant control
- [x] Build verified — `dist` includes `sw.js` + manifest + icons

### 13.3 License-safe caching
- [x] The SW only intercepts SAME-ORIGIN GET requests; `Range` (streaming) requests pass through untouched
- [x] Cross-origin responses (Al Quran Cloud translations/tafsir, islamic.network recitation CDN) are never cached — audio/translations/tafsir remain streamed on demand per publisher rights
- [x] About "Technology" copy made truthful: installable PWA, offline Mushaf shell, streamed (non-cached) external content

## Phase 14 — Performance & Error States

- [ ] Lazy loading, virtualized long lists, code splitting, API caching, image optimization
- [ ] Efficient audio loading (never bulk-download entire library)
- [ ] Handle every failure: API down, audio unavailable, missing translation, invalid surah/ayah/page, network fail, rate limit, loading skeletons, empty search — always retry options, never blank screens

### 14.1 Code splitting & lazy loading
- [x] Route-level `React.lazy` + `Suspense` (fallback `LoadingScreen`) for the heavy routes: SurahReader, Mushaf (default + index), JuzReader, Search, Tafsir, Listen
- [x] `services/quran/index.ts` emits only the bundled canonical provider statically; alQuranCloud + quranFoundation + http resolve via dynamic `import()` (memoized); `getActiveProvider()`/`listProviders()` become async; all call sites await the resolved provider
- [x] `audioProvider.ts` dynamic-imports `fetchJson` so `http.ts` leaves the eager bundle (audio URL building stays dependency-light)
- [x] API caching already shipped (`http.ts` memory + localStorage TTL cache + Settings “Clear API cache”); image optimization N/A — only bundled vector/PWA-raster assets exist
- [x] Build verified: main bundle shrinks, providers/translations/tafsir/search + canonical dataset split into async chunks

### 14.2 Long-list rendering (virtualization-grade containment)
- [x] `content-visibility: auto` + `contain-intrinsic-size` + `contain: layout style paint` utility applied to per-ayah rows in SurahReader and JuzReader (keeps scroll-into-view + motion intact); tafsir shows one long text so containment is not applicable there
- [x] Mushaf already paginated (≤ ~15 ayahs/page) — documented as intentional

### 14.3 Efficient audio loading
- [x] Verified on-demand streaming: one `HTMLAudioElement` instance, one CDN MP3 at a time, nothing queued/bulk-prefetched; cross-origin audio never touches `http.ts` cache or the service worker
- [x] `preload="metadata"` to avoid aggressive buffering before play; autoplay `AbortError` (user-gesture) treated as paused, not an error
- [x] AudioPlayer error surface gained a “Try again” retry that reloads the current item

### 14.4 Error states — never blank, always retry
- [ ] Shared `ErrorState` component (icon + message + Retry) and `useAsyncData.reload` (attempt counter) for every data fetch
- [ ] All fetch pages wired: SurahReader, JuzReader, Mushaf, Surahs, Listen, Tafsir, Search, JuzPage, DailyAyah, Home (daily ayah + surah list)
- [ ] Validation-only states (invalid surah/juz/page) render static guidance without a retry; rate-limit (429) keeps its dedicated hint
- [ ] Audio error in player shows “Try again” (network) instead of a dead button

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
| 2026-08-28 | Phase 5 — Interactive Ayah Actions complete (per-ayah play/pause/replay, tafsir modal, verse info panel, AudioProvider store) | `1dba4ca` |
| 2026-08-28 | Phase 6 — Mushaf Reader complete (swipe nav, jump-to dialog, fullscreen, progress + last-page restore, layout selection, per-edition boundaries) | `d5d10ec` |
| 2026-08-28 | Phase 7 — Search complete (offline Arabic corpus search, provider translations, surah-name + reference matching, mode tabs, play/read actions, zero-AI guarantee) | `4fde527` |
| 2026-08-29 | Phase 8 — Personal Features complete (personal notes store + modal + per-ayah wiring in surah/juz readers, `/notes` page, functional 30/60/custom reading plans with calm day tracking, continue-reading % on Home, cloud-sync note) | `c16a713` |
| 2026-08-29 | Phase 9 — Audio Recitation System complete (queue playback engine with single/range/surah/continuous modes, persistent bottom player, prev/next/seek/volume/repeat/auto-next, speeds, reciter selector in Settings + Listen, play actions across Home/Surahs/Reader/Juz/DailyAyah/Listen, active-ayah highlight + scroll-into-view, streaming attribution) | `cca496c` |
| 2026-08-29 | `prompt.md` restructured — new Premium UI/UX Upgrade direction (Luxury Islamic + Deep Black + Emerald + Gold + Frosted Glass + Cinematic Motion); plan reorganized: superseded old Animation phase with detailed **Phase 10** (10.1–10.16), shifted Translations & Tafsir to Phase 11, closed leftover search debounce/loading/error checkbox | `0b44620` |
| 2026-08-29 | **Phase 10 — Premium UI/UX, core build** (10.1–10.7 delivered): luxury glass + dual palettes (deep black → emerald, ivory light) in `index.css`; shared animation library (`src/animations`); route transitions + viewport reveals + staggered grids; AmbientBackground (rAF, reduced-motion aware), GeometricPattern (gold/emerald), LoadingScreen shimmer, LogoMark; cinematic staged-reveal Home hero (10.5); premium surah/ayah card hover-lift + gold glow + Arabic micro-move (10.6, reader/juz selected-ayah glow); EqualizerBars wired into player/featured/readers/daily + active-ayah lifecycle (10.7); glass floating navigation (sidebar/top bar/bottom nav/drawer); search chips + Home Daily Ayah signature card | `17f2ab6` |
| 2026-08-29 | **10.8 + 10.9 delivered** — Mushaf directional page-turn (cached last page via state for exit anim, `pageTurn` variants with custom dir, RTL-aware swipe + keyboard + popLayout), distinct centered mushaf surface; full-screen Focus Reading (deep-black radial backdrop with emerald warmth, 2.6s auto-hide controls, Equaled AudioFocusPill, Esc/F toggles, fade+scale enter/exit) | `98d0ae2` |
| 2026-08-29 | **10.10 delivered** — floating glass audio player: collapsed pill (close + now-playing + prev/play/equalizer/next) expands into progress + full controls; full rounding, lifted shadow, `active:scale-90` presses | `bb379d3` |
| 2026-08-30 | **10.12 delivered** — search micro-interactions (focus-glow field, staggered results, gold-highlighted matched text, equalizer live on playing hits) + bookmark feedback everywhere (whileTap scale pop + spring icon-pop w/ gold checkmark) in readers, daily ayah, bookmarks list, search | `81fc795` |
| 2026-08-30 | **10.13 delivered** — Juz/Explore grid hoisted to shared animation system (staggered fadeUp, hover lift + gold border + glow + animated gradient underline + arrow travel); Home Daily Ayah staged load (label → Arabic → translation → actions) | `a15ceb6` |
| 2026-08-30 | **10.14 delivered** — shared `AppFooter` (bismillah + tagline brand block, link groups, data & attribution, source link, geometric pattern) once in AppLayout; Home "Your Quran Journey" stat tiles with spring-unfurled gradient fill bars + continue-reading link | `1a09182` |
| 2026-08-30 | **10.15 + 10.16 delivered** — global emerald `:focus-visible` ring + `overflow-x: clip` guard; cohesion sweep: replaced last straggler `hover:shadow-lg` cards (Notes, Search, Plans, Surahs) with the premium hover-language, verified pulse skeletons / no neon-3D-parallax violations registry | `4e16f2b` |
| 2026-08-30 | **Phase 10 complete** (`17f2ab6` → `4e16f2b`). Open follow-ups tracked in the section headers: 10.11 nav toggle (glass nav already premium), 10.6 mobile hover→touch states, 10.15 reduced-motion + low-end tuning | `4e16f2b` |
| 2026-08-30 | **Phase 11.1 delivered** — curated catalogue of 20 vetted published translation editions; persisted active-edition selection (`nq:translations`, min-one guard); Settings Translations section with real grouped selector | `634434d` |
| 2026-08-30 | **Phase 11.2 delivered** — shared `AyahTranslations` renderer (lang/dir/`translate="no"`, skeleton); Surah/Juz readers + Daily Ayah fetch exactly the active editions; reader header attribution captions naming active translators; Home Daily Ayah uses primary edition | `4cf2295` |
| 2026-08-30 | **Phase 11.3 delivered** — tafsir fixed: direct Al Quran Cloud fetch, edition selector fed by live `getTafsirs()` with static catalogue fallback, default `ar.muyassar` (King Fahd Quran Complex); `getTafsir` hard guard rejects any edition the API answers with raw Quran text (`type !== 'tafsir'`); only the published Arabic tafsirs offered (Al-Muyassar, Jalalayn, Al-Qurtubi, Al-Waseet, Al-Baghawi, Tanwir al-Miqbas); choice persisted (`nq:tafsir`); clearer "commentary, not Quranic text" separation + `translate="no"`/`lang`/`dir` | `bff94af` |
| 2026-08-30 | **Phase 11.4 delivered** — `attribution.ts` dedicated `tafsir`-kind source row (six editions + safety note) and translation note naming in-use translators; `/sources` tafsir section auto-populated; Footer + About copy name the translators & tafsirs | `28d200c` |
| 2026-08-30 | **Phase 11.5 delivered** — `translate="no"` on every Arabic surface (Quran ayahs in readers/Daily/Home/Mushaf, bismillah, surah names, brand wordmark) plus all translation & tafsir paragraphs; honest Settings/reader copy | `ab0b76c` |
| 2026-08-30 | **Phase 12.1 delivered** — a11y: skip-to-content link + `<main id="main-content" tabindex="-1">`, `useFocusTrap` on TafsirModal + NoteModal (initial focus, Tab cycle, restore to opener), `aria-expanded`/`aria-controls` mobile drawer, per-route `document.title` | `cb7ecbd` |
| 2026-08-30 | **Phase 12.2 delivered** — focus & contrast: `.slider-audio` focus-visible thumb ring, `prefers-reduced-motion` CSS guard (settle CSS animations), tafsir credit/disclaimer captions lifted from ink-faint → ink-muted; colour-only states already mirrored with glow + aria-current | `cf3130f` |
| 2026-08-30 | **Phase 12.3 delivered** — adjustable interface text size: `nq:ui-size` preference + `[data-ui-size]` root scale (rem-based UI scales uniformly), Settings + mobile-drawer radiogroup selectors; Arabic size unchanged as separate control | `35d0d56` |
| 2026-08-30 | **Phase 12.4 delivered** — bidi isolation `.num-ltr` (dir ltr + unicode-bidi isolate) on surah:ayah refs, timecodes, queue counters; RTL content status documented; mirrored-UI RTL layout tracked as follow-up | `1218d1f` |
| 2026-08-30 | **Phase 12.5 delivered** — accessible audio: `aria-live` (role=status) recitation/play-state/mode announcements, `aria-expanded` expand control, `aria-valuetext` on seek + volume | `32841b4` |
| 2026-08-30 | **Phase 12 complete** (`cb7ecbd` → `32841b4`). Open follow-up: 12.4 mirrored-UI RTL layout (logical-property pass over the premium fixed layout) | `32841b4` |
| 2026-08-30 | **Phase 13.1 delivered** — PWA manifest (`manifest.webmanifest`: standalone, brand theme/background, any + maskable icons); dependency-free `scripts/generate-pwa-icons.mjs` rasterizes the emerald/gold mark (crescent + sparkles) → 192/512/maskable/apple-touch/favicon PNGs; `index.html` app meta + icon links | `c653599` |
| 2026-08-30 | **Phase 13.2 + 13.3 delivered** — `public/sw.js`: cached app shell + network-first navigations w/ offline fallback, cache-first hashed `/assets/`, old-version pruning, `skipWaiting`/`clients.claim`; registration PROD-only in `main.tsx`; license-safe — only same-origin GETs, `Range`/streaming + ALL cross-origin (translations/tafsir/audio) pass through uncached; About Technology copy now truthful | `f8a9b0d` |
