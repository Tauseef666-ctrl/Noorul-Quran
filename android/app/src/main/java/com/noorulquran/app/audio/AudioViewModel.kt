package com.noorulquran.app.audio

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.data.api.QuranApi
import com.noorulquran.app.data.quran.QuranRepository
import com.noorulquran.app.data.quran.ReciterCatalog
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class PlaybackUiState(
    val isPlaying: Boolean = false,
    val item: AudioController.PlaybackItem? = null,
    val queueSize: Int = 0,
)

class AudioViewModel(app: Application) : AndroidViewModel(app) {

    private val appContext = app
    private val container: NoorulQuranApp = app as NoorulQuranApp
    private val quranRepository: QuranRepository = container.quranRepository
    private val api: QuranApi = container.api

    val controller: AudioController = AudioController(app)

    val uiState: StateFlow<PlaybackUiState> = combine(
        controller.isPlaying,
        controller.queue,
    ) { playing, queue ->
        PlaybackUiState(
            isPlaying = playing,
            item = controller.currentItem,
            queueSize = queue.size,
        )
    }.stateIn(viewModelScope, SharingStarted.Eagerly, PlaybackUiState())

    private val _currentReciter = MutableStateFlow(ReciterCatalog.defaultId())
    val currentReciter: StateFlow<String> = _currentReciter.asStateFlow()

    init {
        viewModelScope.launch {
            container.settings.reciter.collect { _currentReciter.value = it }
        }
    }

    fun setReciter(id: String) {
        viewModelScope.launch {
            container.settings.setReciter(id)
            _currentReciter.value = id
        }
    }

    /** Play a surah, ayah by ayah. If startAyah == endAyah, only that ayah plays. */
    fun playSurah(surahNumber: Int, startAyah: Int = 1, endAyah: Int? = null) {
        viewModelScope.launch {
            val detail = quranRepository.getSurah(surahNumber) ?: return@launch
            val last = (endAyah ?: detail.ayahs.size)
                .coerceAtMost(detail.ayahs.size)
            val reciterId = _currentReciter.value
            val reciterName = ReciterCatalog.nameFor(reciterId)

            val items = mutableListOf<AudioController.PlaybackItem>()
            for (a in startAyah..last) {
                val ayah = detail.ayahs.firstOrNull { it.ayahNumber == a } ?: continue
                val global = quranRepository.globalAyahNumber(ayah.surahNumber, ayah.ayahNumber)
                val title = "Surah ${ayah.surahNumber} · Ayah ${ayah.ayahNumber}"
                val media = controller.mediaItem(
                    url = api.verseAudioUrl(reciterId, global),
                    title = title,
                    artist = reciterName,
                    artwork = null,
                )
                items += AudioController.PlaybackItem(
                    title = title,
                    artist = reciterName,
                    artwork = null,
                    surah = ayah.surahNumber,
                    ayah = ayah.ayahNumber,
                    mediaItem = media,
                )
            }
            if (items.isEmpty()) return@launch
            controller.playQueue(items, 0, last > startAyah)
        }
    }

    /** Play one ayah. */
    fun playAyah(surahNumber: Int, ayahNumber: Int) =
        playSurah(surahNumber, ayahNumber, ayahNumber)

    fun toggle() = controller.toggle()
    fun pause() = controller.pause()
    fun resume() = controller.resume()
    fun stop() = controller.clearQueue()
    fun next() = controller.next()
    fun prev() = controller.prev()
    fun seekTo(ms: Long) = controller.seekTo(ms)
    fun seekForward(ms: Long = 30_000) = controller.seekForward(ms)
    fun seekBackward(ms: Long = 30_000) = controller.seekBackward(ms)
    fun setRate(rate: Float) {
        controller.setRate(rate)
        viewModelScope.launch { container.settings.setPlaybackRate(rate) }
    }

    override fun onCleared() {
        controller.clearQueue()
        controller.player.release()
        super.onCleared()
    }
}
