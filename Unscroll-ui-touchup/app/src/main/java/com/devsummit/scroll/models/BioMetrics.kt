package com.devsummit.scroll.models

data class BioMetrics(
    val sleepDebtHours: Float = 0f,
    val dopamineLevel: Float = 0f, // 0.0 to 1.0
    val stressLevel: Float = 0f, // 0.0 to 1.0
    val focusStability: Float = 1.0f, // 0.0 to 1.0
    val eyeStrainRisk: Float = 0f, // 0.0 to 1.0
    val mentalFatigue: Float = 0f // 0.0 to 1.0
)

enum class MentalState {
    CALM,
    SLIGHTLY_OVERSTIMULATED,
    OVERLOADED,
    BURNOUT_RISK
}

fun BioMetrics.getMentalState(): MentalState {
    val avgRisk = (dopamineLevel + stressLevel + mentalFatigue) / 3f
    return when {
        avgRisk > 0.8f -> MentalState.BURNOUT_RISK
        avgRisk > 0.6f -> MentalState.OVERLOADED
        avgRisk > 0.3f -> MentalState.SLIGHTLY_OVERSTIMULATED
        else -> MentalState.CALM
    }
}
