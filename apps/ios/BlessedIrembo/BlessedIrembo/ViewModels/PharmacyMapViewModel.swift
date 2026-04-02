/// Pharmacy Map View Model
///
/// Manages state for the pharmacy map view including pharmacy data,
/// user location, selection state, and filtering.
/// Loads live data from Firestore and decodes the structured operatingHours map.

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

    // MARK: - Firestore Load

    /// Load verified pharmacies from Firestore.
    /// Decodes the nested `operatingHours` map into an OperatingHours struct.
    func loadPharmacies() {
        FirebaseManager.shared.pharmaciesCollection
            .whereField("isVerified", isEqualTo: true)
            .getDocuments { [weak self] snapshot, error in
                guard let self = self else { return }

                if let error = error {
                    print("Error loading pharmacies: \(error.localizedDescription)")
                    return
                }

                guard let documents = snapshot?.documents else { return }

                let loaded: [Pharmacy] = documents.compactMap { doc in
                    self.pharmacy(from: doc)
                }

                DispatchQueue.main.async {
                    self.pharmacies = loaded
                }
            }
    }

    // MARK: - Firestore Decoding

    private func pharmacy(from doc: QueryDocumentSnapshot) -> Pharmacy? {
        let data = doc.data()

        // Decode the nested operatingHours map
        let oh = decodeOperatingHours(from: data["operatingHours"])

        // Normalize district to title case
        let rawDistrict = data["district"] as? String ?? ""
        let district = rawDistrict.split(separator: " ")
            .map { $0.prefix(1).uppercased() + $0.dropFirst().lowercased() }
            .joined(separator: " ")

        return Pharmacy(
            id: doc.documentID,
            name: data["name"] as? String ?? "",
            ownerName: data["ownerName"] as? String ?? "",
            email: data["email"] as? String ?? "",
            phoneNumber: data["phoneNumber"] as? String ?? "",
            whatsAppNumber: data["whatsAppNumber"] as? String ?? data["phoneNumber"] as? String ?? "",
            licenseNumber: data["licenseNumber"] as? String ?? "",
            address: data["address"] as? String ?? "",
            district: district,
            latitude: data["latitude"] as? Double ?? 0.0,
            longitude: data["longitude"] as? Double ?? 0.0,
            isVerified: data["isVerified"] as? Bool ?? false,
            is24_7: data["is24_7"] as? Bool ?? oh.is24Hours,
            isPremium: data["isPremium"] as? Bool ?? false,
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date(),
            rating: data["rating"] as? Double ?? 0.0,
            reviewCount: data["reviewCount"] as? Int ?? 0,
            whatsappClicks: data["whatsappClicks"] as? Int ?? 0,
            profileViews: data["profileViews"] as? Int ?? 0,
            description: data["description"] as? String ?? "",
            services: data["services"] as? [String] ?? [],
            operatingHours: oh,
            imageUrls: data["imageUrls"] as? [String] ?? []
        )
    }

    /// Decodes the Firestore `operatingHours` field into an OperatingHours struct.
    /// Supports both the structured map format and legacy string fallback.
    private func decodeOperatingHours(from raw: Any?) -> OperatingHours {
        // Structured map: { is24Hours: Bool, days: [String], openTime: String, closeTime: String }
        if let map = raw as? [String: Any] {
            let is24 = map["is24Hours"] as? Bool ?? false

            // days can be an array of strings
            var days: [String] = []
            if let arr = map["days"] as? [String] {
                days = arr
            }

            let openTime = map["openTime"] as? String ?? ""
            let closeTime = map["closeTime"] as? String ?? ""

            return OperatingHours(is24Hours: is24, days: days, openTime: openTime, closeTime: closeTime)
        }

        // Legacy string format — return empty struct (will show "Hours not specified")
        return OperatingHours()
    }

    // MARK: - Filtering

    var filteredPharmacies: [Pharmacy] {
        guard !searchText.isEmpty else { return pharmacies }
        return pharmacies.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.address.localizedCaseInsensitiveContains(searchText) ||
            $0.district.localizedCaseInsensitiveContains(searchText) ||
            $0.services.contains { $0.localizedCaseInsensitiveContains(searchText) }
        }
    }

    // MARK: - Selection

    func selectPharmacy(_ pharmacy: Pharmacy) {
        selectedPharmacy = pharmacy
        showQuickDetails = true
    }

    func deselectPharmacy() {
        selectedPharmacy = nil
        showQuickDetails = false
    }

    // MARK: - Sorting

    func pharmaciesByDistance() -> [Pharmacy] {
        guard let userLocation = userLocation else { return filteredPharmacies }
        return filteredPharmacies.sorted {
            $0.distance(from: userLocation) < $1.distance(from: userLocation)
        }
    }

    var nearestPharmacy: Pharmacy? {
        guard let userLocation = userLocation else { return filteredPharmacies.first }
        return filteredPharmacies.min {
            $0.distance(from: userLocation) < $1.distance(from: userLocation)
        }
    }
}
