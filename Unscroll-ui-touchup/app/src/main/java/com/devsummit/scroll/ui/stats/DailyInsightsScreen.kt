package com.devsummit.scroll.ui.stats

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.theme.*

@Composable
fun DailyInsightsScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("< Back", color = TextSecondary) }
        }
        Text("Daily Insights", color = TextPrimary, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        
        Spacer(modifier = Modifier.height(24.dp))

        // Mock Bar Chart
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
                .background(Charcoal, androidx.compose.foundation.shape.RoundedCornerShape(16.dp))
                .padding(16.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.Bottom
            ) {
                MockBar(0.4f, "6 AM", NeonPurple)
                MockBar(0.7f, "9 AM", NeonPurple)
                MockBar(0.3f, "12 PM", NeonBlue)
                MockBar(0.9f, "3 PM", AlertRed)
                MockBar(0.6f, "6 PM", NeonPurple)
                MockBar(0.2f, "9 PM", NeonCyan)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Key Events", color = TextMuted, fontSize = 14.sp)
        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(1) {
                InsightRow(time = "3:15 PM", event = "Dopamine Spike: TikTok Opened", color = AlertRed)
                InsightRow(time = "10:00 AM", event = "Deep Focus: 45 min", color = NeonCyan)
                InsightRow(time = "8:00 AM", event = "Healthy Morning Routine", color = NeonBlue)
            }
        }
    }
}

@Composable
fun MockBar(progress: Float, label: String, color: androidx.compose.ui.graphics.Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Bottom, modifier = Modifier.fillMaxHeight()) {
        Box(modifier = Modifier.width(16.dp).fillMaxHeight(progress).background(color, androidx.compose.foundation.shape.RoundedCornerShape(4.dp)))
        Spacer(modifier = Modifier.height(8.dp))
        Text(label, color = TextMuted, fontSize = 10.sp)
    }
}

@Composable
fun InsightRow(time: String, event: String, color: androidx.compose.ui.graphics.Color) {
    Row(
        modifier = Modifier.fillMaxWidth().background(Charcoal, androidx.compose.foundation.shape.RoundedCornerShape(12.dp)).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(modifier = Modifier.size(12.dp).background(color, androidx.compose.foundation.shape.CircleShape))
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(time, color = TextMuted, fontSize = 12.sp)
            Text(event, color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        }
    }
}
