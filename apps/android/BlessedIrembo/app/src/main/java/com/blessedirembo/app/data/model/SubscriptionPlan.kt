package com.blessedirembo.app.data.model

import com.google.firebase.Timestamp

/**
 * Subscription plans mirroring iOS SubscriptionPlan.all
 */
data class SubscriptionPlan(
    val id: String,
    val name: String,
    val amount: Int,    // RWF
    val months: Int,
    val label: String,
    val isPopular: Boolean
) {
    companion object {
        val all = listOf(
            SubscriptionPlan("1_month",   "1 Month",   1000,  1,  "1,000 RWF / month",   isPopular = false),
            SubscriptionPlan("3_months",  "3 Months",  3000,  3,  "3,000 RWF / 3 months", isPopular = true),
            SubscriptionPlan("12_months", "12 Months", 10000, 12, "10,000 RWF / year",    isPopular = false),
        )
    }

    val ussdCode: String get() = "*182*8*1*38220*$amount#"
}

/**
 * Subscription status mirroring iOS SubscriptionStatus enum
 */
sealed class SubscriptionStatus {
    data class FreeTrial(val daysRemaining: Int) : SubscriptionStatus()
    data class Premium(val expiresOn: java.util.Date) : SubscriptionStatus()
    object Expired : SubscriptionStatus()
    object Unknown : SubscriptionStatus()

    val displayTitle: String
        get() = when (this) {
            is FreeTrial -> if (daysRemaining > 0) "Free Trial" else "Free Trial (ending today)"
            is Premium -> "Premium"
            is Expired -> "Expired"
            is Unknown -> "Loading..."
        }

    val displaySubtitle: String
        get() = when (this) {
            is FreeTrial -> if (daysRemaining > 1) "$daysRemaining days remaining" else "1 day remaining"
            is Premium -> {
                val fmt = java.text.SimpleDateFormat("d MMM yyyy", java.util.Locale.getDefault())
                "Active until ${fmt.format(expiresOn)}"
            }
            is Expired -> "Please renew to keep your listing active"
            is Unknown -> ""
        }

    val isActive: Boolean
        get() = this is FreeTrial || this is Premium
}

/**
 * Pending subscription request from Firestore subscription_requests collection
 */
data class SubscriptionRequest(
    val id: String = "",
    val pharmacyId: String = "",
    val pharmacyName: String = "",
    val planId: String = "",
    val amount: Int = 0,
    val receiptUrl: String = "",
    val status: String = "pending",
    val createdAt: java.util.Date = java.util.Date()
) {
    val planDisplayName: String
        get() = SubscriptionPlan.all.firstOrNull { it.id == planId }?.name ?: planId
}
