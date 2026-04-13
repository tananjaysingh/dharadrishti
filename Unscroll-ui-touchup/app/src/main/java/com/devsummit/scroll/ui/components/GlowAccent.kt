package com.devsummit.scroll.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun GlowAccent(
    modifier: Modifier = Modifier,
    color: Color,
    blurRadius: Dp = 24.dp,
    shape: Shape
) {
    Box(
        modifier = modifier
            .blur(blurRadius)
            .background(color.copy(alpha = 0.3f), shape)
    )
}
