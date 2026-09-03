package com.noorulquran.app.ui.screens.about

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.ui.components.BrandMark
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted

@Composable
fun AboutScreen(navController: NavHostController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        BrandMark(size = 80)

        Spacer(Modifier.height(16.dp))

        Text(
            text = "NoorulQuran",
            style = MaterialTheme.typography.headlineLarge,
            color = Gold,
            fontWeight = FontWeight.Bold,
        )

        Spacer(Modifier.height(4.dp))

        Text(
            text = "Read. Listen. Reflect.",
            style = MaterialTheme.typography.bodyLarge,
            color = InkMuted,
        )

        Spacer(Modifier.height(32.dp))

        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Mission",
                        color = Gold,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp),
                    )
                    Text(
                        text = "NoorulQuran is a Quran reader built with reverence for the divine text. Every verse is presented verbatim from authoritative sources.",
                        color = InkMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                    )
                }
            }

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Text Integrity",
                        color = Gold,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp),
                    )
                    Text(
                        text = "The Arabic text is sourced from the Uthmani script, cross-verified against multiple authoritative references. Data integrity is verified at generation time.",
                        color = InkMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                    )
                }
            }

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Content Distinction",
                        color = Gold,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp),
                    )
                    Text(
                        text = "Arabic Quran text is immutable. Translations, tafsir, and commentary are human interpretations — clearly distinguished from the original.",
                        color = InkMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                    )
                }
            }

            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Technology",
                        color = Gold,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp),
                    )
                    Text(
                        text = "Native Android app built with Kotlin, Jetpack Compose, Media3, Room, Material3.",
                        color = InkMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                    )
                }
            }
        }

        Spacer(Modifier.height(40.dp))

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
