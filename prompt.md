NoorulQuran — Complete Quran Web Application

Build a complete, production-quality Quran web application called NoorulQuran.

Tagline:
Read. Listen. Reflect.

The website must be a respectful, modern, accessible and highly polished digital Quran experience. It must NOT use a cyberpunk, hacker, neon, gaming, futuristic-tech or AI-dashboard visual style.

The visual identity should feel peaceful, spiritual, elegant and scholarly while still looking like a modern premium web application.

---

1. CRITICAL RELIGIOUS CONTENT REQUIREMENT

The application MUST contain and correctly represent the entire Quran.

There are:

- 114 Surahs
- Every Ayah in every Surah
- Complete Arabic Quranic text
- Correct Surah ordering
- Correct Ayah numbering
- Correct Arabic diacritics
- Complete Quran metadata
- Complete Mushaf/page navigation
- Juz/Para information
- Hizb and Rub information where supported
- Ruku information where supported
- Manzil information where supported
- Sajdah information where supported

DO NOT:

- Invent Quranic verses
- Generate Quranic verses with AI
- Paraphrase Quranic Arabic
- Modify Quranic Arabic text
- Skip verses
- Truncate verses
- Replace verses with placeholder text
- Use fake sample data in the production Quran reader
- Present generated religious content as Quran
- Automatically translate Quran translations through browser translation
- Alter Quranic wording for UI purposes

Use authoritative Quran datasets/APIs and preserve the original supplied text exactly.

For Quran text, use an authoritative verified source such as Tanzil or another appropriately licensed canonical source. If Tanzil text is used, preserve it verbatim and include the required attribution and source link because its license prohibits modifying the text.

---

2. DATA ARCHITECTURE

Do NOT manually type thousands of Quran verses into React components.

Create a proper Quran data layer.

Recommended sources:

Primary Quran data

Use Quran Foundation/Quran.com Content APIs where appropriate for:

- Chapters
- Verses
- Pages
- Juz
- Hizb
- Rub
- Ruku
- Manzil
- Translations
- Tafsir
- Recitations
- Word-level information

The current Quran Foundation API provides these content categories and supports verse retrieval by chapter, page, Juz, Hizb and Rub.

Alternative/open API

Use Al Quran Cloud where appropriate for:

- Quran editions
- Surah data
- Ayah data
- Juz
- Page data
- Audio
- Translations
- Search
- Metadata

Its current API provides endpoints for Ayahs, Surahs, Juz, pages, Manzil, Ruku, Sajdah and other Quran resources.

IMPORTANT

Keep the data provider layer abstracted:

src/
  services/
    quran/
      quranProvider.ts
      quranFoundationProvider.ts
      alQuranCloudProvider.ts
      audioProvider.ts
      translationProvider.ts

The UI must not be tightly coupled to one API.

---

3. PAGE-BY-PAGE MUSHAF READER

This is one of the most important features.

Create a dedicated page:

"/mushaf"

The user must be able to read the Quran page by page like a physical Mushaf.

Features:

- Page 1 → Page 2 → Page 3...
- Previous page
- Next page
- Page number input
- Jump to page
- Jump to Surah
- Jump to Juz
- Jump to Ayah
- Full-screen reading
- Mobile swipe navigation
- Desktop navigation
- Reading progress
- Current page saved locally
- Dark mode
- Light mode
- Font/layout selection where supported

The application should support Mushaf layouts where the underlying API/data provides them, including:

- Uthmani
- IndoPak
- Other supported Mushaf layouts

Different Mushafs can have different page boundaries, so page navigation MUST be based on the selected Mushaf rather than assuming every edition has identical page layout.

---

4. EVERY VERSE MUST BE INTERACTIVE

Every Ayah needs its own dedicated action controls.

Example:

Ayah 2:255

[Arabic Quran text]

[▶ Play] [🔖 Bookmark] [📋 Copy] [↗ Share] [⋮ More]

Actions:

- Play
- Pause
- Replay
- Bookmark
- Copy
- Share
- View translation
- View tafsir where available
- View verse information
- Add personal note if user accounts are implemented

---

5. AUDIO RECITATION SYSTEM

Build a professional Quran audio player.

The user should be able to:

Single Ayah

Play one Ayah.

Multiple Ayahs

Select a range and play it.

Entire Surah

Play the complete Surah.

Entire Quran

Allow continuous playback across Surahs.

The player should automatically move:

Ayah 1
↓
Ayah 2
↓
Ayah 3
↓
...
Ayah 286
↓
Next Surah

---

6. ACTIVE AYAH SYNCHRONIZATION

While audio is playing:

- Highlight the currently recited Ayah
- Scroll the current Ayah into view
- Update playback progress
- Show current Surah
- Show current Ayah
- Show total progress
- Automatically advance to the next Ayah
- Continue to the next Surah when enabled

Example:

Al-Baqarah

Ayah 254
normal

Ayah 255
ACTIVE / CURRENTLY PLAYING

Ayah 256
normal

The active state should use a subtle glow/highlight, NOT a distracting animation.

---

7. RECITER SYSTEM

Create a reciter selector.

The architecture must support multiple reciters.

Example UI:

Reciter

Mishary Rashid Alafasy
Abdul Basit
Mahmoud Khalil Al-Husary
Saad Al-Ghamdi
...

Do not claim a reciter is available unless the selected data/audio provider actually supplies that recitation.

Respect the licensing/attribution requirements of each audio source. Al Quran Cloud's current terms state that its recitations are licensed for specified uses and retain their respective copyrights.

---

8. AUDIO CONTROLS

Include:

- Play
- Pause
- Previous Ayah
- Next Ayah
- Seek
- Volume
- Playback speed
- Repeat Ayah
- Repeat Surah
- Continuous playback
- Auto-next
- Reciter selection

Playback speeds:

0.75x
1x
1.25x
1.5x

Use a persistent bottom audio player throughout the application.

---

9. SURAH EXPLORER

Create:

"/surahs"

Display all 114 Surahs.

Each Surah card should contain:

- Surah number
- Arabic name
- English/transliterated name
- Translation of name where available
- Number of Ayahs
- Revelation classification where reliably available
- Juz information where appropriate
- Play button
- Read button

Add:

- Search
- Filter
- Sorting
- Quick navigation
- Arabic search
- English search

---

10. SURAH READER

Create:

"/surah/:surahId"

The page should include:

- Surah header
- Arabic Surah name
- English name
- Revelation information
- Number of Ayahs
- Juz information
- Bismillah where appropriate
- Every Ayah
- Translation
- Audio controls
- Bookmark
- Copy
- Share
- Tafsir where available

Use smooth transitions between Surahs.

---

11. TRANSLATIONS

Support multiple published translations where legally and technically appropriate.

Example language options:

- English
- Urdu
- Hindi
- Arabic
- Additional languages supported by the selected data source

Each translation must retain its attribution.

Do NOT use AI to silently translate an existing Quran translation.

Quran Foundation specifically warns against automatic browser retranslation of vetted Quran translations because it can introduce semantic errors.

---

12. TAFSIR

Create:

"/tafsir"

Allow users to view available tafsir resources associated with verses.

Tafsir must be clearly separated from:

- Quranic Arabic
- Translation
- Personal notes
- AI-generated explanations

Never visually mix tafsir with Quranic text in a way that could make the user mistake tafsir for Quran.

---

13. JUZ / PARA

Create:

"/juz"

Display:

- Juz 1
- Juz 2
- ...
- Juz 30

Each Juz should show:

- Starting Surah/Ayah
- Ending Surah/Ayah
- Progress
- Read button
- Play button

---

14. HIZB / RUB / RUKU / MANZIL

Create an Explore section containing:

- Hizb
- Rub al-Hizb
- Ruku
- Manzil
- Sajdah verses

Only display metadata that comes from a reliable source.

---

15. SEARCH

Create a powerful Quran search page:

"/search"

Search across:

- Arabic Quran text
- Available translations
- Surah names
- Ayah references

Results should show:

Al-Baqarah 2:255

[Arabic excerpt]

[Translation excerpt]

▶ Play
Read

Search must never return AI-invented Quranic text.

---

16. BOOKMARKS

Create:

"/bookmarks"

Users can bookmark:

- Ayahs
- Surahs
- Pages

Initially use localStorage so the application works without an account.

Later optionally support cloud synchronization through authenticated user APIs.

---

17. CONTINUE READING

Create a reading progress system.

Track:

- Last Surah
- Last Ayah
- Last Mushaf page
- Last Juz
- Reading percentage

Home page:

Continue Reading

Al-Kahf
18:27

Continue →

---

18. NOTES

Allow users to create private personal notes attached to an Ayah.

Clearly label them:

Personal Note

Never make personal notes look like Quran, translation or tafsir.

---

19. DAILY VERSE

Create:

"/daily-ayah"

Display one selected Ayah with:

- Arabic
- Translation
- Surah reference
- Audio
- Bookmark
- Share

The Daily Ayah must come from the actual Quran dataset.

---

20. QURAN READING PLANS

Create:

"/plans"

Include:

30-Day Quran

One Juz per day.

60-Day Quran

Two-Juz-per-two-day style schedule.

Custom Plan

Allow users to choose a reading goal.

Do not gamify religious worship excessively.

Keep it calm and personal.

---

21. HOME PAGE

Create a premium landing page.

Sections:

Hero

نور القرآن

NoorulQuran

Read. Listen. Reflect.

[Read Quran]
[Listen to Quran]

Continue Reading

Daily Ayah

Surah Explorer

Juz Explorer

Featured Recitations

Quran Journey

Explore the Quran

Resources

Footer

---

22. DARK MODE + LIGHT MODE

The website MUST support both.

Light mode

Use:

- Warm ivory
- White glass
- Emerald
- Muted gold
- Soft shadows

Dark mode

Use:

- Deep forest green
- Near-black emerald
- Dark translucent glass
- Soft gold/cream typography

The theme must be controlled globally.

Add:

Light
Dark
System

Save the user's preference locally.

Respect:

"prefers-color-scheme"

---

23. GLASSMORPHISM

Use glassmorphism throughout the interface, but subtly.

Use:

- backdrop blur
- translucent surfaces
- thin borders
- soft shadows
- layered cards

Do NOT make the Quran text itself look like a glowing futuristic object.

The sacred text should remain highly readable and visually dominant.

---

24. TYPOGRAPHY

Arabic typography is extremely important.

Use a reliable Quran-compatible Arabic font/source.

Support:

- Large Arabic reading size
- Medium
- Small

Translation typography should remain separate from Arabic typography.

Make RTL handling correct throughout the application.

---

25. ANIMATION

Use modern smooth animation.

Good animations:

- Page transitions
- Card entrances
- Soft hover states
- Audio progress
- Active Ayah highlight
- Navigation transitions
- Modal transitions
- Search transitions

Respect:

"prefers-reduced-motion"

When reduced motion is enabled, disable unnecessary animations.

---

26. MOBILE EXPERIENCE

The website must be fully responsive.

On mobile:

- Bottom audio player
- Swipe Mushaf pages
- Large readable Arabic
- Sticky navigation where appropriate
- Easy Ayah controls
- One-handed interaction
- No horizontal scrolling

On desktop:

- Sidebar navigation
- Large Mushaf reader
- Persistent audio player
- Optional verse information panel

---

27. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- ARIA labels
- Screen-reader support
- Focus indicators
- Reduced motion
- High contrast
- Adjustable font size
- RTL support
- Accessible audio controls

---

28. PWA

Make the website installable as a Progressive Web App.

Include:

- Manifest
- App icons
- Offline shell
- Service worker
- Caching strategy

Do NOT blindly cache copyrighted audio or translations unless their licensing permits it.

Cache appropriate public/static application resources and data according to source terms.

---

29. PERFORMANCE

Optimize for:

- Mobile
- Slow connections
- Low memory devices

Use:

- Lazy loading
- Virtualized long verse lists where necessary
- API caching
- Image optimization
- Code splitting
- Efficient audio loading
- Minimal dependencies

Never download the entire Quran audio library at startup.

---

30. SEO

Create proper metadata for:

- Home
- Every Surah
- Juz
- Quran reader
- Search
- Resources

Use:

- OpenGraph
- Twitter/X cards
- Structured metadata
- Canonical URLs
- Sitemap
- robots.txt

---

31. PROJECT STRUCTURE

Use:

noorulquran/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   │   └── quran/
│   ├── data/
│   ├── types/
│   ├── utils/
│   ├── store/
│   ├── styles/
│   └── App.tsx
│
├── README.md
├── package.json
└── ...

Recommended stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion/Framer Motion
- Lucide icons

---

32. DATA INTEGRITY

Add validation during development.

The application should verify:

- Exactly 114 Surahs
- Expected Ayah counts
- Correct Surah ordering
- Correct Ayah numbering
- No duplicate Ayah IDs
- No missing Ayahs
- No empty Arabic text
- No unexpected modification of Quranic text
- Valid audio references
- Valid page mappings

Create a development validation script:

npm run validate:quran

It should report missing or malformed Quran data.

---

33. SOURCE ATTRIBUTION

Create:

"/sources"

Explain exactly where content comes from.

Include source attribution for:

- Quran text
- Translations
- Recitations
- Tafsir
- Fonts
- APIs
- Images/assets

If Tanzil Quran text is used, preserve its attribution and license requirements. Tanzil explicitly requires its source to be identified and its text to remain unchanged.

---

34. RELIGIOUS CONTENT SAFETY

The website is a Quran reading application, not an authority that invents religious rulings.

Clearly distinguish:

Quran

Translation

Tafsir

Hadith

Personal Notes

Educational Information

Do not generate a fabricated fatwa or claim that AI-generated religious answers are authoritative.

---

35. GITHUB README

Create a professional README containing:

- NoorulQuran logo
- Project description
- Screenshots
- Live demo
- Features
- Technology stack
- Architecture
- Data sources
- Audio sources
- Attribution
- Licensing
- Local development instructions
- Environment variables
- API configuration
- Deployment
- Accessibility
- Roadmap
- Contribution guide

---

36. REQUIRED ROUTES

Implement at minimum:

/
/quran
/surahs
/surah/:id
/mushaf
/mushaf/:page
/juz
/juz/:id
/search
/bookmarks
/daily-ayah
/tafsir
/listen
/plans
/settings
/resources
/sources
/about

Add appropriate error/404 pages.

---

37. ERROR STATES

Do not show blank screens.

Handle:

- API unavailable
- Audio unavailable
- Missing translation
- Invalid Surah
- Invalid Ayah
- Invalid page
- Network failure
- Rate limit
- Loading
- Empty search results

Provide clear retry controls.

---

38. DESIGN PRINCIPLE

The application should feel like:

a peaceful digital Mushaf + modern Quran study application

NOT:

a futuristic AI website.

The interface should disappear into the reading experience.

The Quran must always remain the primary focus.

---

39. FINAL QUALITY REQUIREMENT

Before considering the project complete, verify that:

- All 114 Surahs exist.
- Every Ayah is accessible.
- No Ayahs are missing.
- No Quranic text has been generated by AI.
- Page-by-page Mushaf reading works.
- Surah reading works.
- Juz navigation works.
- Search works.
- Audio works.
- Individual Ayah playback works.
- Continuous Surah playback works.
- Continuous Quran playback works where supported.
- Current Ayah highlighting works.
- Bookmarks work.
- Reading progress works.
- Dark mode works.
- Light mode works.
- Mobile layout works.
- Desktop layout works.
- RTL works.
- Accessibility works.
- Source attribution is visible.
- API credentials remain server-side.
- No secret API keys are committed to GitHub.
- The README is complete.
- Production build succeeds.

Do not mark the application complete simply because the interface looks finished.

Data completeness and Quranic text integrity are mandatory.

---

Brand

Name: NoorulQuran

Tagline: Read. Listen. Reflect.

Primary visual direction: Emerald + ivory + subtle gold glassmorphism.

Overall feeling: Peaceful, elegant, scholarly, accessible, modern.

Build this as a serious portfolio-quality application rather than a simple demo.