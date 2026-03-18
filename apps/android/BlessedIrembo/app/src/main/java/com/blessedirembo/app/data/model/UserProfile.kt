package com.blessedirembo.app.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

/**
 * UserProfile — Firestore model stored at /users/{uid}
 *
 * Role values:
 *  - "USER"            → regular user looking for pharmacies
 *  - "PHARMACY_OWNER"  → pharmacy owner managing their listing
 */
data class UserProfile(
    @DocumentId
    val uid: String = "",
    val fullName: String = "",
    val email: String = "",
    val phone: String = "",
    val role: String = UserRole.USER,
    @ServerTimestamp
    val createdAt: Date? = null
)

object UserRole {
    const val USER = "user"
    const val PHARMACY_OWNER = "pharmacy"
}
