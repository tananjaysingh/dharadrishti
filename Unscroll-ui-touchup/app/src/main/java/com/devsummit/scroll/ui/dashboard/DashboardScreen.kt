package com.devsummit.scroll.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.devsummit.scroll.models.getMentalState
import com.devsummit.scroll.ui.components.AnimatedMetricRing
import com.devsummit.scroll.ui.components.GlassCard
import com.devsummit.scroll.ui.components.VirtualCompanion
import com.devsummit.scroll.ui.theme.*
import com.devsummit.scroll.viewmodels.DashboardViewModel
import kotlin.math.roundToInt

@Composable
fun DashboardScreen(
    blacklistedApps: Set<String> = emptySet(),
    onTestOverlayClick: () -> Unit = {},
    viewModel: DashboardViewModel = viewModel()
) {
    val bioMetrics by viewModel.bioMetrics.collectAsState()
    val mentalState = bioMetrics.getMentalState()

    Box(modifier = Modifier.fillMaxSize().background(Black)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Good Evening.",
                        color = TextPrimary,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Today's Mental State: ${mentalState.name.replace("_", " ")}",
                        color = NeonPurple,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                VirtualCompanion(state = mentalState)
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Hero section: Dopamine Score Ring
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                AnimatedMetricRing(
                    percentage = bioMetrics.dopamineLevel,
                    color = NeonCyan,
                    modifier = Modifier.size(200.dp)
                )
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "DOPAMINE", color = TextMuted, fontSize = 12.sp, letterSpacing = 2.sp)
                    Text(
                        text = "${(bioMetrics.dopamineLevel * 100).roundToInt()}%",
                        color = NeonCyan,
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Metric Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.height(480.dp), // Fixed height or adjust based on content
                userScrollEnabled = false,
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    MetricCard(
                        title = "Sleep Debt",
                        value = String.format("%.1fh", bioMetrics.sleepDebtHours),
                        icon = Icons.Outlined.Bedtime,
                        color = NeonBlue
                    )
                }
                item {
                    MetricCard(
                        title = "Focus",
                        value = "${(bioMetrics.focusStability * 100).roundToInt()}%",
                        icon = Icons.Outlined.CenterFocusStrong,
                        color = NeonPurple
                    )
                }
                item {
                    MetricCard(
                        title = "Stress",
                        value = "${(bioMetrics.stressLevel * 100).roundToInt()}%",
                        icon = Icons.Outlined.SentimentDissatisfied,
                        color = AlertRed
                    )
                }
                item {
                    MetricCard(
                        title = "Eye Strain",
                        value = "${(bioMetrics.eyeStrainRisk * 100).roundToInt()}%",
                        icon = Icons.Outlined.RemoveRedEye,
                        color = WarningOrange
                    )
                }
                item {
                    MetricCard(
                        title = "Fatigue",
                        value = "${(bioMetrics.mentalFatigue * 100).roundToInt()}%",
                        icon = Icons.Outlined.Psychology,
                        color = TextSecondary
                    )
                }
                item {
                    MetricCard(
                        title = "Notifications",
                        value = "High",
                        icon = Icons.Outlined.NotificationsActive,
                        color = NeonCyan
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color
) {
    GlassCard(
        modifier = Modifier.fillMaxWidth().aspectRatio(1f),
        borderColor = color.copy(alpha = 0.3f),
        backgroundColor = Charcoal
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Icon(imageVector = icon, contentDescription = title, tint = color, modifier = Modifier.size(28.dp))
            Column {
                Text(text = title, color = TextMuted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Text(text = value, color = TextPrimary, fontSize = 28.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
