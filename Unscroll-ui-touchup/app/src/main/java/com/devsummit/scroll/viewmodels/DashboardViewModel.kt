package com.devsummit.scroll.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.devsummit.scroll.models.BioMetrics
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.random.Random

class DashboardViewModel : ViewModel() {

    private val _bioMetrics = MutableStateFlow(BioMetrics(
        sleepDebtHours = 2.5f,
        dopamineLevel = 0.7f,
        stressLevel = 0.6f,
        focusStability = 0.4f,
        eyeStrainRisk = 0.5f,
        mentalFatigue = 0.65f
    ))
    val bioMetrics: StateFlow<BioMetrics> = _bioMetrics.asStateFlow()

    init {
        // Simulate live changing metrics
        viewModelScope.launch {
            while (true) {
                delay(5000) // Update every 5 seconds
                _bioMetrics.update { current ->
                    current.copy(
                        dopamineLevel = (current.dopamineLevel + Random.nextFloat() * 0.04f - 0.02f).coerceIn(0f, 1f),
                        stressLevel = (current.stressLevel + Random.nextFloat() * 0.02f - 0.01f).coerceIn(0f, 1f),
                        focusStability = (current.focusStability + Random.nextFloat() * 0.03f - 0.015f).coerceIn(0f, 1f),
                        eyeStrainRisk = (current.eyeStrainRisk + 0.01f).coerceIn(0f, 1f), // consistently increases
                        mentalFatigue = (current.mentalFatigue + 0.005f).coerceIn(0f, 1f)
                    )
                }
            }
        }
    }

    // Interventions
    fun resetStress() {
        _bioMetrics.update { it.copy(stressLevel = 0.2f) }
    }
}
