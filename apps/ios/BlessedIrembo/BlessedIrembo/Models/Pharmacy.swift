/// Pharmacy Model
///
/// Represents a pharmacy in the Blessed Irembo application.
/// Mirrors the Firestore document schema used by the web platform.

import Foundation
import CoreLocation

// MARK: - Operating Hours

/// Mirrors the Firestore operatingHours map used by the web.
struct OperatingHours: Codable {
    var is24Hours: Bool
    var days: [String]       // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    var openTime: String      // e.g. "08:00"
    var closeTime: String     // e.g. "20:00"

    init(is24Hours: Bool = false,
         days: [String] = [],
         openTime: String = "",
         closeTime: String = "") {
        self.is24Hours = is24Hours
        self.days = days
        self.openTime = openTime
        self.closeTime = closeTime
    }

    static let allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
}

// MARK: - Pharmacy

struct Pharmacy: Codable, Identifiable {
    let id: String
    var name: String
    var ownerName: String
    var email: String
    var phoneNumber: String
    var whatsAppNumber: String    // May differ from phoneNumber; falls back to phoneNumber
    var licenseNumber: String
    var address: String
    var district: String
    var latitude: Double
    var longitude: Double
    var isVerified: Bool
    var is24_7: Bool
    var isPremium: Bool
    var createdAt: Date

    // Engagement
    var rating: Double
    var reviewCount: Int
    var whatsappClicks: Int

    // Content
    var description: String
    var services: [String]
    var operatingHours: OperatingHours
    var imageUrls: [String]

    init(
        id: String = UUID().uuidString,
        name: String,
        ownerName: String = "",
        email: String = "",
        phoneNumber: String = "",
        whatsAppNumber: String = "",
        licenseNumber: String = "",
        address: String = "",
        district: String = "",
        latitude: Double = 0.0,
        longitude: Double = 0.0,
        isVerified: Bool = false,
        is24_7: Bool = false,
        isPremium: Bool = false,
        createdAt: Date = Date(),
        rating: Double = 0.0,
        reviewCount: Int = 0,
        whatsappClicks: Int = 0,
        description: String = "",
        services: [String] = [],
        operatingHours: OperatingHours = OperatingHours(),
        imageUrls: [String] = []
    ) {
        self.id = id
        self.name = name
        self.ownerName = ownerName
        self.email = email
        self.phoneNumber = phoneNumber
        self.whatsAppNumber = whatsAppNumber.isEmpty ? phoneNumber : whatsAppNumber
        self.licenseNumber = licenseNumber
        self.address = address
        self.district = district
        self.latitude = latitude
        self.longitude = longitude
        self.isVerified = isVerified
        self.is24_7 = is24_7
        self.isPremium = isPremium
        self.createdAt = createdAt
        self.rating = rating
        self.reviewCount = reviewCount
        self.whatsappClicks = whatsappClicks
        self.description = description
        self.services = services
        self.operatingHours = operatingHours
        self.imageUrls = imageUrls
    }

    /// CLLocationCoordinate2D for map use
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }

    /// Distance in metres from a given coordinate
    func distance(from location: CLLocationCoordinate2D) -> CLLocationDistance {
        CLLocation(latitude: latitude, longitude: longitude)
            .distance(from: CLLocation(latitude: location.latitude, longitude: location.longitude))
    }

    /// Human-readable distance string
    func formattedDistance(from location: CLLocationCoordinate2D) -> String {
        let m = distance(from: location)
        return m < 1000
            ? String(format: "%.0f m away", m)
            : String(format: "%.1f km away", m / 1000)
    }

    // MARK: - Open / Closed Logic (mirrors web pharmacyUtils.ts)

    /// Whether the pharmacy is open right now based on its operating hours.
    var isCurrentlyOpen: Bool {
        let oh = operatingHours
        if oh.is24Hours { return true }

        let now = Date()
        let calendar = Calendar.current
        // weekday: 1=Sun, 2=Mon, …, 7=Sat → map to same DAYS_MAP as web
        let weekdayIndex = calendar.component(.weekday, from: now) // 1…7
        let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        let todayName = dayNames[weekdayIndex - 1]

        // Check if today is an operating day
        if !oh.days.isEmpty && !oh.days.contains(todayName) {
            return false
        }

        // Check times
        guard !oh.openTime.isEmpty, !oh.closeTime.isEmpty else { return true }

        let hour = calendar.component(.hour, from: now)
        let minute = calendar.component(.minute, from: now)
        let currentTotal = hour * 60 + minute

        let openParts = oh.openTime.split(separator: ":").map { Int($0) ?? 0 }
        let closeParts = oh.closeTime.split(separator: ":").map { Int($0) ?? 0 }
        guard openParts.count >= 2, closeParts.count >= 2 else { return true }

        let openTotal = openParts[0] * 60 + openParts[1]
        let closeTotal = closeParts[0] * 60 + closeParts[1]

        // Handle overnight hours (e.g. 20:00 – 02:00)
        if closeTotal < openTotal {
            return currentTotal >= openTotal || currentTotal <= closeTotal
        }
        return currentTotal >= openTotal && currentTotal <= closeTotal
    }

    /// One-line hours summary (e.g. "Mon – Fri • 08:00 - 20:00")
    var formattedHoursSummary: String {
        let oh = operatingHours
        if oh.is24Hours { return "Open 24/7" }
        if oh.days.isEmpty && oh.openTime.isEmpty { return "Hours not specified" }

        let daysDisplay: String
        if oh.days.count == 7 {
            daysDisplay = "Everyday"
        } else if oh.days.count <= 3 {
            daysDisplay = oh.days.joined(separator: ", ")
        } else if !oh.days.isEmpty {
            daysDisplay = "\(oh.days.first!) – \(oh.days.last!)"
        } else {
            daysDisplay = "N/A"
        }

        let open = oh.openTime.isEmpty ? "N/A" : oh.openTime
        let close = oh.closeTime.isEmpty ? "N/A" : oh.closeTime
        return "\(daysDisplay) • \(open) – \(close)"
    }
}

// MARK: - Validation

extension Pharmacy {

    static func isValidLicenseNumber(_ license: String) -> Bool {
        let pred = NSPredicate(format: "SELF MATCHES %@", "^[A-Z0-9-]{5,50}$")
        return pred.evaluate(with: license.uppercased())
    }

    static func isValidRwandaCoordinates(latitude: Double, longitude: Double) -> Bool {
        (-2.9...(-1.0)).contains(latitude) && (28.8...30.9).contains(longitude)
    }
}
