package com.noorulquran.app.ui.screens.search

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.data.model.Ayah
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay

private const val TRANSLATION_EDITION = "en.sahihinternational"
private const val MAX_RESULTS = 200
private const val DEBOUNCE_MS = 300L

private enum class SearchMode(val label: String) {
    ALL("All"),
    ARABIC("Arabic"),
    TRANSLATION("Translation"),
}

private data class SearchResult(
    val surahNumber: Int,
    val ayahNumber: Int,
    val arabic: String,
    val translation: String?,
    val surahName: String,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(navController: NavHostController) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val repo = app.container.quranRepository
    val api = app.container.api
    val audioViewModel: AudioViewModel = viewModel()

    var query by remember { mutableStateOf("") }
    var mode by remember { mutableStateOf(SearchMode.ALL) }
    var results by remember { mutableStateOf<List<SearchResult>>(emptyList()) }
    var isSearching by remember { mutableStateOf(false) }
    var hasSearched by remember { mutableStateOf(false) }
    var allAyahs by remember { mutableStateOf<List<Ayah>>(emptyList()) }
    var surahNames by remember { mutableStateOf<Map<Int, String>>(emptyMap()) }
    val translationCache = remember { mutableStateMapOf<Int, Map<Int, String>>() }

    val focusRequester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        val surahList = repo.getSurahList()
        surahNames = surahList.associate { it.number to it.nameTransliterated }
        val ayahs = mutableListOf<Ayah>()
        for (s in 1..114) {
            repo.getSurah(s)?.let { ayahs.addAll(it.ayahs) }
        }
        allAyahs = ayahs
        focusRequester.requestFocus()
    }

    LaunchedEffect(query, mode) {
        if (query.isBlank()) {
            results = emptyList()
            hasSearched = false
            isSearching = false
            return@LaunchedEffect
        }

        isSearching = true
        delay(DEBOUNCE_MS)

        val q = query.trim()
        val found = mutableListOf<SearchResult>()

        if (mode == SearchMode.ALL || mode == SearchMode.ARABIC) {
            for (ayah in allAyahs) {
                if (ayah.arabic.contains(q, ignoreCase = true)) {
                    found.add(
                        SearchResult(
                            surahNumber = ayah.surahNumber,
                            ayahNumber = ayah.ayahNumber,
                            arabic = ayah.arabic,
                            translation = null,
                            surahName = surahNames[ayah.surahNumber]
                                ?: "Surah ${ayah.surahNumber}",
                        )
                    )
                }
            }
        }

        if (mode == SearchMode.ALL || mode == SearchMode.TRANSLATION) {
            val allTranslations = coroutineScope {
                (1..114).map { s ->
                    async {
                        s to (translationCache[s] ?: run {
                            try {
                                val raw = api.getSurahTranslations(
                                    s,
                                    listOf(TRANSLATION_EDITION),
                                )
                                raw.mapValues { (_, ed) -> ed.values.firstOrNull() ?: "" }
                            } catch (_: Exception) {
                                emptyMap()
                            }
                        })
                    }
                }.awaitAll()
            }
            for ((s, txMap) in allTranslations) {
                translationCache[s] = txMap
                for ((ayahNum, text) in txMap) {
                    if (text.contains(q, ignoreCase = true)) {
                        val isDuplicate = found.any {
                            it.surahNumber == s && it.ayahNumber == ayahNum
                        }
                        if (!isDuplicate) {
                            val ayah = allAyahs.firstOrNull {
                                it.surahNumber == s && it.ayahNumber == ayahNum
                            }
                            found.add(
                                SearchResult(
                                    surahNumber = s,
                                    ayahNumber = ayahNum,
                                    arabic = ayah?.arabic ?: "",
                                    translation = text,
                                    surahName = surahNames[s] ?: "Surah $s",
                                )
                            )
                        }
                    }
                }
            }
        }

        results = found.take(MAX_RESULTS)
        isSearching = false
        hasSearched = true
    }

    Column(Modifier.fillMaxSize()) {
        ScreenHeader(title = "Search", onBack = { navController.popBackStack() })

        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            placeholder = { Text("Search the Quran\u2026") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = null,
                    tint = InkMuted,
                )
            },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .focusRequester(focusRequester),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Gold,
                unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
            ),
        )

        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            SearchMode.entries.forEach { m ->
                FilterChip(
                    selected = mode == m,
                    onClick = { mode = m },
                    label = { Text(m.label) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Gold.copy(alpha = 0.15f),
                        selectedLabelColor = Gold,
                    ),
                )
            }
        }

        Spacer(Modifier.height(8.dp))

        when {
            isSearching -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Gold)
                    if (translationCache.isEmpty() &&
                        (mode == SearchMode.ALL || mode == SearchMode.TRANSLATION)
                    ) {
                        Spacer(Modifier.height(12.dp))
                        Text(
                            text = "Loading translations\u2026",
                            style = MaterialTheme.typography.bodyMedium,
                            color = InkMuted,
                        )
                    }
                }
            }

            !hasSearched -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Filled.Search,
                        contentDescription = null,
                        tint = InkMuted.copy(alpha = 0.4f),
                        modifier = Modifier.size(48.dp),
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = "Type to search the Quran",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkMuted,
                    )
                }
            }

            results.isEmpty() -> Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "No results found",
                    style = MaterialTheme.typography.bodyLarge,
                    color = InkMuted,
                )
            }

            else -> LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(
                    horizontal = 16.dp,
                    vertical = 4.dp,
                ),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                if (results.size >= MAX_RESULTS) {
                    item {
                        Text(
                            text = "Showing first $MAX_RESULTS results. Refine your search.",
                            style = MaterialTheme.typography.bodySmall,
                            color = InkMuted,
                            modifier = Modifier.padding(vertical = 4.dp),
                        )
                    }
                }
                items(
                    items = results,
                    key = { "${it.surahNumber}:${it.ayahNumber}" },
                ) { result ->
                    SearchResultRow(
                        result = result,
                        query = query,
                        navController = navController,
                        onPlay = {
                            audioViewModel.playAyah(result.surahNumber, result.ayahNumber)
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun SearchResultRow(
    result: SearchResult,
    query: String,
    navController: NavHostController,
    onPlay: () -> Unit,
) {
    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { navController.navigate(Routes.surah(result.surahNumber)) },
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        text = "${result.surahName} \u00B7 Ayah ${result.ayahNumber}",
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
            }

            Text(
                text = highlightedText(result.arabic, query),
                fontSize = 20.sp,
                lineHeight = 30.sp,
                color = Color.White,
            )

            if (!result.translation.isNullOrBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = result.translation,
                    style = MaterialTheme.typography.bodyMedium,
                    color = InkMuted,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

private fun highlightedText(text: String, query: String): androidx.compose.ui.text.AnnotatedString {
    return buildAnnotatedString {
        if (query.isBlank()) {
            append(text)
            return@buildAnnotatedString
        }
        val lower = text.lowercase()
        val qLower = query.lowercase()
        var start = 0
        var idx = lower.indexOf(qLower, start)
        while (idx >= 0) {
            append(text.substring(start, idx))
            withStyle(
                SpanStyle(
                    color = Gold,
                    fontWeight = FontWeight.Bold,
                )
            ) {
                append(text.substring(idx, idx + query.length))
            }
            start = idx + query.length
            idx = lower.indexOf(qLower, start)
        }
        append(text.substring(start))
    }
}
