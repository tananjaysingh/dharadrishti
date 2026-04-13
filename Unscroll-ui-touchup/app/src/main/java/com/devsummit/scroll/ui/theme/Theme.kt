package com.devsummit.scroll.ui.theme

import android.app.Activity
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat

private val UnscrollColorScheme = darkColorScheme(
    primary = NeonPurple,
    onPrimary = Color.White,
    primaryContainer = Charcoal,
    onPrimaryContainer = NeonPurple,
    secondary = NeonBlue,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFF121212),
    onSecondaryContainer = NeonBlue,
    tertiary = NeonCyan,
    onTertiary = Color.Black,
    error = AlertRed,
    onError = Color.White,
    errorContainer = Color(0xFF2D0000),
    onErrorContainer = AlertRed,
    background = Black,
    onBackground = TextPrimary,
    surface = Charcoal,
    onSurface = TextPrimary,
    surfaceVariant = DarkGray,
    onSurfaceVariant = TextSecondary,
    outline = TextMuted,
    outlineVariant = Color(0xFF333333)
)

private val UnscrollShapes = Shapes(
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(20.dp),
    large = RoundedCornerShape(32.dp),
    extraLarge = RoundedCornerShape(40.dp)
)

@Composable
fun UnscrollTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = UnscrollColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val context = view.context
            if (context is Activity) {
                val window = context.window
                window.statusBarColor = Black.toArgb()
                window.navigationBarColor = Black.toArgb()
                WindowCompat.getInsetsController(window, view).apply {
                    isAppearanceLightStatusBars = false
                    isAppearanceLightNavigationBars = false
                }
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = UnscrollShapes,
        content = content
    )
}
