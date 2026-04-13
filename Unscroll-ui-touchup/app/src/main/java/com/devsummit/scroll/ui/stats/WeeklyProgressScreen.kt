package com.devsummit.scroll.ui.stats

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.theme.*

@Composable
fun WeeklyProgressScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("< Back", color = TextSecondary) }
        }
        Text("Weekly Progress", color = TextPrimary, fontSize = 28.sp, fontWeight = FontWeight.Bold)

        Spacer(modifier = Modifier.height(32.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp)
                .background(Charcoal, androidx.compose.foundation.shape.RoundedCornerShape(16.dp))
                .padding(24.dp)
        ) {
            // Simulated line chart
            Canvas(modifier = Modifier.fillMaxSize()) {
                val points = listOf(
                    androidx.compose.ui.geometry.Offset(0f, size.height * 0.8f),
                    androidx.compose.ui.geometry.Offset(size.width * 0.2f, size.height * 0.6f),
                    androidx.compose.ui.geometry.Offset(size.width * 0.4f, size.height * 0.9f),
                    androidx.compose.ui.geometry.Offset(size.width * 0.6f, size.height * 0.5f),
                    androidx.compose.ui.geometry.Offset(size.width * 0.8f, size.height * 0.3f),
                    androidx.compose.ui.geometry.Offset(size.width, size.height * 0.2f)
                )

                for (i in 0 until points.size - 1) {
                    drawLine(
                        color = NeonCyan,
                        start = points[i],
                        end = points[i+1],
                        strokeWidth = 8f,
                        cap = androidx.compose.ui.graphics.StrokeCap.Round
                    )
                }

                points.forEach { pt ->
                    drawCircle(color = NeonPurple, center = pt, radius = 12f)
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = "Your average screen time is down 18% compared to last week. Focus blocks have increased by 2.3 hours.",
            color = TextSecondary,
            fontSize = 16.sp,
            lineHeight = 24.sp
        )
    }
}
