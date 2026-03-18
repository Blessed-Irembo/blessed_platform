/// Pharmacy Map View Model
///
/// Manages state for the pharmacy map view including pharmacy data,
/// user location, selection state, and filtering.

import Foundation
import CoreLocation
import Combine
import FirebaseFirestore

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
    
    /// Load pharmacy data from Firestore
    func loadPharmacies() {
        FirebaseManager.shared.pharmaciesCollection.whereField("isVerified", isEqualTo: true).getDocuments { [weak self] snapshot, error in
            guard let self = self else { return }
            
            if let error = error {
                print("Error loading pharmacies: \(error.localizedDescription)")
                return
            }
            
            guard let documents = snapshot?.documents else { return }
            
            let loadedPharmacies: [Pharmacy] = documents.compactMap { doc in
                let data = doc.data()
                return Pharmacy(
                    id: doc.documentID,
                    name: data["name"] as? String ?? "",
                    ownerName: data["ownerName"] as? String ?? "",
                    email: data["email"] as? String ?? "",
                    phoneNumber: data["phoneNumber"] as? String ?? "",
                    licenseNumber: data["licenseNumber"] as? String ?? "",
                    address: data["address"] as? String ?? "",
                    latitude: data["latitude"] as? Double ?? 0.0,
                    longitude: data["longitude"] as? Double ?? 0.0,
                    isVerified: data["isVerified"] as? Bool ?? false,
                    rating: data["rating"] as? Double ?? 0.0,
                    reviewCount: data["reviewCount"] as? Int ?? 0,
                    description: data["description"] as? String ?? "",
                    services: data["services"] as? [String] ?? [],
                    operatingHours: data["operatingHours"] as? String ?? "Mon-Fri: 8:00 AM - 8:00 PM",
                    imageUrls: data["imageUrls"] as? [String] ?? []
                )
            }
            
            DispatchQueue.main.async {
                self.pharmacies = loadedPharmacies
            }
        }
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
