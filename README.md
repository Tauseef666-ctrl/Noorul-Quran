# NoorulQuran — نور القرآن

> **Read. Listen. Reflect.** A complete, production-quality Quran web application.

Built with Vite + React + TypeScript + Tailwind CSS v4.

## Data Integrity

Quran text is vendored **verbatim** from authoritative sources and guarded by a checksummed dataset:

```bash
npm run generate:quran   # regenerate from Quran.com API v4 (+ Al Quran Cloud cross-check)
npm run validate:quran   # 28-check integrity gate — run before every release
```

No verse in this app is AI-generated, paraphrased, or truncated. Never hand-edit `src/data/canonical-quran.json`.

## Data Sources & Attribution

| Source | Used for | Notes |
| --- | --- | --- |
| [Quran.com API v4](https://quran.foundation) | Uthmani text, navigation metadata, chapters | Bundled in `src/data/canonical-quran.json` (Madinah Mushaf tradition; same lineage as the [Tanzil](https://tanzil.net) Uthmani edition) |
| [Al Quran Cloud](https://alquran.cloud) | Translations (en.sahih, ur.jalandhry), tafsir editions | Translation copyrights remain with their publishers |
| [islamic.network CDN](https://cdn.islamic.network) | Recitation audio (Alafasy, Abdul Basit, Husary…) | Streamed on demand; never bulk-downloaded |

The Quran text itself is divine revelation and not copyrightable; APIs, translations, fonts, and audio carry their own terms — see `src/data/attribution.ts`.

## Development

```bash
npm install
cp .env.example .env   # optional API keys
npm run dev            # http://localhost:5173
npm run typecheck && npm run lint && npm run build
```
