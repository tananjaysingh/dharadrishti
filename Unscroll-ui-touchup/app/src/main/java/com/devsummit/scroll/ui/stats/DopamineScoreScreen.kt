package com.devsummit.scroll.ui.stats

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.devsummit.scroll.models.getMentalState
import com.devsummit.scroll.ui.components.AnimatedMetricRing
import com.devsummit.scroll.ui.components.GlassCard
import com.devsummit.scroll.ui.theme.*
import com.devsummit.scroll.viewmodels.DashboardViewModel
import kotlin.math.roundToInt

@Composable
fun DopamineScoreScreen(
    onBack: () -> Unit,
    viewModel: DashboardViewModel = viewModel()
) {
    val bioMetrics by viewModel.bioMetrics.collectAsState()
    val score = (bioMetrics.dopamineLevel * 100).roundToInt()
    val state = bioMetrics.getMentalState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp)
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBack) {
                Text("< Back", color = TextSecondary)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = "Dopamine Overload",
            color = TextPrimary,
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Your brain's current stimulation level",
            color = TextMuted,
            fontSize = 16.sp,
            modifier = Modifier.padding(top = 8.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            AnimatedMetricRing(
                percentage = bioMetrics.dopamineLevel,
                color = if (score > 80) AlertRed else NeonCyan,
                modifier = Modifier.size(250.dp),
                strokeWidth = 32f
            )
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "$score%",
                    color = if (score > 80) AlertRed else NeonCyan,
                    fontSize = 64.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = state.name.replace("_", " "),
                    color = TextSecondary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        // Info Cards
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column {
                Text("What does this mean?", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "High dopamine overload leads to short attention spans, reduced motivation for hard tasks, and mild anxiety when bored. To lower this score, put your phone down and engage in lower-stimulation activities.",
                    color = TextSecondary,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }
    }
}
