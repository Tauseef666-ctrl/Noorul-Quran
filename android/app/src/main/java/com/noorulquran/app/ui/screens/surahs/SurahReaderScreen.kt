package com.noorulquran.app.ui.screens.surahs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.TextSnippet
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.data.local.BookmarkEntity
import com.noorulquran.app.data.local.NoteEntity
import com.noorulquran.app.data.model.SurahDetail
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.theme.DeepBlack
import com.noorulquran.app.ui.theme.Emerald
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import com.noorulquran.app.ui.theme.SurfaceDark
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun SurahReaderScreen(
    surahId: Int,
    navController: NavHostController,
    audioViewModel: AudioViewModel,
) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val repository = app.container.quranRepository
    val settings = app.container.settings
    val bookmarkDao = app.container.database.bookmarkDao()
    val noteDao = app.container.database.noteDao()
    val api = app.container.api
    val scope = rememberCoroutineScope()

    val playbackState by audioViewModel.uiState.collectAsState()
    val arabicSize by settings.arabicSize.collectAsState(initial = 1f)

    var surahDetail by remember { mutableStateOf<SurahDetail?>(null) }
    var translations by remember { mutableStateOf<Map<Int, String>>(emptyMap()) }
    var loadingTranslations by remember { mutableStateOf(false) }
    val bookmarkedAyahs = remember { mutableStateMapOf<String, BookmarkEntity>() }
    val notedAyahs = remember { mutableStateMapOf<String, NoteEntity>() }
    var showNoteDialog by remember { mutableStateOf<Pair<Int, Int>?>(null) }

    val listState = rememberLazyListState()

    LaunchedEffect(surahId) {
        surahDetail = withContext(Dispatchers.IO) { repository.getSurah(surahId) }
    }

    LaunchedEffect(surahId) {
        loadingTranslations = true
        try {
            val raw = withContext(Dispatchers.IO) {
                api.getSurahTranslations(surahId, listOf("en.sahih"))
            }
            translations = raw.mapValues { (_, byEdition) ->
                byEdition.values.firstOrNull().orEmpty()
            }
        } catch (_: Exception) {
        }
        loadingTranslations = false
    }

    LaunchedEffect(surahId) {
        bookmarkDao.observeAll().collect { list ->
            bookmarkedAyahs.clear()
            list.filter { it.surahNumber == surahId }.forEach { bookmarkedAyahs[it.key] = it }
        }
    }

    LaunchedEffect(surahId) {
        noteDao.observeAll().collect { list ->
            notedAyahs.clear()
            list.filter { it.surahNumber == surahId }.forEach { notedAyahs[it.key] = it }
        }
    }

    LaunchedEffect(listState) {
        snapshotFlow { listState.firstVisibleItemIndex }
            .distinctUntilChanged()
            .collect { index ->
                val ayahs = surahDetail?.ayahs ?: return@collect
                if (index in ayahs.indices) {
                    settings.setLastRead(surahId, ayahs[index].ayahNumber)
                }
            }
    }

    val currentPlayingAyah = playbackState.item?.let { item ->
        if (item.surah == surahId) item.ayah else null
    }

    if (showNoteDialog != null) {
        val (s, a) = showNoteDialog!!
        NoteEditDialog(
            surahNumber = s,
            ayahNumber = a,
            existing = notedAyahs["${s}:${a}"],
            onSave = { text ->
                scope.launch {
                    val key = "$s:$a"
                    val now = System.currentTimeMillis()
                    val entity = NoteEntity(
                        key = key,
                        surahNumber = s,
                        ayahNumber = a,
                        text = text,
                        updatedAt = now,
                    )
                    noteDao.upsert(entity)
                    showNoteDialog = null
                }
            },
            onDismiss = { showNoteDialog = null },
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepBlack),
    ) {
        val surah = surahDetail?.surah
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                    contentDescription = "Back",
                    tint = Gold,
                )
            }
            Column(Modifier.weight(1f)) {
                if (surah != null) {
                    Text(
                        text = "${surah.number}. ${surah.nameTransliterated}",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    Text(
                        text = surah.nameTranslation,
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkMuted,
                    )
                }
            }
            if (surah != null) {
                Text(
                    text = surah.nameArabic,
                    fontSize = 24.sp,
                    color = Gold,
                    fontWeight = FontWeight.Bold,
                )
            }
        }

        if (surah != null && surah.number != 1 && surah.number != 9) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650",
                    fontSize = 22.sp,
                    color = Gold,
                    textAlign = TextAlign.Center,
                )
            }
        }

        when {
            surahDetail == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Gold)
            }
            else -> LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize(),
            ) {
                itemsIndexed(
                    items = surahDetail!!.ayahs,
                    key = { _, ayah -> ayah.key },
                ) { index, ayah ->
                    val isPlaying = currentPlayingAyah == ayah.ayahNumber
                    val isBookmarked = bookmarkedAyahs.containsKey(ayah.key)
                    val hasNote = notedAyahs.containsKey(ayah.key)
                    val translationText = translations[ayah.ayahNumber]

                    AyahCard(
                        ayahNumber = ayah.ayahNumber,
                        arabic = ayah.arabic,
                        arabicSize = arabicSize,
                        translation = translationText,
                        isLoadingTranslation = loadingTranslations,
                        isPlaying = isPlaying,
                        isBookmarked = isBookmarked,
                        hasNote = hasNote,
                        onPlay = {
                            if (isPlaying) {
                                audioViewModel.toggle()
                            } else {
                                audioViewModel.playAyah(surahId, ayah.ayahNumber)
                            }
                        },
                        onBookmark = {
                            scope.launch {
                                val key = ayah.key
                                if (isBookmarked) {
                                    bookmarkDao.deleteByKey(key)
                                } else {
                                    bookmarkDao.upsert(
                                        BookmarkEntity(
                                            key = key,
                                            surahNumber = surahId,
                                            ayahNumber = ayah.ayahNumber,
                                            createdAt = System.currentTimeMillis(),
                                        )
                                    )
                                }
                            }
                        },
                        onCopy = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(
                                ClipData.newPlainText("Quran Ayah", ayah.arabic)
                            )
                        },
                        onShare = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, ayah.arabic)
                            }
                            ContextCompat.startActivity(
                                context,
                                Intent.createChooser(shareIntent, "Share Ayah"),
                                null,
                            )
                        },
                        onTafsir = {
                            navController.navigate("${Routes.TAFSIR}?surah=$surahId&ayah=${ayah.ayahNumber}")
                        },
                        onNote = { showNoteDialog = Pair(surahId, ayah.ayahNumber) },
                    )
                }

                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        if (surahId > 1) {
                            OutlinedButton(
                                onClick = { navController.navigate(Routes.surah(surahId - 1)) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp),
                                )
                                Spacer(Modifier.width(4.dp))
                                Text("Previous", style = MaterialTheme.typography.labelLarge)
                            }
                        }
                        if (surahId < 114) {
                            OutlinedButton(
                                onClick = { navController.navigate(Routes.surah(surahId + 1)) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                            ) {
                                Text("Next", style = MaterialTheme.typography.labelLarge)
                                Spacer(Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp),
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(80.dp))
                }
            }
        }
    }
}

@Composable
private fun AyahCard(
    ayahNumber: Int,
    arabic: String,
    arabicSize: Float,
    translation: String?,
    isLoadingTranslation: Boolean,
    isPlaying: Boolean,
    isBookmarked: Boolean,
    hasNote: Boolean,
    onPlay: () -> Unit,
    onBookmark: () -> Unit,
    onCopy: () -> Unit,
    onShare: () -> Unit,
    onTafsir: () -> Unit,
    onNote: () -> Unit,
) {
    val playingBg by animateColorAsState(
        targetValue = if (isPlaying) Emerald.copy(alpha = 0.12f) else SurfaceDark,
        label = "playingBg",
    )

    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        Column(
            modifier = Modifier.background(playingBg).padding(12.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (hasNote) {
                    Icon(
                        imageVector = Icons.Filled.TextSnippet,
                        contentDescription = "Has note",
                        tint = Gold,
                        modifier = Modifier.size(14.dp),
                    )
                    Spacer(Modifier.width(4.dp))
                }
                if (isBookmarked) {
                    Icon(
                        imageVector = Icons.Filled.Bookmark,
                        contentDescription = "Bookmarked",
                        tint = Gold,
                        modifier = Modifier.size(14.dp),
                    )
                    Spacer(Modifier.width(8.dp))
                }
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Gold.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = ayahNumber.toString(),
                        style = MaterialTheme.typography.labelMedium,
                        color = Gold,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            Text(
                text = arabic,
                fontSize = (24.sp * arabicSize),
                lineHeight = (42.sp * arabicSize),
                color = MaterialTheme.colorScheme.onSurface,
                textAlign = TextAlign.End,
                modifier = Modifier.fillMaxWidth(),
            )

            if (translation != null) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = translation,
                    style = MaterialTheme.typography.bodyMedium,
                    color = InkMuted,
                    modifier = Modifier.fillMaxWidth(),
                )
            } else if (isLoadingTranslation) {
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(12.dp),
                        strokeWidth = 1.5.dp,
                        color = InkMuted,
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = "Loading translation…",
                        style = MaterialTheme.typography.bodySmall,
                        color = InkMuted,
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onPlay, modifier = Modifier.size(36.dp)) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        tint = if (isPlaying) Emerald else Gold,
                        modifier = Modifier.size(20.dp),
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                    IconButton(onClick = onBookmark, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = if (isBookmarked) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
                            contentDescription = "Bookmark",
                            tint = if (isBookmarked) Gold else InkMuted,
                            modifier = Modifier.size(18.dp),
                        )
                    }
                    IconButton(onClick = onCopy, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = Icons.Filled.ContentCopy,
                            contentDescription = "Copy",
                            tint = InkMuted,
                            modifier = Modifier.size(18.dp),
                        )
                    }
                    IconButton(onClick = onShare, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = Icons.Filled.Share,
                            contentDescription = "Share",
                            tint = InkMuted,
                            modifier = Modifier.size(18.dp),
                        )
                    }
                    IconButton(onClick = onTafsir, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = Icons.Filled.TextSnippet,
                            contentDescription = "Tafsir",
                            tint = InkMuted,
                            modifier = Modifier.size(18.dp),
                        )
                    }
                    IconButton(onClick = onNote, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = Icons.Filled.TextSnippet,
                            contentDescription = "Note",
                            tint = if (hasNote) Gold else InkMuted,
                            modifier = Modifier.size(18.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NoteEditDialog(
    surahNumber: Int,
    ayahNumber: Int,
    existing: NoteEntity?,
    onSave: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var text by remember { mutableStateOf(existing?.text.orEmpty()) }

    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = SurfaceDark,
        title = {
            Text(
                text = "Note — $surahNumber:$ayahNumber",
                style = MaterialTheme.typography.headlineMedium,
                color = Gold,
            )
        },
        text = {
            androidx.compose.material3.OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Write your note…", color = InkMuted) },
                colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold,
                    unfocusedBorderColor = InkMuted,
                    focusedTextColor = MaterialTheme.colorScheme.onSurface,
                    unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                ),
            )
        },
        confirmButton = {
            androidx.compose.material3.TextButton(onClick = { onSave(text) }) {
                Text("Save", color = Gold)
            }
        },
        dismissButton = {
            androidx.compose.material3.TextButton(onClick = onDismiss) {
                Text("Cancel", color = InkMuted)
            }
        },
    )
}
