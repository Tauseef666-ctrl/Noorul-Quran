package com.noorulquran.app.ui.screens.daily

import android.content.Intent
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.data.local.BookmarkEntity
import com.noorulquran.app.data.model.Ayah
import com.noorulquran.app.data.model.Surah
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.BrandMark
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.Emerald
import com.noorulquran.app.ui.theme.InkMuted
import java.time.LocalDate
import kotlinx.coroutines.launch

private val DAILY_VERSE_POOL = listOf(
    1 to 1,
    2 to 152,
    2 to 153,
    2 to 186,
    2 to 255,
    3 to 8,
    3 to 103,
    4 to 59,
    5 to 3,
    5 to 8,
    13 to 28,
    17 to 23,
    17 to 70,
    20 to 14,
    23 to 1,
    28 to 77,
    31 to 17,
    39 to 53,
    51 to 56,
    94 to 5,
)

private const val TRANSLATION_EDITION = "en.sahih"

@Composable
fun DailyAyahScreen(navController: NavHostController, audioViewModel: AudioViewModel) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val repo = app.container.quranRepository
    val api = app.container.api
    val scope = rememberCoroutineScope()

    val dayIndex = LocalDate.now().dayOfYear % DAILY_VERSE_POOL.size
    val dailyIndex = remember { dayIndex }
    val pair = DAILY_VERSE_POOL[dailyIndex]
    val surahNumber = pair.first
    val ayahNumber = pair.second

    var surah by remember { mutableStateOf<Surah?>(null) }
    var ayah by remember { mutableStateOf<Ayah?>(null) }
    var translation by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var isBookmarked by remember { mutableStateOf(false) }

    val bookmarkDao = app.container.database.bookmarkDao()
    val uiState by audioViewModel.uiState.collectAsState()

    LaunchedEffect(dailyIndex) {
        isLoading = true
        translation = null
        val detail = repo.getSurah(surahNumber)
        surah = detail?.surah
        ayah = detail?.ayahs?.firstOrNull { it.ayahNumber == ayahNumber }
        isBookmarked = bookmarkDao.findByKey("$surahNumber:$ayahNumber") != null
        isLoading = false
        translation = api.getTranslations(surahNumber, ayahNumber, listOf(TRANSLATION_EDITION))
            .firstOrNull()?.text
    }

    val isCurrentPlaying = uiState.isPlaying &&
        uiState.item?.surah == surahNumber &&
        uiState.item?.ayah == ayahNumber

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            BrandMark(size = 56)
            Spacer(Modifier.width(14.dp))
            Column {
                Text(
                    text = "NoorulQuran",
                    style = MaterialTheme.typography.headlineLarge,
                    color = Gold,
                )
                Text(
                    text = "Verse of the Day",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Gold.copy(alpha = 0.8f),
                )
            }
        }

        Spacer(Modifier.height(28.dp))

        GlassCard(
            modifier = Modifier.fillMaxWidth(),
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "\u2726  Verse of the Day  \u2726",
                    style = MaterialTheme.typography.labelLarge,
                    color = Gold,
                    textAlign = TextAlign.Center,
                )

                Spacer(Modifier.height(10.dp))

                Text(
                    text = "Surah ${surah?.nameTransliterated ?: surahNumber}, Ayah $ayahNumber",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = surah?.nameArabic ?: "",
                    fontSize = 18.sp,
                    color = Emerald,
                    textAlign = TextAlign.Center,
                )

                Spacer(Modifier.height(24.dp))

                when {
                    isLoading -> {
                        Spacer(Modifier.height(40.dp))
                        CircularProgressIndicator(
                            color = Gold,
                            modifier = Modifier.size(32.dp),
                        )
                        Spacer(Modifier.height(40.dp))
                    }
                    ayah != null -> {
                        Text(
                            text = ayah!!.arabic,
                            fontSize = 26.sp,
                            lineHeight = 44.sp,
                            color = Color.White,
                            textAlign = TextAlign.Center,
                        )
                        Spacer(Modifier.height(16.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .width(40.dp)
                                    .height(1.dp)
                                    .padding(0.dp),
                            )
                            Text(
                                text = "\u06DD",
                                fontSize = 12.sp,
                                color = Gold,
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(
                                text = ayahNumber.toString(),
                                fontSize = 12.sp,
                                color = Gold,
                            )
                        }
                    }
                    else -> {
                        Spacer(Modifier.height(24.dp))
                        Text(
                            text = "Unable to load this verse.",
                            style = MaterialTheme.typography.bodyLarge,
                            color = InkMuted,
                            textAlign = TextAlign.Center,
                        )
                        Spacer(Modifier.height(24.dp))
                    }
                }

                if (translation != null) {
                    Spacer(Modifier.height(20.dp))
                    Text(
                        text = translation!!,
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkMuted,
                        textAlign = TextAlign.Center,
                        lineHeight = 24.sp,
                    )
                } else if (!isLoading) {
                    Spacer(Modifier.height(20.dp))
                    Text(
                        text = "Translation unavailable.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkMuted,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            ActionButton(
                icon = {
                    Icon(
                        imageVector = if (isCurrentPlaying) Icons.Filled.Stop else Icons.Filled.PlayArrow,
                        contentDescription = if (isCurrentPlaying) "Stop" else "Play",
                        tint = Gold,
                    )
                },
                label = if (isCurrentPlaying) "Stop" else "Play",
                onClick = {
                    if (isCurrentPlaying) {
                        audioViewModel.toggle()
                    } else {
                        audioViewModel.playAyah(surahNumber, ayahNumber)
                    }
                },
            )
            ActionButton(
                icon = {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.MenuBook,
                        contentDescription = "Reading",
                        tint = Gold,
                    )
                },
                label = "Context",
                onClick = { navController.navigate(Routes.surah(surahNumber)) },
            )
            ActionButton(
                icon = {
                    Icon(
                        imageVector = if (isBookmarked) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = Gold,
                    )
                },
                label = if (isBookmarked) "Saved" else "Save",
                onClick = {
                    scope.launch {
                        val key = "$surahNumber:$ayahNumber"
                        if (isBookmarked) {
                            bookmarkDao.deleteByKey(key)
                            isBookmarked = false
                        } else {
                            bookmarkDao.upsert(
                                BookmarkEntity(
                                    key = key,
                                    surahNumber = surahNumber,
                                    ayahNumber = ayahNumber,
                                    createdAt = System.currentTimeMillis(),
                                )
                            )
                            isBookmarked = true
                        }
                    }
                },
            )
            ActionButton(
                icon = {
                    Icon(
                        imageVector = Icons.Filled.Share,
                        contentDescription = "Share",
                        tint = Gold,
                    )
                },
                label = "Share",
                onClick = {
                    val arabic = ayah?.arabic ?: ""
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(
                            Intent.EXTRA_TEXT,
                            "$arabic\n\nSurah $surahNumber, Ayah $ayahNumber\nNoorulQuran"
                        )
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share verse"))
                },
            )
        }

        Spacer(Modifier.height(32.dp))

        Text(
            text = "May this verse illuminate your day.",
            style = MaterialTheme.typography.bodyMedium,
            color = InkMuted,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun ActionButton(
    icon: @Composable () -> Unit,
    label: String,
    onClick: () -> Unit,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        IconButton(onClick = onClick) {
            Box(
                modifier = Modifier
                    .size(48.dp),
                contentAlignment = Alignment.Center,
            ) {
                icon()
            }
        }
        Spacer(Modifier.height(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = InkMuted,
        )
    }
}