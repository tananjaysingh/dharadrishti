package com.devsummit.scroll.ui.intervention

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Bedtime
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.PrimaryGlowButton
import com.devsummit.scroll.ui.theme.*

@Composable
fun SleepProtectionScreen(
    onForceUnlock: () -> Unit,
    onBackToSleep: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A050A)) // Very dark, slight purple tint (simulated blue-light reduction)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Outlined.Bedtime,
            contentDescription = "Sleep",
            tint = NeonPurple.copy(alpha = 0.5f),
            modifier = Modifier.size(80.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Sleep Protection Active",
            color = Color.LightGray,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "It's past midnight. Scrolling now may cost you tomorrow's focus.",
            color = Color.Gray,
            fontSize = 16.sp,
            textAlign = TextAlign.Center,
            lineHeight = 24.sp
        )

        Spacer(modifier = Modifier.height(48.dp))

        PrimaryGlowButton(
            text = "Back to Sleep",
            onClick = onBackToSleep,
            color = Color.DarkGray
        )

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(onClick = onForceUnlock) {
            Text("Unlock anyway (Lose 10 XP)", color = AlertRed.copy(alpha = 0.7f))
        }
    }
}
