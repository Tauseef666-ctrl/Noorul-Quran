package com.noorulquran.app.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.noorulquran.app.audio.AudioViewModel
import com.noorulquran.app.ui.components.BottomBar
import com.noorulquran.app.ui.components.MiniPlayer
import com.noorulquran.app.ui.screens.about.AboutScreen
import com.noorulquran.app.ui.screens.bookmarks.BookmarksScreen
import com.noorulquran.app.ui.screens.daily.DailyAyahScreen
import com.noorulquran.app.ui.screens.home.HomeScreen
import com.noorulquran.app.ui.screens.listen.ListenScreen
import com.noorulquran.app.ui.screens.more.MoreScreen
import com.noorulquran.app.ui.screens.notes.NotesScreen
import com.noorulquran.app.ui.screens.offline.OfflineScreen
import com.noorulquran.app.ui.screens.plans.PlansScreen
import com.noorulquran.app.ui.screens.search.SearchScreen
import com.noorulquran.app.ui.screens.settings.SettingsScreen
import com.noorulquran.app.ui.screens.sources.SourcesScreen
import com.noorulquran.app.ui.screens.surahs.SurahListScreen
import com.noorulquran.app.ui.screens.surahs.SurahReaderScreen
import com.noorulquran.app.ui.screens.tafsir.TafsirScreen

/** Top-level routes that live in the bottom bar. */
object Routes {
    const val HOME = "home"
    const val SURAHS = "surahs"
    const val SEARCH = "search"
    const val OFFLINE = "offline"
    const val MORE = "more"

    const val SURAH = "surah/{surahId}"
    const val BOOKMARKS = "bookmarks"
    const val NOTES = "notes"
    const val DAILY = "daily"
    const val PLANS = "plans"
    const val TAFSIR = "tafsir"
    const val LISTEN = "listen"
    const val SETTINGS = "settings"
    const val SOURCES = "sources"
    const val ABOUT = "about"

    fun surah(id: Int) = "surah/$id"
}

@Composable
fun NoorulQuranRoot(
    audioViewModel: AudioViewModel = viewModel(),
) {
    val navController = rememberNavController()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    RequestNotificationPermissionIfNeeded()

    val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route

    Box(Modifier.fillMaxSize()) {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbarHostState) },
            bottomBar = { BottomBar(navController = navController, currentRoute = currentRoute) },
        ) { padding ->
            NavHost(
                navController = navController,
                startDestination = Routes.HOME,
                modifier = Modifier.padding(padding),
            ) {
                composable(Routes.HOME) { HomeScreen(navController, audioViewModel) }
                composable(Routes.SURAHS) { SurahListScreen(navController, audioViewModel) }
                composable(Routes.SEARCH) { SearchScreen(navController) }
                composable(Routes.OFFLINE) { OfflineScreen(navController) }
                composable(Routes.MORE) { MoreScreen(navController) }

                composable(
                    route = Routes.SURAH,
                    arguments = listOf(navArgument("surahId") { type = NavType.IntType }),
                ) { entry ->
                    val id = entry.arguments?.getInt("surahId") ?: 1
                    SurahReaderScreen(surahId = id, navController = navController, audioViewModel = audioViewModel)
                }
                composable(Routes.BOOKMARKS) { BookmarksScreen(navController, audioViewModel) }
                composable(Routes.NOTES) { NotesScreen(navController) }
                composable(Routes.DAILY) { DailyAyahScreen(navController, audioViewModel) }
                composable(Routes.PLANS) { PlansScreen(navController) }
                composable(Routes.TAFSIR) { TafsirScreen(navController) }
                composable(Routes.LISTEN) { ListenScreen(navController, audioViewModel) }
                composable(Routes.SETTINGS) { SettingsScreen(navController) }
                composable(Routes.SOURCES) { SourcesScreen(navController) }
                composable(Routes.ABOUT) { AboutScreen(navController) }
            }
        }

        MiniPlayer(audioViewModel = audioViewModel, navController = navController)
    }
}

@Composable
private fun RequestNotificationPermissionIfNeeded() {
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { }
    if (Build.VERSION.SDK_INT >= 33 &&
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
        != PackageManager.PERMISSION_GRANTED
    ) {
        LaunchedEffect(Unit) {
            launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}
