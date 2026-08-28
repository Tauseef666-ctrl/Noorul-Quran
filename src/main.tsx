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
import { BookmarksProvider } from './store/bookmarks.tsx'
import { AudioProvider } from './store/audio.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <BookmarksProvider>
        <AudioProvider>
          <App />
        </AudioProvider>
      </BookmarksProvider>
    </PreferencesProvider>
  </StrictMode>,
)
