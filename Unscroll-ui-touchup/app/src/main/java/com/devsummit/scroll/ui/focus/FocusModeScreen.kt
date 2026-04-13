package com.devsummit.scroll.ui.focus

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Headphones
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.NotificationsOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.PrimaryGlowButton
import com.devsummit.scroll.ui.components.GlassCard
import com.devsummit.scroll.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun FocusModeScreen(onBack: () -> Unit) {
    var isRunning by remember { mutableStateOf(false) }
    var timeRemaining by remember { mutableStateOf(25 * 60) } // 25 minutes
    
    LaunchedEffect(isRunning) {
        if (isRunning) {
            while (timeRemaining > 0) {
                delay(1000)
                timeRemaining--
            }
        }
    }

    val minutes = timeRemaining / 60
    val seconds = timeRemaining % 60
    val timeFormatted = String.format("%02d:%02d", minutes, seconds)
    val progress = (25 * 60 - timeRemaining) / (25 * 60f)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = { if (!isRunning) onBack() }) {
                Text(if (isRunning) "" else "< Back", color = TextSecondary)
            }
            Text("Focus Streak: 3", color = NeonPurple, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.weight(1f))

        // Timer Circle
        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(300.dp)) {
            // Pulse animation when running
            val infiniteTransition = rememberInfiniteTransition(label = "pulse")
            val pulseRatio by infiniteTransition.animateFloat(
                initialValue = 1f,
                targetValue = if (isRunning) 1.2f else 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(2000, easing = SineEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "pulseAnim"
            )

            Box(
                modifier = Modifier
                    .fillMaxSize(pulseRatio)
                    .clip(CircleShape)
                    .background(Color(0xFF110522))
            )

            Canvas(modifier = Modifier.fillMaxSize()) {
                val strokeW = 12.dp.toPx()
                // Track
                drawCircle(
                    color = Color.DarkGray.copy(alpha = 0.3f),
                    radius = size.width / 2 - strokeW,
                    style = Stroke(width = strokeW)
                )
                // Progress
                drawArc(
                    brush = Brush.sweepGradient(GradientPurple),
                    startAngle = -90f,
                    sweepAngle = progress * 360f,
                    useCenter = false,
                    style = Stroke(width = strokeW, cap = StrokeCap.Round)
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = timeFormatted,
                    color = TextPrimary,
                    fontSize = 64.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 2.sp
                )
                Text(
                    text = if (isRunning) "Deep Work" else "Ready to Lock In?",
                    color = TextMuted,
                    fontSize = 16.sp,
                    letterSpacing = 2.sp
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Active Features
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            FeatureIconBadge(Icons.Outlined.NotificationsOff, "Muted")
            FeatureIconBadge(Icons.Outlined.Lock, "Apps Blocked")
            FeatureIconBadge(Icons.Outlined.Headphones, "White Noise")
        }

        Spacer(modifier = Modifier.height(48.dp))

        PrimaryGlowButton(
            text = if (isRunning) "Give Up (Lose Streak)" else "Start 25m Focus",
            onClick = { isRunning = !isRunning },
            color = if (isRunning) Color.DarkGray else NeonPurple
        )
    }
}

@Composable
fun FeatureIconBadge(icon: ImageVector, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .background(Charcoal, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = label, tint = NeonPurple)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = label, color = TextSecondary, fontSize = 12.sp)
    }
}
