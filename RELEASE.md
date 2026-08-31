# NoorulQuran — Android (PWA) Release

**v1.0.0** — Read. Listen. Reflect.

NoorulQuran is a progressive web app (PWA). There is no native Android binary; the simplest and
most reliable way to run it on Android is to **install the PWA** directly from the hosted site, or
to **serve the static build** from any web server and install from there.

## Install on Android (recommended)

1. Open NoorulQuran in **Chrome** on your Android phone or tablet.
2. Tap the browser menu (⋮) → **“Add to Home screen”**, or accept the **“Install app”** prompt.
3. Launch it from your home screen — it opens full-screen in its own app window and stays updated
   automatically.

## Offline bundle

The attached `noorulquran-v1.0.0-web.zip` is the production `dist/` build of this release. To use it:

```bash
unzip noorulquran-v1.0.0-web.zip -d noorulquran
cd noorulquran
npx serve .   # or any static host
```

Then repeat the install steps above against that URL. The PWA service worker provides offline
caching once installed.

## What's inside

- Full Quran text (Uthmani script), 114 surahs, searchable.
- Specimen-grade digital Mushaf (opened-book 2-page spread), reader view, juz navigation.
- Audio recitation with curated reciters (islamic.network CDN), suit your speed.
- Bookmarking, note-taking, reading progress tracking, daily ayah, tafsir & verse info.
- Light / dark / system themes, adjustable Arabic & UI text size.
- Installable PWA, offline-capable.

## Requirements

- Android 6.0+ with a modern Chromium browser (Chrome, Edge, Brave, Samsung Internet).
- An internet connection for audio and published translations (streamed on demand).
