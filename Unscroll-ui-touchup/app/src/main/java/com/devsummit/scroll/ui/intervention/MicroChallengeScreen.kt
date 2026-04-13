package com.devsummit.scroll.ui.intervention

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.PrimaryGlowButton
import com.devsummit.scroll.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun MicroChallengeScreen(
    onComplete: () -> Unit
) {
    val challenges = listOf("Drink Water", "Take a Deep Breath", "Hold button for 5 seconds")
    val selectedChallenge = remember { challenges.random() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Micro Challenge", color = NeonCyan, fontSize = 18.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(selectedChallenge, color = TextPrimary, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)

        Spacer(modifier = Modifier.height(48.dp))

        if (selectedChallenge == "Hold button for 5 seconds") {
            var holdProgress by remember { mutableStateOf(0f) }
            val animatedProgress by animateFloatAsState(targetValue = holdProgress, animationSpec = tween(100), label = "hold")

            LaunchedEffect(holdProgress) {
                if (holdProgress >= 1f) {
                    delay(500)
                    onComplete()
                }
            }

            Box(
                modifier = Modifier
                    .size(150.dp)
                    .clip(CircleShape)
                    .background(Charcoal)
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                val job = kotlinx.coroutines.GlobalScope.launch {
                                    while (holdProgress < 1f) {
                                        delay(50)
                                        holdProgress += 0.01f
                                    }
                                }
                                tryAwaitRelease()
                                job.cancel()
                                if (holdProgress < 1f) holdProgress = 0f
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    progress = { animatedProgress },
                    modifier = Modifier.fillMaxSize(),
                    color = NeonCyan,
                    strokeWidth = 12.dp,
                    trackColor = DarkGray
                )
                Text("HOLD", color = TextPrimary, fontWeight = FontWeight.Bold)
            }
        } else {
            PrimaryGlowButton(
                text = "Done",
                onClick = onComplete,
                color = NeonCyan
            )
        }
    }
}
