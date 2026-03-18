package com.blessedirembo.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blessedirembo.app.analytics.AnalyticsManager
import com.blessedirembo.app.data.model.Inquiry
import com.blessedirembo.app.data.model.InquiryStatus
import com.blessedirembo.app.data.repository.InquiryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * InquiryViewModel
 * Manages real-time inquiry data for pharmacy owners,
 * and "send inquiry" flow for users.
 */
class InquiryViewModel(
    private val repository: InquiryRepository = InquiryRepository()
) : ViewModel() {

    private val _inquiries = MutableStateFlow<List<Inquiry>>(emptyList())
    val inquiries: StateFlow<List<Inquiry>> = _inquiries.asStateFlow()

    private val _sendState = MutableStateFlow<SendState>(SendState.Idle)
    val sendState: StateFlow<SendState> = _sendState.asStateFlow()

    /**
     * Start listening to real-time inquiry updates for an owner's pharmacy.
     */
    fun observeInquiries(pharmacyId: String) {
        viewModelScope.launch {
            repository.getInquiriesForPharmacy(pharmacyId).collect { list ->
                _inquiries.value = list
            }
        }
    }

    /**
     * Send a new inquiry from a user to a pharmacy.
     */
    fun sendInquiry(pharmacyId: String, pharmacyName: String, message: String) {
        viewModelScope.launch {
            _sendState.value = SendState.Sending
            repository.sendInquiry(pharmacyId, pharmacyName, message).fold(
                onSuccess = {
                    AnalyticsManager.logInquirySent(pharmacyId)
                    _sendState.value = SendState.Success
                },
                onFailure = { e ->
                    _sendState.value = SendState.Error(e.message ?: "Failed to send inquiry")
                }
            )
        }
    }

    fun markAsRead(inquiryId: String) {
        viewModelScope.launch {
            repository.markAsRead(inquiryId)
        }
    }

    fun archiveInquiry(inquiryId: String) {
        viewModelScope.launch {
            repository.updateInquiryStatus(inquiryId, InquiryStatus.ARCHIVED)
        }
    }

    fun resetSendState() {
        _sendState.value = SendState.Idle
    }

    /** Filtered views for the owner's inquiry tabs */
    fun inquiriesByStatus(status: String?): List<Inquiry> {
        return if (status == null) _inquiries.value
        else _inquiries.value.filter { it.status == status }
    }

    val unreadCount: Int
        get() = _inquiries.value.count { !it.isRead }
}

sealed class SendState {
    data object Idle : SendState()
    data object Sending : SendState()
    data object Success : SendState()
    data class Error(val message: String) : SendState()
}
