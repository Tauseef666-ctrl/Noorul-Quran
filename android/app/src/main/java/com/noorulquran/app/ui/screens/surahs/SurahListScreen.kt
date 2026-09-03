package com.noorulquran.app.ui.screens.surahs

import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.data.model.Surah
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.theme.Emerald
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import androidx.compose.ui.platform.LocalContext

@Composable
fun SurahListScreen(navController: NavHostController, audioViewModel: AudioViewModel) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    var surahs by remember { mutableStateOf<List<Surah>?>(null) }
    var query by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        surahs = app.container.quranRepository.getSurahList()
    }

    val filtered = surahs?.filter {
        query.isBlank() ||
            it.nameTransliterated.contains(query, ignoreCase = true) ||
            it.nameArabic.contains(query) ||
            (it.number.toString() == query.trim())
    } ?: emptyList()

    Column(Modifier.fillMaxSize()) {
        Text(
            text = "The Quran",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )
        androidx.compose.material3.OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            placeholder = { Text("Search surah…") },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
        )
        Spacer(Modifier.height(8.dp))

        when {
            surahs == null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            filtered.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No surahs match.", color = InkMuted)
            }
            else -> LazyColumn(Modifier.fillMaxSize()) {
                items(filtered, key = { it.number }) { surah ->
                    SurahRow(surah = surah, audioViewModel = audioViewModel) {
                        navController.navigate(Routes.surah(surah.number))
                    }
                }
            }
        }
    }
}

@Composable
private fun SurahRow(
    surah: Surah,
    audioViewModel: AudioViewModel,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
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
        Column(Modifier.weight(1f)) {
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
    androidx.compose.material3.HorizontalDivider(
        modifier = Modifier.padding(horizontal = 16.dp),
        thickness = 0.5.dp,
        color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f),
    )
}
