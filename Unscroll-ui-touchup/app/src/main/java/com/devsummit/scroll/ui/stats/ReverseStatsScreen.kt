package com.devsummit.scroll.ui.stats

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.GlassCard
import com.devsummit.scroll.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReverseStatsScreen(
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Reality Check", color = TextPrimary, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Black)
            )
        },
        containerColor = Black
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Instead of scrolling for 3 hours today, you could have...",
                    color = TextSecondary,
                    fontSize = 18.sp,
                    lineHeight = 24.sp,
                    modifier = Modifier.padding(vertical = 16.dp)
                )
            }

            item {
                AlternativeActionCard(
                    title = "Gained 45 minutes of sleep",
                    icon = Icons.Outlined.Bedtime,
                    color = NeonBlue
                )
            }
            item {
                AlternativeActionCard(
                    title = "Completed 1 full workout",
                    icon = Icons.Outlined.FitnessCenter,
                    color = NeonCyan
                )
            }
            item {
                AlternativeActionCard(
                    title = "Read 30 pages of a book",
                    icon = Icons.Outlined.MenuBook,
                    color = NeonPurple
                )
            }
            item {
                AlternativeActionCard(
                    title = "Studied 2 chapters",
                    icon = Icons.Outlined.School,
                    color = AlertRed
                )
            }
            
            item {
                Spacer(modifier = Modifier.height(32.dp))
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = NeonPurple.copy(alpha = 0.5f),
                    backgroundColor = NeonPurple.copy(alpha = 0.05f)
                ) {
                    Column {
                        Text("Time is your most valuable asset.", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "The apps you are using are designed by literal casinos to keep you hooked. Reclaim your time.",
                            color = TextSecondary,
                            lineHeight = 20.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AlternativeActionCard(
    title: String,
    icon: ImageVector,
    color: androidx.compose.ui.graphics.Color
) {
    GlassCard(
        modifier = Modifier.fillMaxWidth(),
        borderColor = color.copy(alpha = 0.2f),
        backgroundColor = Charcoal
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(color.copy(alpha = 0.1f), shape = androidx.compose.foundation.shape.CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = title, tint = color)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(title, color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Medium)
        }
    }
}
