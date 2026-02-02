/// Pharmacy Model
///
/// Represents a pharmacy in the Blessed Irembo application with
/// geolocation support and business information.

import Foundation
import CoreLocation

struct Pharmacy: Codable, Identifiable {
    let id: String
    var name: String
    var ownerName: String
    var email: String
    var phoneNumber: String
    var licenseNumber: String
    var address: String
    var latitude: Double
    var longitude: Double
    var isVerified: Bool
    var createdAt: Date
    
    // New properties for user-facing features
    var rating: Double
    var reviewCount: Int
    var description: String
    var services: [String]
    var operatingHours: String
    var imageUrls: [String]
    
    init(
        id: String = UUID().uuidString,
        name: String,
        ownerName: String,
        email: String,
        phoneNumber: String,
        licenseNumber: String,
        address: String,
        latitude: Double,
        longitude: Double,
        isVerified: Bool = false,
        createdAt: Date = Date(),
        rating: Double = 0.0,
        reviewCount: Int = 0,
        description: String = "",
        services: [String] = [],
        operatingHours: String = "Mon-Fri: 8:00 AM - 8:00 PM",
        imageUrls: [String] = []
    ) {
        self.id = id
        self.name = name
        self.ownerName = ownerName
        self.email = email
        self.phoneNumber = phoneNumber
        self.licenseNumber = licenseNumber
        self.address = address
        self.latitude = latitude
        self.longitude = longitude
        self.isVerified = isVerified
        self.createdAt = createdAt
        self.rating = rating
        self.reviewCount = reviewCount
        self.description = description
        self.services = services
        self.operatingHours = operatingHours
        self.imageUrls = imageUrls
    }
    
    /// Get CLLocationCoordinate2D for map integration
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    /// Calculate distance from user location
    func distance(from location: CLLocationCoordinate2D) -> CLLocationDistance {
        let pharmacyLocation = CLLocation(latitude: latitude, longitude: longitude)
        let userLocation = CLLocation(latitude: location.latitude, longitude: location.longitude)
        return userLocation.distance(from: pharmacyLocation)
    }
    
    /// Format distance for display
    func formattedDistance(from location: CLLocationCoordinate2D) -> String {
        let distanceInMeters = distance(from: location)
        if distanceInMeters < 1000 {
            return String(format: "%.0f m", distanceInMeters)
        } else {
            return String(format: "%.1f km", distanceInMeters / 1000)
        }
    }
}

// MARK: - Validation

extension Pharmacy {
    
    /// Validate license number format
    static func isValidLicenseNumber(_ license: String) -> Bool {
        let licenseRegex = "^[A-Z0-9-]{5,50}$"
        let licensePredicate = NSPredicate(format:"SELF MATCHES %@", licenseRegex)
        return licensePredicate.evaluate(with: license.uppercased())
    }
    
    /// Validate coordinates are within Rwanda
    static func isValidRwandaCoordinates(latitude: Double, longitude: Double) -> Bool {
        // Rwanda approximate bounds
        let minLat = -2.9, maxLat = -1.0
        let minLon = 28.8, maxLon = 30.9
        
        return latitude >= minLat && latitude <= maxLat &&
               longitude >= minLon && longitude <= maxLon
    }
}
