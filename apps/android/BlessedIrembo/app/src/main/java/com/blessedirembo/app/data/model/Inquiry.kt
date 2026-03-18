package com.blessedirembo.app.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

/**
 * Inquiry — Firestore model stored at /inquiries/{id}
 *
 * Status values:
 *  - "PENDING"   → not yet replied
 *  - "REPLIED"   → pharmacy owner replied
 *  - "ARCHIVED"  → archived by pharmacy owner
 */
data class Inquiry(
    @DocumentId
    val id: String = "",
    val pharmacyId: String = "",
    val senderId: String = "",
    val senderName: String = "",
    val message: String = "",
    val isRead: Boolean = false,
    val status: String = InquiryStatus.PENDING,
    @ServerTimestamp
    val timestamp: Date? = null
)

object InquiryStatus {
    const val PENDING = "PENDING"
    const val REPLIED = "REPLIED"
    const val ARCHIVED = "ARCHIVED"
}
