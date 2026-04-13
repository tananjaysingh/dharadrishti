package com.devsummit.scroll.core.usage

import android.content.Context
import java.util.Calendar
import kotlin.math.min

data class BioMetrics(
    val dopamineScore: Int, // 0-100 (100 is overloaded)
    val stressLevel: Int,   // 0-100
    val focusStability: Int, // 0-100
    val sleepDebtHours: Float,
    val eyeStrainRisk: Int,  // 0-100
    val mentalFatigue: Int   // 0-100
)

class BioAwareEngine(private val context: Context) {

    fun calculateMetrics(todayUsageMs: Long, blacklistedCount: Int): BioMetrics {
        val usageMinutes = todayUsageMs / (1000 * 60)
        val hourOfDay = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        
        // 1. Dopamine Score: Higher usage and more blacklisted apps = higher dopamine
        // Assuming blacklisted apps are the "high dopamine" ones
        val dopamineBase = (usageMinutes / 1.5).toInt() 
        val dopaminePenalty = blacklistedCount * 5
        val dopamineScore = min(100, dopamineBase + dopaminePenalty)

        // 2. Stress Level: Correlates with usage and time of day (higher at night/busy hours)
        val stressBase = (usageMinutes / 3.0).toInt()
        val timePenalty = if (hourOfDay > 20 || hourOfDay < 6) 20 else 0
        val stressLevel = min(100, stressBase + timePenalty)

        // 3. Focus Stability: Drops with more usage
        val focusStability = min(100, maxOf(0, 95 - (usageMinutes / 2.0).toInt()))

        // 4. Sleep Debt: Increases if usage is late at night
        var sleepDebt = 0f
        if (hourOfDay >= 23 || hourOfDay < 5) {
            sleepDebt = (usageMinutes / 60f) * 0.8f // Heavy penalty for late usage
        } else {
            sleepDebt = (usageMinutes / 60f) * 0.1f // Slight debt for daytime usage
        }

        // 5. Eye Strain: Increases with continuous usage
        val eyeStrainRisk = min(100, (usageMinutes / 1.2).toInt())

        // 6. Mental Fatigue
        val mentalFatigue = min(100, (usageMinutes / 2.5).toInt() + (if (usageMinutes > 120) 30 else 0))

        return BioMetrics(
            dopamineScore = dopamineScore,
            stressLevel = stressLevel,
            focusStability = focusStability,
            sleepDebtHours = String.format("%.1f", sleepDebt).toFloat(),
            eyeStrainRisk = eyeStrainRisk,
            mentalFatigue = mentalFatigue
        )
    }

    fun getDopamineStatus(score: Int): String {
        return when {
            score < 30 -> "Calm"
            score < 60 -> "Stimulated"
            score < 85 -> "Overloaded"
            else -> "Burnout Risk"
        }
    }
}
