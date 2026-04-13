package com.devsummit.scroll.ui.intervention

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.PrimaryGlowButton
import com.devsummit.scroll.ui.theme.*

@Composable
fun IntentCheckScreen(
    appName: String = "Instagram",
    onProceed: (String) -> Unit,
    onCancel: () -> Unit
) {
    var selectedIntent by remember { mutableStateOf<String?>(null) }
    
    val intents = listOf(
        "Chat with a friend",
        "Watch 1 reel",
        "Upload content",
        "Reply to messages",
        "Just bored"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black.copy(alpha = 0.95f))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        
        // Modal Sheet Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(32.dp))
                .background(Charcoal)
                .border(1.dp, NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(32.dp))
                .padding(32.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Reality Check",
                    color = NeonPurple,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Why are you opening $appName?",
                    color = TextPrimary,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(32.dp))

                intents.forEach { intent ->
                    IntentOption(
                        text = intent, 
                        isSelected = selectedIntent == intent,
                        onClick = { selectedIntent = intent }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                Spacer(modifier = Modifier.height(32.dp))

                PrimaryGlowButton(
                    text = "Unlock $appName",
                    onClick = { selectedIntent?.let { onProceed(it) } },
                    enabled = selectedIntent != null,
                    color = NeonPurple
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                TextButton(onClick = onCancel) {
                    Text("Nevermind, I'll close it.", color = TextSecondary)
                }
            }
        }
    }
}

@Composable
fun IntentOption(text: String, isSelected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(if (isSelected) NeonPurple.copy(alpha = 0.2f) else DarkGray)
            .border(
                1.dp, 
                if (isSelected) NeonPurple else Color(0xFF222222), 
                RoundedCornerShape(16.dp)
            )
            .clickable { onClick() }
            .padding(16.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Text(
            text = text,
            color = if (isSelected) TextPrimary else TextSecondary,
            fontSize = 16.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}
