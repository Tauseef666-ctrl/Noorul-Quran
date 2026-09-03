package com.noorulquran.app.ui.screens.listen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.data.model.Surah
import com.noorulquran.app.data.quran.ReciterCatalog
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ListenScreen(navController: NavHostController, audioViewModel: AudioViewModel) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val repo = app.container.quranRepository
    val currentReciter by audioViewModel.currentReciter.collectAsState()

    var surahs by remember { mutableStateOf<List<Surah>?>(null) }

    LaunchedEffect(Unit) {
        surahs = repo.getSurahList()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        item {
            ScreenHeader(title = "Listen", subtitle = "Browse recitations")
        }

        item {
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Choose Reciter",
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(12.dp))
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                ReciterCatalog.ALL.forEach { reciter ->
                    val selected = currentReciter == reciter.id
                    GlassCard(
                        modifier = Modifier
                            .clickable { audioViewModel.setReciter(reciter.id) }
                            .then(
                                if (selected) Modifier.padding(1.dp) else Modifier
                            ),
                    ) {
                        Text(
                            text = reciter.name,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                            color = if (selected) Gold else MaterialTheme.colorScheme.onSurface,
                            maxLines = 2,
                        )
                    }
                }
            }
        }

        item {
            Spacer(Modifier.height(24.dp))
            Text(
                text = "Quick Play",
                style = MaterialTheme.typography.titleLarge,
            )
            Spacer(Modifier.height(8.dp))
        }

        if (surahs != null) {
            items(surahs!!.take(20), key = { it.number }) { surah ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clickable { audioViewModel.playSurah(surah.number) },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "Play ${surah.nameTransliterated}",
                            tint = Gold,
                            modifier = Modifier.size(22.dp),
                        )
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { navController.navigate(Routes.surah(surah.number)) },
                    ) {
                        Text(
                            text = "${surah.number}. ${surah.nameTransliterated}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
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

        item {
            Spacer(Modifier.height(32.dp))
            Text(
                text = "Audio streamed from Islamic Network CDN",
                style = MaterialTheme.typography.bodySmall,
                color = InkMuted,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(16.dp))
        }
    }
}
