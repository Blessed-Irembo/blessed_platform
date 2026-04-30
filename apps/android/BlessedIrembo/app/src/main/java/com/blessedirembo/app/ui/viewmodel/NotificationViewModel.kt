package com.blessedirembo.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blessedirembo.app.data.model.AppNotification
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NotificationViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val notificationsCollection = db.collection("notifications")

    private val _notifications = MutableStateFlow<List<AppNotification>>(emptyList())
    val notifications: StateFlow<List<AppNotification>> = _notifications.asStateFlow()

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    fun listenForNotifications(recipientId: String) {
        notificationsCollection
            .whereEqualTo("recipientId", recipientId)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    return@addSnapshotListener
                }

                if (snapshot != null) {
                    val notifs = snapshot.toObjects(AppNotification::class.java)
                    _notifications.value = notifs
                    _unreadCount.value = notifs.count { !it.isRead }
                }
            }
    }

    fun markAsRead(notificationId: String) {
        viewModelScope.launch {
            try {
                notificationsCollection.document(notificationId).update("isRead", true)
            } catch (e: Exception) {
                // Handle error if needed
            }
        }
    }
}
