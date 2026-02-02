/// Pharmacy Map View Model
///
/// Manages state for the pharmacy map view including pharmacy data,
/// user location, selection state, and filtering.

import Foundation
import CoreLocation
import Combine

class PharmacyMapViewModel: ObservableObject {
    @Published var pharmacies: [Pharmacy] = []
    @Published var selectedPharmacy: Pharmacy?
    @Published var searchText: String = ""
    @Published var showQuickDetails: Bool = false
    @Published var userLocation: CLLocationCoordinate2D?
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        loadPharmacies()
    }
    
    /// Load pharmacy data (currently using mock data)
    func loadPharmacies() {
        // In production, this would be an API call
        pharmacies = MockData.pharmacies
    }
    
    /// Filter pharmacies based on search text
    var filteredPharmacies: [Pharmacy] {
        if searchText.isEmpty {
            return pharmacies
        }
        return pharmacies.filter { pharmacy in
            pharmacy.name.localizedCaseInsensitiveContains(searchText) ||
            pharmacy.address.localizedCaseInsensitiveContains(searchText) ||
            pharmacy.services.contains { $0.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    /// Select a pharmacy and show quick details
    func selectPharmacy(_ pharmacy: Pharmacy) {
        selectedPharmacy = pharmacy
        showQuickDetails = true
    }
    
    /// Deselect pharmacy
    func deselectPharmacy() {
        selectedPharmacy = nil
        showQuickDetails = false
    }
    
    /// Get pharmacies sorted by distance from user
    func pharmaciesByDistance() -> [Pharmacy] {
        guard let userLocation = userLocation else {
            return filteredPharmacies
        }
        
        return filteredPharmacies.sorted { pharmacy1, pharmacy2 in
            pharmacy1.distance(from: userLocation) < pharmacy2.distance(from: userLocation)
        }
    }
    
    /// Get nearest pharmacy
    var nearestPharmacy: Pharmacy? {
        guard let userLocation = userLocation else {
            return filteredPharmacies.first
        }
        
        return filteredPharmacies.min { pharmacy1, pharmacy2 in
            pharmacy1.distance(from: userLocation) < pharmacy2.distance(from: userLocation)
        }
    }
}
