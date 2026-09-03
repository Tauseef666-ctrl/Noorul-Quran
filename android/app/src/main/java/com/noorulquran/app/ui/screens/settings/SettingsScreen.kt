package com.noorulquran.app.ui.screens.settings

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.data.quran.ReciterCatalog
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(navController: NavHostController) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val settings = app.container.settings
    val scope = rememberCoroutineScope()

    val persistedArabicSize by settings.arabicSize.collectAsState(initial = 1f)
    val persistedUiSize by settings.uiSize.collectAsState(initial = 1f)
    val persistedReciter by settings.reciter.collectAsState(initial = "ar.alafasy")

    var arabicSize by remember(persistedArabicSize) { mutableFloatStateOf(persistedArabicSize) }
    var uiSize by remember(persistedUiSize) { mutableFloatStateOf(persistedUiSize) }
    var reciter by remember(persistedReciter) { mutableStateOf(persistedReciter) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        ScreenHeader(
            title = "Settings",
            subtitle = "Customize your reading experience"
        )

        Spacer(modifier = Modifier.height(24.dp))

        GlassCard {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Arabic Text Size",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "${String.format("%.1f", arabicSize)}x",
                    color = Gold,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Slider(
                    value = arabicSize,
                    onValueChange = { arabicSize = it },
                    onValueChangeFinished = {
                        scope.launch { settings.setArabicSize(arabicSize) }
                    },
                    valueRange = 0.8f..2.0f,
                    steps = 11,
                    colors = SliderDefaults.colors(
                        thumbColor = Gold,
                        activeTrackColor = Gold,
                        inactiveTrackColor = InkMuted
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("0.8x", color = InkMuted, fontSize = 12.sp)
                    Text("2.0x", color = InkMuted, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        GlassCard {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "UI Text Size",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "${String.format("%.1f", uiSize)}x",
                    color = Gold,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Slider(
                    value = uiSize,
                    onValueChange = { uiSize = it },
                    onValueChangeFinished = {
                        scope.launch { settings.setUiSize(uiSize) }
                    },
                    valueRange = 0.8f..2.0f,
                    steps = 11,
                    colors = SliderDefaults.colors(
                        thumbColor = Gold,
                        activeTrackColor = Gold,
                        inactiveTrackColor = InkMuted
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("0.8x", color = InkMuted, fontSize = 12.sp)
                    Text("2.0x", color = InkMuted, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        GlassCard {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Audio Reciter",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(12.dp))

                ReciterCatalog.ALL.forEach { reciterItem ->
                    val isSelected = reciter == reciterItem.id

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                reciter = reciterItem.id
                                scope.launch { settings.setReciter(reciterItem.id) }
                            }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(20.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isSelected) Gold else InkMuted.copy(alpha = 0.3f)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isSelected) {
                                Icon(
                                    imageVector = Icons.Filled.Check,
                                    contentDescription = "Selected",
                                    tint = MaterialTheme.colorScheme.background,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Text(
                            text = reciterItem.name,
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                            color = if (isSelected) Gold else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
