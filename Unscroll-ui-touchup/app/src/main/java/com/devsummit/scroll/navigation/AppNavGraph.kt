package com.devsummit.scroll.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.devsummit.scroll.ui.auth.AuthScreen
import com.devsummit.scroll.ui.dashboard.DashboardScreen
import com.devsummit.scroll.ui.focus.FocusModeScreen
import com.devsummit.scroll.ui.intervention.FeedFadePreviewScreen
import com.devsummit.scroll.ui.intervention.IntentCheckScreen
import com.devsummit.scroll.ui.intervention.MicroChallengeScreen
import com.devsummit.scroll.ui.intervention.SleepProtectionScreen
import com.devsummit.scroll.ui.onboarding.OnboardingScreen
import com.devsummit.scroll.ui.onboarding.SplashScreen
import com.devsummit.scroll.ui.profile.ProfileScreen
import com.devsummit.scroll.ui.settings.SettingsScreen
import com.devsummit.scroll.ui.stats.DailyInsightsScreen
import com.devsummit.scroll.ui.stats.DopamineScoreScreen
import com.devsummit.scroll.ui.stats.ReverseStatsScreen
import com.devsummit.scroll.ui.stats.WeeklyProgressScreen

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Auth : Screen("auth")
    object Dashboard : Screen("dashboard")
    object DopamineScore : Screen("dopamine_score")
    object ReverseStats : Screen("reverse_stats")
    object IntentCheck : Screen("intent_check")
    object FeedFade : Screen("feed_fade")
    object FocusMode : Screen("focus_mode")
    object SleepProtection : Screen("sleep_protection")
    object MicroChallenge : Screen("micro_challenge")
    object DailyInsights : Screen("daily_insights")
    object WeeklyProgress : Screen("weekly_progress")
    object Settings : Screen("settings")
    object Profile : Screen("profile")
}

@Composable
fun AppNavGraph(
    navController: NavHostController,
    blacklistedApps: Set<String>,
    onTestOverlayClick: () -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(onSplashComplete = {
                navController.navigate(Screen.Onboarding.route) {
                    popUpTo(Screen.Splash.route) { inclusive = true }
                }
            })
        }

        composable(Screen.Onboarding.route) {
            OnboardingScreen(onFinish = {
                navController.navigate(Screen.Auth.route) {
                    popUpTo(Screen.Onboarding.route) { inclusive = true }
                }
            })
        }

        composable(Screen.Auth.route) {
            AuthScreen(onLoginSuccess = {
                navController.navigate(Screen.Dashboard.route) {
                    popUpTo(Screen.Auth.route) { inclusive = true }
                }
            })
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                blacklistedApps = blacklistedApps,
                onTestOverlayClick = {
                    navController.navigate(Screen.IntentCheck.route)
                }
            )
        }

        composable(Screen.IntentCheck.route) {
            IntentCheckScreen(
                appName = "Test App",
                onProceed = { navController.navigate(Screen.FeedFade.route) },
                onCancel = { navController.popBackStack() }
            )
        }

        composable(Screen.FeedFade.route) {
            FeedFadePreviewScreen(onBack = { navController.popBackStack() })
        }

        composable(Screen.Settings.route) {
            SettingsScreen()
        }
    }
}
