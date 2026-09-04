package com.noorulquran.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.noorulquran.app.ui.theme.Emerald
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.GoldDivider

/** Rub el Hizb (۞) octagram brand mark rendered with Compose Canvas. */
@Composable
fun BrandMark(size: Int = 48) {
    Canvas(modifier = Modifier.size(size.dp)) {
        val px = this.size.width
        val center = Offset(px / 2f, px / 2f)
        val r = px / 2f
        val r2 = r * 0.7071f
        val stroke = px * 0.05f

        // Upright + 45° squares (octagram)
        fun square(rot: Float) {
            val s = r * 1.35f
            val half = s / 2f
            val path = Path().apply {
                moveTo(center.x + half * kotlin.math.cos(rot) - half * kotlin.math.sin(rot), center.y + half * kotlin.math.sin(rot) + half * kotlin.math.cos(rot))
                lineTo(center.x - half * kotlin.math.cos(rot) - half * kotlin.math.sin(rot), center.y - half * kotlin.math.sin(rot) + half * kotlin.math.cos(rot))
                lineTo(center.x - half * kotlin.math.cos(rot) + half * kotlin.math.sin(rot), center.y - half * kotlin.math.sin(rot) - half * kotlin.math.cos(rot))
                lineTo(center.x + half * kotlin.math.cos(rot) + half * kotlin.math.sin(rot), center.y + half * kotlin.math.sin(rot) - half * kotlin.math.cos(rot))
                close()
            }
            drawPath(path, color = Gold, style = Stroke(width = stroke))
        }
        square(0f)
        square(Math.PI.toFloat() / 4f)

        // Noor glow (soft filled octagram center)
        drawCircle(color = Gold.copy(alpha = 0.15f), radius = r2, center = center)

        // Filled crescent opening right + mote
        drawArc(
            color = Emerald,
            startAngle = 200f,
            sweepAngle = 200f,
            useCenter = false,
            topLeft = Offset(center.x - r2, center.y - r2),
            size = androidx.compose.ui.geometry.Size(r2 * 2, r2 * 2),
            style = Stroke(width = r2 * 0.30f, cap = StrokeCap.Round),
        )
        drawCircle(color = Gold, radius = r2 * 0.10f, center = Offset(center.x + r2 * 0.55f, center.y))
    }
}

/** Gold divider line used between sections. */
@Composable
fun GoldDividerLine(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(1.dp)
            .background(GoldDivider),
    )
}

/** Glass-style elevated card matching the app's luxury theme. */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Box(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.surface)
                .padding(16.dp),
        ) { content() }
    }
}

@Composable
fun ScreenHeader(title: String, subtitle: String? = null, onBack: (() -> Unit)? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (onBack != null) {
            AppIconButton(onClick = onBack, contentDescription = "Back")
            Spacer(Modifier.size(12.dp))
        }
        androidx.compose.foundation.layout.Column {
            Text(text = title, style = MaterialTheme.typography.headlineMedium)
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
fun AppIconButton(
    onClick: () -> Unit,
    contentDescription: String,
    modifier: Modifier = Modifier,
) {
    androidx.compose.material3.IconButton(onClick = onClick, modifier = modifier) {
        androidx.compose.material3.Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = contentDescription,
            tint = MaterialTheme.colorScheme.onSurface,
        )
    }
}
