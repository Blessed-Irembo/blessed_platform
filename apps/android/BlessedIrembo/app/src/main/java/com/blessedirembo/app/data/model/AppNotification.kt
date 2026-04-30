package com.blessedirembo.app.data.model

import com.google.firebase.firestore.DocumentId

/**
 * AppNotification — represents an in-app notification in Firestore at /notifications/{id}
 */
data class AppNotification(
    @DocumentId
    val id: String = "",
    val recipientId: String = "",
    val title: String = "",
    val message: String = "",
    val isRead: Boolean = false,
    @com.google.firebase.firestore.ServerTimestamp
    val createdAt: com.google.firebase.Timestamp? = null
)
