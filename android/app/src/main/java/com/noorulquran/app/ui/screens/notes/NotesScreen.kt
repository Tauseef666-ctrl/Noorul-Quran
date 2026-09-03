package com.noorulquran.app.ui.screens.notes

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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.StickyNote2
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.data.local.NoteEntity
import com.noorulquran.app.data.model.Surah
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Danger
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun NotesScreen(navController: NavHostController) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val noteDao = app.container.database.noteDao()
    val repo = app.container.quranRepository
    val scope = rememberCoroutineScope()

    val notes by noteDao.observeAll()
        .collectAsState(initial = emptyList())

    var surahs by remember { mutableStateOf<List<Surah>?>(null) }
    LaunchedEffect(Unit) {
        surahs = repo.getSurahList()
    }

    var noteToDelete by remember { mutableStateOf<NoteEntity?>(null) }

    Column(Modifier.fillMaxSize()) {
        ScreenHeader(
            title = "Notes",
            subtitle = if (notes.isNotEmpty()) "${notes.size} note${if (notes.size != 1) "s" else ""}" else null,
            onBack = { navController.popBackStack() },
        )

        if (notes.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Filled.StickyNote2,
                        contentDescription = null,
                        tint = InkMuted.copy(alpha = 0.4f),
                        modifier = Modifier.size(56.dp),
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = "No notes yet",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkMuted,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "Tap the note icon while reading to save verses",
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
                    items = notes,
                    key = { it.key },
                ) { note ->
                    NoteRow(
                        note = note,
                        surahName = surahs?.firstOrNull { it.number == note.surahNumber }?.nameTransliterated
                            ?: "Surah ${note.surahNumber}",
                        onDelete = { noteToDelete = note },
                        onClick = {
                            navController.navigate(Routes.surah(note.surahNumber))
                        },
                    )
                }
            }
        }
    }

    noteToDelete?.let { note ->
        AlertDialog(
            onDismissRequest = { noteToDelete = null },
            title = { Text("Delete note") },
            text = {
                Text("Are you sure you want to delete this note?")
            },
            confirmButton = {
                TextButton(onClick = {
                    scope.launch { noteDao.deleteByKey(note.key) }
                    noteToDelete = null
                }) {
                    Text("Delete", color = Danger)
                }
            },
            dismissButton = {
                TextButton(onClick = { noteToDelete = null }) {
                    Text("Cancel")
                }
            },
        )
    }
}

@Composable
private fun NoteRow(
    note: NoteEntity,
    surahName: String,
    onDelete: () -> Unit,
    onClick: () -> Unit,
) {
    val dateFormatted = remember(note.updatedAt) {
        SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(Date(note.updatedAt))
    }

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
                        text = "$surahName \u00B7 Ayah ${note.ayahNumber}",
                        style = MaterialTheme.typography.labelMedium,
                        color = Gold,
                    )
                    Text(
                        text = dateFormatted,
                        style = MaterialTheme.typography.bodySmall,
                        color = InkMuted.copy(alpha = 0.6f),
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Filled.Delete,
                        contentDescription = "Delete note",
                        tint = Danger,
                    )
                }
            }

            if (note.text.isNotBlank()) {
                Spacer(Modifier.height(6.dp))
                Text(
                    text = note.text,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
