# NoorulQuran — نور القرآن

> **Read. Listen. Reflect.** A complete, production-quality Quran web application.

Built with Vite + React 19 + TypeScript + Tailwind CSS v4, wrapped in a luxury glass
design (deep black → emerald in dark mode, warm ivory in light), with offline-first
data, full audio playback, and accessibility baked in.

**Live demo:** https://tauseef666-ctrl.github.io/Noorul-Quran

## Screenshots

Captures of the app (Home hero, Surah reader, Mushaf, Listen player, Search) are
added to `docs/screenshots/` during the final QA pass (Phase 18) and linked from
here at release time.

---

## Features

- **Full Quran text** — all 114 surahs, every ayah, served verbatim from a bundled,
  checksummed Uthmani dataset (never AI-generated, paraphrased, or truncated).
- **Surah & Juz readers** — per-ayah actions (play, tafsir, verse info, notes,
  bookmarks), batching of published translations, active-ayah highlighting.
- **Digital Mushaf** — page-by-page reading with swipe/keyboard navigation,
  jump-to-page, layout selection, focus reading, and last-page restore.
- **Search** — offline Arabic corpus + translation + surah-name/reference matching
  with a zero-AI guarantee on every result.
- **Audio recitations** — streamed queue playback (single/range/surah/continuous),
  persistent floating player, reciter selection, speeds, active-ayah sync.
- **Translations & Tafsir** — a curated catalogue of 20 vetted published translation
  editions and 6 published Arabic tafsirs, with per-item attribution.
- **Personal features** — notes, bookmarks, reading plans with day tracking,
  continue-reading, daily ayah.
- **Theme & reading controls** — dark/light/system, adjustable Arabic, translation,
  and UI text sizes.
- **PWA** — installable, offline-capable app shell via a license-safe service worker.
- **SEO** — per-route metadata, canonical URLs, OpenGraph/Twitter cards, sitemap,
  robots.txt, JSON-LD.

## Tech Stack

| Area | Choice |
| --- | --- |
| Build | Vite 8, TypeScript, tsc strict |
| UI | React 19, Tailwind CSS v4 |
| Motion | Framer Motion (route transitions, reveals) |
| Icons | lucide-react |
| Fonts | Amiri Quran / Amiri, Noto Nastaliq Urdu, Lora, Inter (all SIL OFL) |
| Router | react-router-dom 7 (`/src/App.tsx`, lazy route chunks) |
| State | React stores in `src/store/*` (audio, bookmarks, notes, preferences, translations) |
| Data | Bundled `src/data/canonical-quran.json` + memoized async providers in `src/services/quran/*` |

## Architecture

```
index.html → src/main.tsx
               └─ <App> (Router) → <AppLayout>         nav + footer + ambient background
                      └─ <RoutedPage> (lazy <Outlet/>) ← Suspense + LoadingScreen
                            ├─ pages/*                 (route components)
                            ├─ store/*                 (context stores)
                            ├─ services/quran/*        (QuranProvider interface)
                            ├─ hooks/useAsyncData      (data + loading + error + retry)
                            └─ lib/                    (documentMeta, …)
        public/ → manifest, service worker, icons, robots.txt, sitemap.xml
```

Code-splitting: each route is a lazy chunk; remote providers (`http.ts`,
Al Quran Cloud, Quran Foundation) load async only when used; audio streams one
MP3 at a time from the CDN.

## Data Integrity

Quran text is vendored **verbatim** from authoritative sources and guarded by a
checksummed dataset:

```bash
npm run generate:quran   # regenerate from Quran.com API v4 (+ Al Quran Cloud cross-check)
npm run validate:quran   # 28-check integrity gate — run before every release
```

No verse in this app is AI-generated, paraphrased, or truncated. Never hand-edit
`src/data/canonical-quran.json`.

## Data Sources & Attribution

| Source | Used for | Notes |
| --- | --- | --- |
| [Quran.com API v4](https://quran.foundation) | Uthmani text, navigation metadata, chapters | Bundled in `src/data/canonical-quran.json` (Madinah Mushaf tradition; same lineage as the [Tanzil](https://tanzil.net) Uthmani edition) |
| [Al Quran Cloud](https://alquran.cloud) | Translations (en.sahih, ur.jalandhry), tafsir editions | Only vetted published works are offered |
| [islamic.network CDN](https://cdn.islamic.network) | Recitation audio (Alafasy, Abdul Basit, Husary…) | Streamed on demand; never bulk-downloaded |
| [Quran.com API v4](https://quran.foundation) | Search + chapter metadata (optional token) | See `src/services/quran/quranFoundationProvider.ts` |

The Quran text itself is divine revelation and not copyrightable; APIs, translations,
fonts, icons, and audio carry their own terms. The full registry — including every
font, the self-generated icon suite, and licensing notes — lives in
`src/data/attribution.ts` and is rendered on the in-app **Sources & Attribution** page
(`/sources`).

## Development

```bash
npm install
cp .env.example .env        # optional API keys (see below)
npm run dev                 # http://localhost:5173
npm run typecheck && npm run lint && npm run build
```

### Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_QURAN_PROVIDER` | Data provider id: `canonical`, `quran-foundation`, or `alquran-cloud` | `canonical` |
| `VITE_QURAN_FOUNDATION_API_KEY` | Optional Quran.com API v4 auth token (higher rate limits) | none |
| `VITE_SITE_URL` | Canonical production origin for SEO metadata | GitHub Pages URL (see `.env.example`) |

No `VITE_*` variable is a true secret — Vite embeds `VITE_`-prefixed vars into the client
bundle, so `VITE_QURAN_FOUNDATION_API_KEY` is only a public rate-limit token and must be
treated as non-secret. Server-only secrets have no home in this client-only app and are
never committed.

### Utilities

```bash
npm run generate:icons     # re-rasterize the emerald/gold icon suite (no deps)
npm run validate:quran     # integrity gate for the canonical dataset
```

## Deployment

- **Vercel (recommended):** connect the repository and keep the default build
  settings — `npm run build` / `dist`. Each push auto-deploys.
- **Any static host:** build first (`npm run build`), then serve `dist/` with SPA
  fallback to `index.html`. Serve over HTTPS; the service worker requires it (except
  `localhost`).
- Set `VITE_SITE_URL` to your real domain and update `sitemap.xml`/`robots.txt`
  origins before launch.

## Accessibility

Skip-to-content link and landmarks, focus trapping (modals), per-route titles and
metadata, `aria-live` recitation announcements, visible focus rings, adjustable text
sizes (Arabic, translation, and UI), `prefers-reduced-motion` support, and contrast-
checked palettes. Mirrored RTL UI is the remaining open item (see Roadmap).

## Roadmap

See [plan.md](plan.md) — phases 0–16 are delivered. Remaining:

- Phase 17 documentation (this file) and Phase 18 final QA gate (`npm run validate:quran`
  clean, production build, manual pass over reading/audio/search).
- Open follow-ups: mobile touch states (10.6), reduced-motion & low-end tuning (10.15),
  mirrored-UI RTL layout (12.4).

## Contributing

Contributions are welcome. Please respect the data-integrity rules: never edit the
canonical dataset by hand, always run `npm run validate:quran` before a release, and
only add translation/tafsir editions that are published works with clear attribution.

This application contains no chatbot and generates no religious answers. Do not add
AI-generated or fabricated religious content.

---

**NoorulQuran** — نور القرآن · Read. Listen. Reflect.