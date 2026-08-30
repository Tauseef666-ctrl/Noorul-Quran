import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/lora'
import '@fontsource/amiri/400.css'
import '@fontsource/amiri/700.css'
import '@fontsource/amiri-quran/400.css'
import '@fontsource/noto-nastaliq-urdu/400.css'
import '@fontsource/noto-nastaliq-urdu/600.css'
import './styles/index.css'
import App from './App.tsx'
import { PreferencesProvider } from './store/preferences.tsx'
import { TranslationsProvider } from './store/translations.tsx'
import { BookmarksProvider } from './store/bookmarks.tsx'
import { NotesProvider } from './store/notes.tsx'
import { AudioProvider } from './store/audio.tsx'

// Register the PWA service worker only in production builds — the dev server
// must never be shadowed by a cached shell. Registration is fire-and-forget.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support degrades silently */
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <TranslationsProvider>
        <BookmarksProvider>
          <NotesProvider>
            <AudioProvider>
              <App />
            </AudioProvider>
          </NotesProvider>
        </BookmarksProvider>
      </TranslationsProvider>
    </PreferencesProvider>
  </StrictMode>,
)
