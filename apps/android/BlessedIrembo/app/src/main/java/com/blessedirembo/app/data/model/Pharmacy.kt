package com.blessedirembo.app.data.model

import com.google.firebase.firestore.DocumentId

/**
 * OperatingHours — matches iOS OperatingHours struct stored in Firestore
 * at operatingHours: { is24Hours, days, openTime, closeTime }
 */
data class OperatingHours(
    val is24Hours: Boolean = false,
    val days: List<String> = emptyList(),
    val openTime: String = "08:00",  // HH:mm
    val closeTime: String = "20:00"  // HH:mm
)

/**
 * Pharmacy — Firestore model stored at /pharmacies/{id}
 */
data class Pharmacy(
    @DocumentId
    val id: String = "",
    val name: String = "",
    val address: String = "",
    val phone: String = "",
    val phoneNumber: String = "",
    val whatsAppNumber: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val isOpen: Boolean = false,
    val is24_7: Boolean = false,
    val isVerified: Boolean = false,
    val rating: Double = 0.0,
    val reviewCount: Int = 0,
    val ownerId: String = "",
    val ownerName: String = "",
    val licenseNumber: String = "",
    val description: String = "",
    val email: String = "",
    val openingHours: String = "Mon–Sat: 8am–6pm",
    // Structured operating hours (iOS-compatible)
    val operatingHours: Map<String, Any>? = null,
    val services: List<String> = emptyList(),
    val imageUrls: List<String> = emptyList(),
    // Dashboard metrics (mirroring iOS PharmacyDashboardViewModel)
    val whatsappClicks: Int = 0,
    val profileViews: Int = 0,
    val subscriptionPlan: String = "Free",
    val isPremium: Boolean = false,
    val isActive: Boolean = true,
    @com.google.firebase.firestore.ServerTimestamp
    val subscriptionEndDate: com.google.firebase.Timestamp? = null,
    @com.google.firebase.firestore.ServerTimestamp
    val createdAt: com.google.firebase.Timestamp? = null
) {
    /**
     * Parse the structured operatingHours map into a typed OperatingHours object.
     */
    @get:com.google.firebase.firestore.Exclude
    val parsedOperatingHours: OperatingHours
        get() = operatingHours?.let {
            OperatingHours(
                is24Hours = (it["is24Hours"] as? Boolean) ?: false,
                days = (it["days"] as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                openTime = (it["openTime"] as? String) ?: "08:00",
                closeTime = (it["closeTime"] as? String) ?: "20:00"
            )
        } ?: OperatingHours()

    /**
     * Determine if the pharmacy is currently open based on operating hours.
     * Mirrors iOS Pharmacy.isCurrentlyOpen computed property.
     */
    @get:com.google.firebase.firestore.Exclude
    val isCurrentlyOpen: Boolean
        get() {
            if (is24_7) return true
            val hours = parsedOperatingHours
            if (hours.is24Hours) return true

            val now = java.util.Calendar.getInstance()
            val dayNames = listOf("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
            val todayName = dayNames.getOrNull(now.get(java.util.Calendar.DAY_OF_WEEK) - 1) ?: return false
            if (!hours.days.contains(todayName)) return false

            val currentMinutes = now.get(java.util.Calendar.HOUR_OF_DAY) * 60 + now.get(java.util.Calendar.MINUTE)
            val openParts = hours.openTime.split(":").mapNotNull { it.toIntOrNull() }
            val closeParts = hours.closeTime.split(":").mapNotNull { it.toIntOrNull() }
            if (openParts.size < 2 || closeParts.size < 2) return false
            val openMinutes = openParts[0] * 60 + openParts[1]
            val closeMinutes = closeParts[0] * 60 + closeParts[1]
            return currentMinutes in openMinutes until closeMinutes
        }

    @get:com.google.firebase.firestore.Exclude
    val displayOperatingHours: String
        get() {
            val hours = parsedOperatingHours
            if (hours.is24Hours) return "Open 24/7"
            if (hours.days.isEmpty()) return openingHours.ifBlank { "—" }
            val dayStr = hours.days.joinToString(", ") { it.take(3) }
            return "$dayStr: ${hours.openTime}–${hours.closeTime}"
        }

    /**
     * Determine if the pharmacy has a valid subscription or is within the 90-day trial.
     */
    @get:com.google.firebase.firestore.Exclude
    val hasValidSubscription: Boolean
        get() {
            if (!isActive) return false
            
            val now = java.util.Date()
            if (subscriptionEndDate != null && subscriptionEndDate.toDate().after(now)) {
                return true
            }
            
            // Check 90-day trial based on createdAt
            if (createdAt != null) {
                val trialDurationMs = 90L * 24 * 60 * 60 * 1000
                val trialEndDate = java.util.Date(createdAt.toDate().time + trialDurationMs)
                if (trialEndDate.after(now)) {
                    return true
                }
            }
            
            return false
        }
}

/** Canonical ordered days list, matching iOS OperatingHours.allDays */
object AllDays {
    val list = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
}
