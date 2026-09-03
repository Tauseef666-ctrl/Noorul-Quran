package com.noorulquran.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.noorulquran.app.ui.Routes
import com.noorulquran.app.ui.theme.DeepBlack
import com.noorulquran.app.ui.theme.Emerald
import com.noorulquran.app.ui.theme.Gold

private data class TabItem(
    val route: String,
    val label: String,
    val icon: ImageVector,
)

private val TABS = listOf(
    TabItem(Routes.HOME, "Home", Icons.Filled.Home),
    TabItem(Routes.SURAHS, "Quran", Icons.Filled.Book),
    TabItem(Routes.SEARCH, "Search", Icons.Filled.Search),
    TabItem(Routes.OFFLINE, "Offline", Icons.Filled.Download),
    TabItem(Routes.MORE, "More", Icons.Filled.MoreHoriz),
)

@Composable
fun BottomBar(navController: NavHostController, currentRoute: String?) {
    NavigationBar(
        containerColor = DeepBlack,
        tonalElevation = 0.dp,
    ) {
        val backStack = navController.currentBackStackEntryAsState().value
        val current = backStack?.destination?.route
        TABS.forEach { tab ->
            val selected = current == tab.route ||
                (tab.route == Routes.SURAHS && (current == Routes.SURAH))
            NavigationBarItem(
                selected = selected,
                onClick = {
                    if (current != tab.route) {
                        navController.navigate(tab.route) {
                            popUpTo(Routes.HOME) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                icon = {
                    Icon(
                        imageVector = tab.icon,
                        contentDescription = tab.label,
                        tint = if (selected) Gold else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                },
                label = {
                    Text(
                        text = tab.label,
                        fontSize = 10.sp,
                        color = if (selected) Gold else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Gold,
                    selectedTextColor = Gold,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    indicatorColor = Emerald.copy(alpha = 0.20f),
                ),
            )
        }
    }
}
