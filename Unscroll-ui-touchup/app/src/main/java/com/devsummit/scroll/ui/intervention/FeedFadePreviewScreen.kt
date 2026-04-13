package com.devsummit.scroll.ui.intervention

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.PrimaryGlowButton
import com.devsummit.scroll.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun FeedFadePreviewScreen(onBack: () -> Unit) {
    var isFading by remember { mutableStateOf(false) }

    // Animate to grayscale / muted colors
    val cardColor by animateColorAsState(
        targetValue = if (isFading) Color.DarkGray else Charcoal,
        animationSpec = tween(5000),
        label = "fadeCard"
    )
    
    val accentColor by animateColorAsState(
        targetValue = if (isFading) Color.Gray else NeonPurple,
        animationSpec = tween(5000),
        label = "fadeAccent"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(if (isFading) Color(0xFF050505) else Black)
    ) {
        // Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBack) {
                Text("< Back", color = TextSecondary)
            }
            Text("Feed Fade", color = accentColor, fontWeight = FontWeight.Bold)
        }

        Box(modifier = Modifier.weight(1f)) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(10) { index ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(250.dp)
                            .background(cardColor, shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isFading && index > 2) {
                            Text("Content blurred by Unscroll", color = Color.Gray)
                        } else {
                            Text("Simulated Content ${index + 1}", color = accentColor)
                        }
                    }
                }
            }

            // Overlay message
            if (isFading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .padding(24.dp)
                        .background(Color.Black.copy(alpha = 0.8f), androidx.compose.foundation.shape.RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "Feed Fade Active",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            "You have been scrolling for 45 minutes. The interface is now less stimulating.",
                            color = Color.LightGray,
                            fontSize = 12.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
            }
        }

        // Action Button
        PaddingValues(24.dp).let {
            PrimaryGlowButton(
                modifier = Modifier.padding(24.dp),
                text = if (isFading) "Restore Feed" else "Simulate Doomscrolling",
                onClick = { isFading = !isFading },
                color = accentColor
            )
        }
    }
}
