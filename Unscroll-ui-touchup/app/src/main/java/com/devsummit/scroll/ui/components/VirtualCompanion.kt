package com.devsummit.scroll.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.devsummit.scroll.models.MentalState
import kotlinx.coroutines.delay

@Composable
fun VirtualCompanion(
    modifier: Modifier = Modifier,
    state: MentalState
) {
    var isBlinking by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        while (true) {
            delay((2000..5000).random().toLong())
            isBlinking = true
            delay(150)
            isBlinking = false
        }
    }

    val eyeColor = when (state) {
        MentalState.CALM -> Color(0xFF00FF94) // Greenish
        MentalState.SLIGHTLY_OVERSTIMULATED -> Color(0xFF00FFF0) // Cyan
        MentalState.OVERLOADED -> Color(0xFFBD00FF) // Purple
        MentalState.BURNOUT_RISK -> Color(0xFFFF3B3B) // Red
    }

    // Floating animation
    val infiniteTransition = rememberInfiniteTransition()
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = -5f,
        targetValue = 5f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = SineEasing),
            repeatMode = RepeatMode.Reverse
        ), label = "CatFloat"
    )

    Box(
        modifier = modifier
            .offset(y = floatOffset.dp)
            .size(80.dp)
            .clip(RoundedCornerShape(bottomStart = 40.dp, bottomEnd = 40.dp, topStart = 20.dp, topEnd = 20.dp))
            .background(Color(0xFF0A0A0A)), // Charcoal body
        contentAlignment = Alignment.Center
    ) {
        // Eyes
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, top = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Eye(color = eyeColor, isBlinking = isBlinking)
            Eye(color = eyeColor, isBlinking = isBlinking)
        }
    }
}

@Composable
fun Eye(color: Color, isBlinking: Boolean) {
    val scaleY by animateFloatAsState(targetValue = if (isBlinking) 0.1f else 1f, label = "EyeBlink")
    
    Box(
        modifier = Modifier
            .size(14.dp)
            .scale(scaleX = 1f, scaleY = scaleY)
    ) {
        // Glow
        Box(
            modifier = Modifier.fillMaxSize().padding(1.dp).clip(CircleShape).background(color.copy(alpha = 0.5f))
        )
        // Core
        Box(
            modifier = Modifier.fillMaxSize().padding(2.dp).clip(CircleShape).background(color)
        )
    }
}
