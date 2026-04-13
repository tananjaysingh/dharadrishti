package com.devsummit.scroll.ui.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.PrimaryGlowButton
import com.devsummit.scroll.ui.theme.*

data class OnboardingPage(val title: String, val description: String, val color: androidx.compose.ui.graphics.Color)

val pages = listOf(
    OnboardingPage("Reclaim Your Focus", "Stop letting algorithms hijack your dopamine.", NeonPurple),
    OnboardingPage("Bio-Aware Tracking", "Monitor your sleep debt, stress, and eye strain in real-time.", NeonBlue),
    OnboardingPage("Smart Interventions", "Get interrupted when you start doing things you didn't mean to.", NeonCyan)
)

@Composable
fun OnboardingScreen(
    onFinish: () -> Unit
) {
    var currentPage by remember { mutableStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        val page = pages[currentPage]

        Spacer(modifier = Modifier.weight(1f))

        // Visual Placeholder
        Box(
            modifier = Modifier
                .size(200.dp)
                .background(page.color.copy(alpha = 0.2f), shape = androidx.compose.foundation.shape.CircleShape)
        )

        Spacer(modifier = Modifier.weight(1f))

        Text(
            text = page.title,
            color = page.color,
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = page.description,
            color = TextSecondary,
            fontSize = 16.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        PrimaryGlowButton(
            text = if (currentPage == pages.size - 1) "Get Started" else "Next",
            onClick = {
                if (currentPage < pages.size - 1) {
                    currentPage++
                } else {
                    onFinish()
                }
            },
            color = page.color
        )

        Spacer(modifier = Modifier.height(32.dp))
    }
}
