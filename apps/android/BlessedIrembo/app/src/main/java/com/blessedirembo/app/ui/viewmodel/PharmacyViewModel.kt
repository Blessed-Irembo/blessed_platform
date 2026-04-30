package com.blessedirembo.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blessedirembo.app.data.model.Pharmacy
import com.blessedirembo.app.data.repository.PharmacyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PharmacyUiState {
    data object Loading : PharmacyUiState()
    data class Success(val pharmacies: List<Pharmacy>) : PharmacyUiState()
    data class Error(val message: String) : PharmacyUiState()
}

/**
 * PharmacyViewModel
 * Fetches pharmacy data from Firestore and exposes it to the UI.
 */
class PharmacyViewModel(
    private val repository: PharmacyRepository = PharmacyRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<PharmacyUiState>(PharmacyUiState.Loading)
    val uiState: StateFlow<PharmacyUiState> = _uiState.asStateFlow()

    private val _selectedPharmacy = MutableStateFlow<Pharmacy?>(null)
    val selectedPharmacy: StateFlow<Pharmacy?> = _selectedPharmacy.asStateFlow()

    private val _ownerPharmacy = MutableStateFlow<Pharmacy?>(null)
    val ownerPharmacy: StateFlow<Pharmacy?> = _ownerPharmacy.asStateFlow()

    init {
        loadNearbyPharmacies()
    }

    fun loadNearbyPharmacies() {
        viewModelScope.launch {
            _uiState.value = PharmacyUiState.Loading
            repository.getNearbyPharmacies().fold(
                onSuccess = { pharmacies ->
                    _uiState.value = PharmacyUiState.Success(pharmacies)
                },
                onFailure = { e ->
                    _uiState.value = PharmacyUiState.Error(
                        e.message ?: "Failed to load pharmacies"
                    )
                }
            )
        }
    }

    fun loadPharmacyById(pharmacyId: String) {
        viewModelScope.launch {
            _selectedPharmacy.value = null
            repository.getPharmacyById(pharmacyId).fold(
                onSuccess = { pharmacy -> _selectedPharmacy.value = pharmacy },
                onFailure = { /* keep null — UI handles empty state */ }
            )
        }
    }

    fun loadPharmacyByOwnerId(ownerId: String) {
        viewModelScope.launch {
            repository.getPharmacyByOwnerId(ownerId).fold(
                onSuccess = { pharmacy -> _ownerPharmacy.value = pharmacy },
                onFailure = { /* Handle error or keep null */ }
            )
        }
    }

    fun searchPharmacies(query: String) {
        viewModelScope.launch {
            _uiState.value = PharmacyUiState.Loading
            repository.searchPharmacies(query).fold(
                onSuccess = { pharmacies ->
                    _uiState.value = PharmacyUiState.Success(pharmacies)
                },
                onFailure = { e ->
                    _uiState.value = PharmacyUiState.Error(
                        e.message ?: "Search failed"
                    )
                }
            )
        }
    }

    fun incrementWhatsAppClicks(pharmacyId: String) {
        viewModelScope.launch {
            repository.incrementWhatsAppClicks(pharmacyId)
        }
    }

    fun incrementProfileViews(pharmacyId: String) {
        viewModelScope.launch {
            repository.incrementProfileViews(pharmacyId)
        }
    }
}
