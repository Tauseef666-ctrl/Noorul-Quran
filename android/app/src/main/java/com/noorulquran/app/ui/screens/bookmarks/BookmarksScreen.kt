package com.noorulquran.app.ui.screens.bookmarks

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.data.local.BookmarkEntity
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import kotlinx.coroutines.launch

@Composable
fun BookmarksScreen(navController: NavHostController, audioViewModel: AudioViewModel) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val bookmarkDao = app.container.database.bookmarkDao()
    val repo = app.container.quranRepository
    val scope = rememberCoroutineScope()

    val bookmarks by bookmarkDao.observeAll()
        .collectAsState(initial = emptyList())

    var surahNames by remember { mutableStateOf<Map<Int, String>>(emptyMap()) }
    var ayahArabic by remember { mutableStateOf<Map<String, String>>(emptyMap()) }

    LaunchedEffect(Unit) {
        val nameMap = mutableMapOf<Int, String>()
        val arabicMap = mutableMapOf<String, String>()
        for (n in 1..114) {
            repo.getSurah(n)?.let { detail ->
                nameMap[n] = detail.surah.nameTransliterated
                for (ayah in detail.ayahs) {
                    arabicMap["${ayah.surahNumber}:${ayah.ayahNumber}"] = ayah.arabic
                }
            }
        }
        surahNames = nameMap
        ayahArabic = arabicMap
    }

    Column(Modifier.fillMaxSize()) {
        ScreenHeader(
            title = "Bookmarks",
            subtitle = if (bookmarks.isNotEmpty()) "${bookmarks.size} saved" else null,
            onBack = { navController.popBackStack() },
        )

        if (bookmarks.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Filled.BookmarkBorder,
                        contentDescription = null,
                        tint = InkMuted.copy(alpha = 0.4f),
                        modifier = Modifier.size(56.dp),
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = "No bookmarks yet",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkMuted,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "Tap the bookmark icon while reading to save verses",
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkMuted.copy(alpha = 0.6f),
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                items(
                    items = bookmarks,
                    key = { it.key },
                ) { bookmark ->
                    BookmarkRow(
                        bookmark = bookmark,
                        surahName = surahNames[bookmark.surahNumber]
                            ?: "Surah ${bookmark.surahNumber}",
                        arabic = ayahArabic[bookmark.key],
                        onPlay = {
                            audioViewModel.playAyah(bookmark.surahNumber, bookmark.ayahNumber)
                        },
                        onDelete = {
                            scope.launch { bookmarkDao.deleteByKey(bookmark.key) }
                        },
                        onClick = {
                            navController.navigate(Routes.surah(bookmark.surahNumber))
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun BookmarkRow(
    bookmark: BookmarkEntity,
    surahName: String,
    arabic: String?,
    onPlay: () -> Unit,
    onDelete: () -> Unit,
    onClick: () -> Unit,
) {
    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = "$surahName \u00B7 Ayah ${bookmark.ayahNumber}",
                        style = MaterialTheme.typography.labelMedium,
                        color = Gold,
                    )
                }
                IconButton(onClick = onPlay) {
                    Icon(
                        imageVector = Icons.Filled.PlayArrow,
                        contentDescription = "Play",
                        tint = Gold,
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Filled.Delete,
                        contentDescription = "Delete bookmark",
                        tint = InkMuted,
                    )
                }
            }

            if (!arabic.isNullOrBlank()) {
                Text(
                    text = arabic,
                    fontSize = 20.sp,
                    lineHeight = 30.sp,
                    color = Color.White,
                )
            }
        }
    }
}

@Composable
private fun <T> kotlinx.coroutines.flow.Flow<T>.collectAsState(
    initial: T,
): androidx.compose.runtime.State<T> {
    return androidx.compose.runtime.collectAsState(initial = initial)
}
