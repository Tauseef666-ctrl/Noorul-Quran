package com.noorulquran.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Emerald,
    onPrimary = Color.White,
    primaryContainer = EmeraldDarkUsed,
    onPrimaryContainer = InkPrimary,
    secondary = Gold,
    onSecondary = DeepBlack,
    secondaryContainer = GoldSoft,
    onSecondaryContainer = DeepBlack,
    tertiary = EmeraldLight,
    background = DeepBlack,
    onBackground = InkPrimary,
    surface = SurfaceDark,
    onSurface = InkPrimary,
    surfaceVariant = SurfaceElevated,
    onSurfaceVariant = InkMuted,
    outline = Line,
    outlineVariant = LineStrong,
    error = Danger,
    onError = Color.White,
)

private val LightColorScheme = lightColorScheme(
    primary = Emerald,
    onPrimary = Color.White,
    primaryContainer = EmeraldDarkUsed,
    onPrimaryContainer = InkPrimary,
    secondary = GoldSoft,
    onSecondary = DeepBlack,
    secondaryContainer = GoldFaint,
    onSecondaryContainer = DeepBlack,
    background = Color(0xFFF3F6F4),
    onBackground = Color(0xFF0E1312),
    surface = Color.White,
    onSurface = Color(0xFF0E1312),
    surfaceVariant = Color(0xFFE4EAE7),
    onSurfaceVariant = Color(0xFF3F4A46),
    outline = Color(0xFF8A9691),
    outlineVariant = Color(0xFFC5CECA),
    error = Danger,
)

@Composable
fun NoorulQuranTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = AppTypography,
        content = content,
    )
}
