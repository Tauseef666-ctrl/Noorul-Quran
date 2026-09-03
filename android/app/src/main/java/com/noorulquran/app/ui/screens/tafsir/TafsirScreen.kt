package com.noorulquran.app.ui.screens.tafsir

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.data.model.Surah
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TafsirScreen(navController: NavHostController) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val repo = app.container.quranRepository
    val api = app.container.api
    val scope = rememberCoroutineScope()

    var surahs by remember { mutableStateOf<List<Surah>?>(null) }
    var selectedSurah by remember { mutableStateOf<Surah?>(null) }
    var surahExpanded by remember { mutableStateOf(false) }

    var ayahCount by remember { mutableIntStateOf(1) }
    var selectedAyah by remember { mutableFloatStateOf(1f) }

    var tafsirText by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        surahs = repo.getSurahList()
    }

    LaunchedEffect(selectedSurah) {
        selectedSurah?.let { surah ->
            val detail = repo.getSurah(surah.number)
            ayahCount = detail?.ayahs?.size ?: surah.numberOfAyahs
            selectedAyah = 1f
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        ScreenHeader(
            title = "Tafsir",
            subtitle = "Commentary & Explanation",
            onBack = { navController.popBackStack() },
        )

        Spacer(Modifier.height(8.dp))

        GlassCard(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
        ) {
            Column {
                Text(
                    text = "Select Surah",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(Modifier.height(8.dp))

                ExposedDropdownMenuBox(
                    expanded = surahExpanded,
                    onExpandedChange = { surahExpanded = it },
                ) {
                    OutlinedTextField(
                        value = selectedSurah?.let { "${it.number}. ${it.nameTransliterated} (${it.nameTranslation})" }
                            ?: "",
                        onValueChange = {},
                        readOnly = true,
                        placeholder = { Text("Choose a surah…", color = InkMuted) },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = surahExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                        shape = RoundedCornerShape(12.dp),
                    )

                    ExposedDropdownMenu(
                        expanded = surahExpanded,
                        onDismissRequest = { surahExpanded = false },
                    ) {
                        surahs?.forEach { surah ->
                            DropdownMenuItem(
                                text = {
                                    Text("${surah.number}. ${surah.nameTransliterated} — ${surah.nameTranslation}")
                                },
                                onClick = {
                                    selectedSurah = surah
                                    surahExpanded = false
                                },
                            )
                        }
                    }
                }

                if (selectedSurah != null) {
                    Spacer(Modifier.height(16.dp))
                    Text(
                        text = "Ayah ${selectedAyah.toInt()} of $ayahCount",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Spacer(Modifier.height(8.dp))

                    Slider(
                        value = selectedAyah,
                        onValueChange = { selectedAyah = it },
                        valueRange = 1f..ayahCount.toFloat(),
                        steps = ayahCount - 2,
                        modifier = Modifier.fillMaxWidth(),
                        colors = SliderDefaults.colors(
                            thumbColor = Gold,
                            activeTrackColor = Gold,
                            inactiveTrackColor = InkMuted.copy(alpha = 0.3f),
                        ),
                    )

                    Spacer(Modifier.height(12.dp))

                    Button(
                        onClick = {
                            tafsirText = null
                            errorMessage = null
                            isLoading = true
                            scope.launch {
                                try {
                                    val translations = api.getTranslations(
                                        surahNumber = selectedSurah!!.number,
                                        ayahNumber = selectedAyah.toInt(),
                                        editionIds = listOf("en-tafisr-ibn-kathir"),
                                    )
                                    val text = translations.firstOrNull()?.text
                                    if (!text.isNullOrBlank()) {
                                        tafsirText = text
                                    } else {
                                        errorMessage = "Tafsir content requires internet connection"
                                    }
                                } catch (_: Exception) {
                                    errorMessage = "Tafsir content requires internet connection"
                                } finally {
                                    isLoading = false
                                }
                            }
                        },
                        enabled = !isLoading,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Gold),
                    ) {
                        Text(
                            text = if (isLoading) "Loading…" else "View Tafsir",
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(color = Gold)
                }
            }

            tafsirText != null -> {
                GlassCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                ) {
                    Column {
                        Text(
                            text = "${selectedSurah?.nameTransliterated} ${selectedSurah?.number}:${selectedAyah.toInt()}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Gold,
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = tafsirText!!,
                            style = MaterialTheme.typography.bodyLarge,
                            lineHeight = MaterialTheme.typography.bodyLarge.lineHeight,
                        )
                    }
                }
            }

            errorMessage != null -> {
                GlassCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                ) {
                    Text(
                        text = errorMessage!!,
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkMuted,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }

        Spacer(Modifier.height(24.dp))

        Text(
            text = "Tafsir content is sourced from publicly available editions",
            style = MaterialTheme.typography.bodySmall,
            color = InkMuted,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp),
        )

        Spacer(Modifier.height(16.dp))
    }
}
