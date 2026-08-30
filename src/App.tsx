import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'

// Heavy pages (readers, search, tafsir, listeners) load their subtree — the
// translation/tafsir/search engines and remote providers — only when opened.
const SurahReaderPage = lazy(() => import('./pages/SurahReaderPage'))
const MushafPageReader = lazy(() => import('./pages/MushafPage'))
const MushafIndex = lazy(() =>
  import('./pages/MushafPage').then((module) => ({ default: module.MushafIndex })),
)
const JuzReaderPage = lazy(() => import('./pages/JuzReaderPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const TafsirPage = lazy(() => import('./pages/TafsirPage'))
const ListenPage = lazy(() => import('./pages/ListenPage'))

// Light pages stay eager so first paint stays instant.
import HomePage from './pages/HomePage'
import SurahsPage from './pages/SurahsPage'
import JuzPage from './pages/JuzPage'
import DailyAyahPage from './pages/DailyAyahPage'
import BookmarksPage from './pages/BookmarksPage'
import NotesPage from './pages/NotesPage'
import PlansPage from './pages/PlansPage'
import SettingsPage from './pages/SettingsPage'
import SourcesPage from './pages/SourcesPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/surahs" element={<SurahsPage />} />
          <Route path="/surah/:surahId" element={<SurahReaderPage />} />
          <Route path="/mushaf" element={<MushafIndex />} />
          <Route path="/mushaf/:page" element={<MushafPageReader />} />
          <Route path="/juz" element={<JuzPage />} />
          <Route path="/juz/:juzId" element={<JuzReaderPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/daily-ayah" element={<DailyAyahPage />} />
          <Route path="/tafsir" element={<TafsirPage />} />
          <Route path="/listen" element={<ListenPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}