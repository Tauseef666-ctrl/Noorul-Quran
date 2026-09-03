package com.noorulquran.app.ui.screens.sources

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted

@Composable
fun SourcesScreen(navController: NavHostController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
    ) {
        ScreenHeader("Sources & Credits")

        val sections = listOf(
            "Quran Text" to "Uthmani script from Quran.com API v4, cross-verified against Al Quran Cloud. Bundled as canonical dataset with SHA-256 integrity.",
            "Translations" to "English: Sahih International (via Al Quran Cloud). Additional editions from Quran.com Foundation.",
            "Audio" to "Recitation audio streamed from Islamic Network CDN. 6 curated reciters.",
            "Tafsir" to "Ibn Kathir (English) from Quran.com Foundation.",
            "Fonts" to "Noto Naskh Arabic, Amiri, Amiri Quran.",
            "Tools" to "Built with Jetpack Compose, Kotlin, Media3, Room, OkHttp."
        )

        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            sections.forEach { (title, body) ->
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = title,
                            color = Gold,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        Text(
                            text = body,
                            color = InkMuted,
                            fontSize = 14.sp,
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            GlassCard(modifier = Modifier.fillMaxWidth().padding(top = 4.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "A Dua",
                        color = Gold,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                    Text(
                        text = "O Allah, make this app a means of benefit for everyone who uses it. Accept it as a humble effort in Your cause. Grant us all sincerity and forgive our shortcomings.",
                        color = InkMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )
                    Text(
                        text = "Integrity",
                        color = Gold,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                    Text(
                        text = "All Quran text and translations are sourced from verified, open-access foundations. Audio files are streamed directly from established Islamic CDN infrastructure. No content has been altered or paraphrased.",
                        color = InkMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )
                }
            }
        }
    }
}
