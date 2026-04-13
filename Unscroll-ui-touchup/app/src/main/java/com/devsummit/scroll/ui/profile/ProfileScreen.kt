package com.devsummit.scroll.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.GlassCard
import com.devsummit.scroll.ui.theme.*

@Composable
fun ProfileScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBack) { Text("< Back", color = TextSecondary) }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Box(
            modifier = Modifier
                .size(120.dp)
                .clip(CircleShape)
                .background(Charcoal),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Outlined.Person, contentDescription = "Profile", tint = TextSecondary, modifier = Modifier.size(64.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text("Gen Z User", color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("Joined Oct 2026", color = TextMuted, fontSize = 14.sp)

        Spacer(modifier = Modifier.height(48.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            StatsBadge("Current Streak", "12 Days", NeonCyan, Modifier.weight(1f))
            StatsBadge("Total XP", "4,500", NeonPurple, Modifier.weight(1f))
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("Badges Earned", color = TextSecondary, align = Alignment.Start, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(16.dp))
        Row {
            Icon(Icons.Filled.Star, contentDescription = null, tint = NeonCyan, modifier = Modifier.size(40.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Icon(Icons.Filled.Star, contentDescription = null, tint = NeonPurple, modifier = Modifier.size(40.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Icon(Icons.Filled.Star, contentDescription = null, tint = DarkGray, modifier = Modifier.size(40.dp))
        }
    }
}

@Composable
fun StatsBadge(label: String, value: String, color: androidx.compose.ui.graphics.Color, modifier: Modifier) {
    GlassCard(
        modifier = modifier.height(100.dp),
        borderColor = color.copy(alpha = 0.3f),
        backgroundColor = Charcoal
    ) {
        Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, color = color, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
            Text(label, color = TextMuted, fontSize = 12.sp)
        }
    }
}
