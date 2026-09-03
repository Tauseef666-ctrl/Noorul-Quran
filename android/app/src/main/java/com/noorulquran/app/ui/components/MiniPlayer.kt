package com.noorulquran.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.theme.Emerald
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.SurfaceDark

/** Compact now-playing bar shown above the bottom nav while audio is active. */
@Composable
fun MiniPlayer(audioViewModel: AudioViewModel, navController: NavHostController) {
    val state by audioViewModel.uiState.collectAsState()
    AnimatedVisibility(
        visible = state.item != null,
        enter = slideInVertically { it },
        exit = slideOutVertically { it },
    ) {
        val item = state.item ?: return@AnimatedVisibility
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .background(SurfaceDark)
                .clickable {
                    item.surah?.let { navController.navigate(Routes.surah(it)) }
                }
                .padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Emerald.copy(alpha = 0.3f)),
                contentAlignment = Alignment.Center,
            ) { BrandMark(size = 24) }

            Box(Modifier.width(10.dp))

            androidx.compose.foundation.layout.Column(Modifier.weight(1f)) {
                Text(
                    text = item.title,
                    color = androidx.compose.ui.graphics.Color.White,
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = item.artist,
                    color = goldish(),
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }

            IconButton(onClick = { audioViewModel.toggle() }) {
                Icon(
                    imageVector = if (state.isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                    contentDescription = if (state.isPlaying) "Pause" else "Play",
                    tint = Gold,
                )
            }
        }
    }
}

@Composable
private fun goldish() = Gold
