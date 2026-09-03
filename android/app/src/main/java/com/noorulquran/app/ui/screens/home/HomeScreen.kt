package com.noorulquran.app.ui.screens.home

import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.StickyNote2
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.data.model.Surah
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.BrandMark
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.flow.combine

@Composable
fun HomeScreen(navController: NavHostController, audioViewModel: AudioViewModel) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val repo = app.container.quranRepository

    var surahs by remember { mutableStateOf<List<Surah>?>(null) }
    var lastRead by remember { mutableStateOf<Pair<Int, Int>?>(null) }

    LaunchedEffect(Unit) {
        surahs = repo.getSurahList()
        val settings = app.container.settings
        combine(settings.lastReadSurah, settings.lastReadAyah) { s, a -> s to a }
            .collect { lastRead = it }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        // Brand header
        Row(verticalAlignment = Alignment.CenterVertically) {
            BrandMark(size = 56)
            Spacer(Modifier.width(12.dp))
            Column {
                Text(
                    text = "NoorulQuran",
                    style = MaterialTheme.typography.headlineLarge,
                    color = Gold,
                )
                Text(
                    text = "Read. Listen. Reflect.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = InkMuted,
                )
            }
        }

        Spacer(Modifier.height(20.dp))

        // Last read card
        val last = lastRead
        if (last != null && surahs != null) {
            val surah = surahs!!.firstOrNull { it.number == last.first }
            GlassCard(Modifier.fillMaxWidth().clickable {
                navController.navigate(Routes.surah(last.first))
            }) {
                Column {
                    Text(
                        text = "Continue reading",
                        style = MaterialTheme.typography.labelMedium,
                        color = InkMuted,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "${surah?.nameTransliterated ?: "Surah ${last.first}"} · Ayah ${last.second}",
                        style = MaterialTheme.typography.titleLarge,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "Tap to resume · ${surah?.nameArabic ?: ""}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // Quick actions grid
        val actions = listOf(
            Action("Quran", "Browse all 114 surahs", Icons.Filled.Book, Routes.SURAHS),
            Action("Search", "Find a verse", Icons.Filled.Search, Routes.SEARCH),
            Action("Bookmarks", "Your saved verses", Icons.Filled.Bookmark, Routes.BOOKMARKS),
            Action("Notes", "Personal notes", Icons.Filled.StickyNote2, Routes.NOTES),
            Action("Offline", "Downloaded content", Icons.Filled.Download, Routes.OFFLINE),
            Action("Daily Ayah", "Verse of the day", Icons.Default.Refresh, Routes.DAILY),
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            actions.chunked(2).forEach { rowActions ->
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    rowActions.forEach { action ->
                        ActionCard(
                            action = action,
                            modifier = Modifier.weight(1f),
                            onClick = { navController.navigate(action.route) },
                        )
                    }
                    if (rowActions.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        // Surah speed-list (first few)
        if (surahs != null) {
            Text(
                text = "Start listening",
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(10.dp))
            surahs!!.take(4).forEach { surah ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            navController.navigate(Routes.surah(surah.number))
                        }
                        .padding(vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clickable {
                                audioViewModel.playSurah(surah.number)
                            },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "Play ${surah.nameTransliterated}",
                            tint = Gold,
                        )
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(
                            text = "${surah.number}. ${surah.nameTransliterated}",
                            style = MaterialTheme.typography.titleMedium,
                        )
                        Text(
                            text = "${surah.numberOfAyahs} ayahs · ${surah.revelationType.label}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = InkMuted,
                        )
                    }
                    Text(
                        text = surah.nameArabic,
                        fontSize = 20.sp,
                        color = Gold,
                    )
                }
            }
        }

        Spacer(Modifier.height(24.dp))
        Text(
            text = "May your recitation bring you peace.",
            style = MaterialTheme.typography.bodyMedium,
            color = InkMuted,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(16.dp))
    }
}

private data class Action(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val route: String,
)

@Composable
private fun ActionCard(action: Action, modifier: Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(Modifier.padding(14.dp)) {
            Icon(
                imageVector = action.icon,
                contentDescription = null,
                tint = Gold,
                modifier = Modifier.size(22.dp),
            )
            Spacer(Modifier.height(10.dp))
            Text(
                text = action.title,
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                text = action.subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = InkMuted,
                fontSize = 12.sp,
            )
        }
    }
}
