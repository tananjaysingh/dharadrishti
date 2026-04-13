package com.devsummit.scroll.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.devsummit.scroll.ui.components.PrimaryGlowButton
import com.devsummit.scroll.ui.theme.*

@Composable
fun SettingsScreen() {
    var notificationsEnabled by remember { mutableStateOf(true) }
    var strictMode by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Black)
            .padding(24.dp)
    ) {
        Text("Settings", color = TextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Bold)

        Spacer(modifier = Modifier.height(32.dp))

        Text("Interventions", color = NeonCyan, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 1.sp)
        Spacer(modifier = Modifier.height(16.dp))
        
        SettingToggle("Smart Notifications", notificationsEnabled) { notificationsEnabled = it }
        SettingToggle("Strict Mode (No override)", strictMode) { strictMode = it }
        SettingRow("Blocked Apps Management")
        
        Spacer(modifier = Modifier.height(32.dp))

        Text("Account", color = NeonPurple, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 1.sp)
        Spacer(modifier = Modifier.height(16.dp))
        
        SettingRow("Update Profile")
        SettingRow("Privacy Policy")
        
        Spacer(modifier = Modifier.weight(1f))
        
        PrimaryGlowButton(
            text = "Log Out",
            onClick = { /* Handle logout */ },
            color = Color.DarkGray
        )
        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun SettingToggle(title: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(title, color = TextPrimary, fontSize = 16.sp)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Black,
                checkedTrackColor = NeonCyan,
                uncheckedThumbColor = DarkGray,
                uncheckedTrackColor = Charcoal
            )
        )
    }
}

@Composable
fun SettingRow(title: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(title, color = TextPrimary, fontSize = 16.sp)
        Text(">", color = TextMuted)
    }
}
