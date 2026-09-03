package com.noorulquran.app.ui.screens.more

import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Headphones
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Source
import androidx.compose.material.icons.filled.StickyNote2
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.BrandMark
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted

private data class MoreItem(
    val title: String,
    val subtitle: String? = null,
    val icon: ImageVector,
    val route: String,
)

private data class MoreSection(
    val title: String,
    val items: List<MoreItem>,
)

@Composable
fun MoreScreen(navController: NavHostController) {
    val sections = listOf(
        MoreSection(
            title = "Reading",
            items = listOf(
                MoreItem("Daily Ayah", "Verse of the day", Icons.Filled.Refresh, Routes.DAILY),
                MoreItem("Reading Plans", null, Icons.Filled.CalendarMonth, Routes.PLANS),
                MoreItem("Tafsir", null, Icons.Filled.MenuBook, Routes.TAFSIR),
            ),
        ),
        MoreSection(
            title = "Personal",
            items = listOf(
                MoreItem("Bookmarks", null, Icons.Filled.Bookmark, Routes.BOOKMARKS),
                MoreItem("Notes", null, Icons.Filled.StickyNote2, Routes.NOTES),
                MoreItem("Offline Downloads", null, Icons.Filled.Download, Routes.OFFLINE),
            ),
        ),
        MoreSection(
            title = "Audio",
            items = listOf(
                MoreItem("Listen", null, Icons.Filled.Headphones, Routes.LISTEN),
            ),
        ),
        MoreSection(
            title = "App",
            items = listOf(
                MoreItem("Settings", null, Icons.Filled.Settings, Routes.SETTINGS),
                MoreItem("Sources & Credits", null, Icons.Filled.Source, Routes.SOURCES),
                MoreItem("About", null, Icons.Filled.Info, Routes.ABOUT),
            ),
        ),
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            BrandMark(size = 48)
            Spacer(Modifier.width(12.dp))
            Column {
                Text(
                    text = "NoorulQuran",
                    style = MaterialTheme.typography.headlineLarge,
                    color = Gold,
                )
                Text(
                    text = "v1.0.0",
                    style = MaterialTheme.typography.bodyMedium,
                    color = InkMuted,
                )
            }
        }

        Spacer(Modifier.height(24.dp))

        sections.forEach { section ->
            Text(
                text = section.title,
                style = MaterialTheme.typography.titleMedium,
                color = Gold,
                modifier = Modifier.padding(bottom = 8.dp),
            )
            GlassCard(Modifier.fillMaxWidth()) {
                Column {
                    section.items.forEachIndexed { index, item ->
                        if (index > 0) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(0.5.dp)
                                    .padding(horizontal = 48.dp)
                                    .background(MaterialTheme.colorScheme.outlineVariant),
                            )
                        }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { navController.navigate(item.route) }
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.title,
                                tint = Gold,
                                modifier = Modifier.size(22.dp),
                            )
                            Spacer(Modifier.width(14.dp))
                            Column(Modifier.weight(1f)) {
                                Text(
                                    text = item.title,
                                    style = MaterialTheme.typography.titleMedium,
                                )
                                if (item.subtitle != null) {
                                    Text(
                                        text = item.subtitle,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = InkMuted,
                                    )
                                }
                            }
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                                contentDescription = null,
                                tint = InkMuted,
                                modifier = Modifier.size(20.dp),
                            )
                        }
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        Spacer(Modifier.height(8.dp))
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
