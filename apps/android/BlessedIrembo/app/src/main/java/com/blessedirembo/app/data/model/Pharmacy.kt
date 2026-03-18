package com.blessedirembo.app.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.GeoPoint

/**
 * Pharmacy — Firestore model stored at /pharmacies/{id}
 */
data class Pharmacy(
    @DocumentId
    val id: String = "",
    val name: String = "",
    val address: String = "",
    val phone: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val isOpen: Boolean = false,
    val isVerified: Boolean = false,
    val rating: Double = 0.0,
    val reviewCount: Int = 0,
    val ownerId: String = "",
    val description: String = "",
    val email: String = "",
    val openingHours: String = "Mon–Sat: 8am–6pm"
)
