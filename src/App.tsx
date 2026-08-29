import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import HomePage from './pages/HomePage'
import SurahsPage from './pages/SurahsPage'
import SurahReaderPage from './pages/SurahReaderPage'
import MushafPageReader, { MushafIndex } from './pages/MushafPage'
import JuzPage from './pages/JuzPage'
import JuzReaderPage from './pages/JuzReaderPage'
import SearchPage from './pages/SearchPage'
import BookmarksPage from './pages/BookmarksPage'
import NotesPage from './pages/NotesPage'
import DailyAyahPage from './pages/DailyAyahPage'
import TafsirPage from './pages/TafsirPage'
import ListenPage from './pages/ListenPage'
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
