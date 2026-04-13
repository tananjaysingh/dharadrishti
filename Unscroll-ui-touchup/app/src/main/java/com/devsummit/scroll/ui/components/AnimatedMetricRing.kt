package com.devsummit.scroll.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke

@Composable
fun AnimatedMetricRing(
    modifier: Modifier = Modifier,
    percentage: Float,
    color: Color,
    trackColor: Color = Color.DarkGray,
    strokeWidth: Float = 24f,
    blurOutline: Boolean = true
) {
    var animationPlayed by remember { mutableStateOf(false) }
    val currentPercentage = animateFloatAsState(
        targetValue = if (animationPlayed) percentage else 0f,
        animationSpec = tween(durationMillis = 1500, easing = FastOutSlowInEasing),
        label = "MetricRingAnimation"
    )

    LaunchedEffect(key1 = true) {
        animationPlayed = true
    }

    Box(modifier = modifier.aspectRatio(1f)) {
        if (blurOutline) {
            GlowAccent(
                modifier = Modifier.fillMaxSize(),
                color = color,
                shape = androidx.compose.foundation.shape.CircleShape
            )
        }
        Canvas(modifier = Modifier.fillMaxSize()) {
            val inset = strokeWidth / 2
            val size = Size(size.width - strokeWidth, size.height - strokeWidth)
            val center = Offset(size.width / 2 + inset, size.height / 2 + inset)

            // Draw track
            drawArc(
                color = trackColor,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = Offset(inset, inset),
                size = size,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )

            // Draw progress
            drawArc(
                color = color,
                startAngle = -90f,
                sweepAngle = 360 * currentPercentage.value,
                useCenter = false,
                topLeft = Offset(inset, inset),
                size = size,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
        }
    }
}
