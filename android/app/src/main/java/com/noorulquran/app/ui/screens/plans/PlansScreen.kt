package com.noorulquran.app.ui.screens.plans

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.noorulquran.app.NoorulQuranApp
import com.noorulquran.app.data.local.DailyProgressEntity
import com.noorulquran.app.data.local.ReadingPlanEntity
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.components.GlassCard
import com.noorulquran.app.ui.components.ScreenHeader
import com.noorulquran.app.ui.theme.Danger
import com.noorulquran.app.ui.theme.Emerald
import com.noorulquran.app.ui.theme.Gold
import com.noorulquran.app.ui.theme.InkMuted
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun PlansScreen(navController: NavHostController) {
    val context = LocalContext.current
    val app = context.applicationContext as NoorulQuranApp
    val planDao = app.container.database.readingPlanDao()
    val progressDao = app.container.database.dailyProgressDao()
    val repo = app.container.quranRepository
    val scope = rememberCoroutineScope()

    val plans by planDao.observeAll().collectAsState(initial = emptyList())

    var deleteTarget by remember { mutableStateOf<ReadingPlanEntity?>(null) }

    Column(Modifier.fillMaxSize()) {
        ScreenHeader(
            title = "Reading Plans",
            subtitle = if (plans.isNotEmpty()) "${plans.size} active" else null,
            onBack = { navController.popBackStack() },
        )

        if (plans.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Choose a plan to start your reading journey",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkMuted,
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                item {
                    Text(
                        text = "Your Plans",
                        style = MaterialTheme.typography.titleMedium,
                        color = Gold,
                        modifier = Modifier.padding(vertical = 8.dp),
                    )
                }
                items(
                    items = plans,
                    key = { it.id },
                ) { plan ->
                    ActivePlanCard(
                        plan = plan,
                        onClick = {
                            navController.navigate(Routes.PLANS)
                        },
                        onDelete = { deleteTarget = plan },
                    )
                }

                item {
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = "Available Plans",
                        style = MaterialTheme.typography.titleMedium,
                        color = Gold,
                        modifier = Modifier.padding(vertical = 8.dp),
                    )
                }

                item {
                    PresetPlanCard(
                        name = "30-Day Plan",
                        description = "Complete the Quran in 30 days",
                        dailyTarget = 208,
                        enrolled = plans.any { it.name == "30-Day Plan" },
                        onEnroll = {
                            val todayISO = LocalDate.now().toString()
                            scope.launch {
                                planDao.upsert(
                                    ReadingPlanEntity(
                                        name = "30-Day Plan",
                                        dailyTarget = 208,
                                        startDate = todayISO,
                                        enrolledAt = System.currentTimeMillis(),
                                    )
                                )
                            }
                        },
                    )
                }

                item {
                    PresetPlanCard(
                        name = "60-Day Plan",
                        description = "Complete the Quran in 60 days",
                        dailyTarget = 104,
                        enrolled = plans.any { it.name == "60-Day Plan" },
                        onEnroll = {
                            val todayISO = LocalDate.now().toString()
                            scope.launch {
                                planDao.upsert(
                                    ReadingPlanEntity(
                                        name = "60-Day Plan",
                                        dailyTarget = 104,
                                        startDate = todayISO,
                                        enrolledAt = System.currentTimeMillis(),
                                    )
                                )
                            }
                        },
                    )
                }
            }
        }
    }

    deleteTarget?.let { plan ->
        AlertDialog(
            onDismissRequest = { deleteTarget = null },
            title = { Text("Unenroll from plan?") },
            text = { Text("Are you sure you want to leave \"${plan.name}\"? Your progress will be removed.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        scope.launch { planDao.delete(plan) }
                        deleteTarget = null
                    },
                ) {
                    Text("Delete", color = Danger)
                }
            },
            dismissButton = {
                TextButton(onClick = { deleteTarget = null }) {
                    Text("Cancel")
                }
            },
        )
    }
}

@Composable
private fun PresetPlanCard(
    name: String,
    description: String,
    dailyTarget: Int,
    enrolled: Boolean,
    onEnroll: () -> Unit,
) {
    GlassCard(
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column {
            Text(
                text = name,
                style = MaterialTheme.typography.titleMedium,
                color = Gold,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = InkMuted,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "$dailyTarget ayahs / day",
                style = MaterialTheme.typography.bodySmall,
                color = Emerald,
            )
            Spacer(Modifier.height(8.dp))
            Button(
                onClick = onEnroll,
                enabled = !enrolled,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Emerald,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                    disabledContainerColor = Emerald.copy(alpha = 0.4f),
                    disabledContentColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.5f),
                ),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(text = if (enrolled) "Enrolled" else "Enroll")
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ActivePlanCard(
    plan: ReadingPlanEntity,
    onClick: () -> Unit,
    onDelete: () -> Unit,
) {
    val startDate = try {
        LocalDate.parse(plan.startDate)
    } catch (_: Exception) {
        LocalDate.now()
    }
    val daysActive = ChronoUnit.DAYS.between(startDate, LocalDate.now()).toInt().coerceAtLeast(1)

    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .combinedClickable(
                onClick = onClick,
                onLongClick = onDelete,
            ),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text(
                    text = plan.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = Gold,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "${plan.dailyTarget} ayahs / day",
                    style = MaterialTheme.typography.bodySmall,
                    color = Emerald,
                )
                Text(
                    text = "Day $daysActive",
                    style = MaterialTheme.typography.bodySmall,
                    color = InkMuted,
                )
            }
            IconButton(onClick = onDelete) {
                Icon(
                    imageVector = Icons.Filled.Delete,
                    contentDescription = "Unenroll",
                    tint = Danger,
                )
            }
        }
    }
}
