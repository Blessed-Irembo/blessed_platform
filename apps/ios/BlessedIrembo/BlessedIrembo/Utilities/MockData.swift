/// Mock Data Generator
///
/// Provides mock pharmacy data for testing and development.
/// Data includes realistic pharmacies in Kigali, Rwanda with coordinates.

import Foundation
import CoreLocation

struct MockData {
    
    /// Generate sample pharmacies in Kigali area
    static var pharmacies: [Pharmacy] {
        [
            Pharmacy(
                name: "City Pharmacy Kigali",
                ownerName: "Dr. Jean Mugabo",
                email: "contact@citypharmacy.rw",
                phoneNumber: "+250788123456",
                licenseNumber: "KGL-PH-001",
                address: "KN 5 Ave, Kigali",
                latitude: -1.9536,
                longitude: 30.0606,
                isVerified: true,
                rating: 4.5,
                reviewCount: 127,
                description: "Leading pharmacy in downtown Kigali offering a wide range of prescription medications, over-the-counter drugs, and health consultations.",
                services: ["Prescription Medications", "Health Consultations", "Blood Pressure Check", "Diabetes Screening", "Home Delivery"],
                operatingHours: "Mon-Fri: 7:00 AM - 10:00 PM\nSat-Sun: 8:00 AM - 9:00 PM"
            ),
            Pharmacy(
                name: "Kimironko Medical Pharmacy",
                ownerName: "Marie Uwase",
                email: "info@kimironkopharmacy.rw",
                phoneNumber: "+250788234567",
                licenseNumber: "KGL-PH-002",
                address: "Kimironko, Kigali",
                latitude: -1.9405,
                longitude: 30.1257,
                isVerified: true,
                rating: 4.7,
                reviewCount: 89,
                description: "Trusted neighborhood pharmacy serving Kimironko community with quality medications and professional healthcare advice.",
                services: ["Prescription Medications", "First Aid Supplies", "Baby Care Products", "Vitamins & Supplements"],
                operatingHours: "Mon-Sat: 8:00 AM - 8:00 PM\nSun: 9:00 AM - 6:00 PM"
            ),
            Pharmacy(
                name: "Nyarutarama Health Pharmacy",
                ownerName: "Dr. Patrick Nkurunziza",
                email: "contact@nyarutaramapharmacy.rw",
                phoneNumber: "+250788345678",
                licenseNumber: "KGL-PH-003",
                address: "Nyarutarama, Kigali",
                latitude: -1.9333,
                longitude: 30.1167,
                isVerified: true,
                rating: 4.8,
                reviewCount: 156,
                description: "Premium pharmacy providing comprehensive healthcare services with experienced pharmacists and modern facilities.",
                services: ["Prescription Medications", "Medical Equipment", "Health Consultations", "Vaccination Services", "Lab Tests"],
                operatingHours: "Mon-Sun: 24 Hours"
            ),
            Pharmacy(
                name: "Remera Pharmacy Plus",
                ownerName: "Grace Mukamana",
                email: "info@remerpharmacy.rw",
                phoneNumber: "+250788456789",
                licenseNumber: "KGL-PH-004",
                address: "Remera, Kigali",
                latitude: -1.9500,
                longitude: 30.1167,
                isVerified: true,
                rating: 4.3,
                reviewCount: 73,
                description: "Conveniently located pharmacy in Remera offering affordable medications and healthcare products.",
                services: ["Prescription Medications", "Over-the-Counter Drugs", "Personal Care", "Home Delivery"],
                operatingHours: "Mon-Fri: 8:00 AM - 9:00 PM\nSat: 8:00 AM - 8:00 PM\nSun: Closed"
            ),
            Pharmacy(
                name: "Kacyiru Care Pharmacy",
                ownerName: "Dr. Emmanuel Habimana",
                email: "contact@kacyirucare.rw",
                phoneNumber: "+250788567890",
                licenseNumber: "KGL-PH-005",
                address: "Kacyiru, Kigali",
                latitude: -1.9447,
                longitude: 30.0850,
                isVerified: true,
                rating: 4.6,
                reviewCount: 94,
                description: "Modern pharmacy equipped with the latest healthcare products and staffed by qualified professionals.",
                services: ["Prescription Medications", "Medical Devices", "Health Screenings", "Nutrition Counseling"],
                operatingHours: "Mon-Sat: 7:30 AM - 9:00 PM\nSun: 9:00 AM - 7:00 PM"
            ),
            Pharmacy(
                name: "Gikondo Wellness Pharmacy",
                ownerName: "Alice Uwimana",
                email: "info@gikondowellness.rw",
                phoneNumber: "+250788678901",
                licenseNumber: "KGL-PH-006",
                address: "Gikondo, Kigali",
                latitude: -1.9833,
                longitude: 30.0833,
                isVerified: false,
                rating: 4.1,
                reviewCount: 45,
                description: "Community pharmacy dedicated to improving local health with affordable medicines and friendly service.",
                services: ["Prescription Medications", "Over-the-Counter Drugs", "Basic Health Checks"],
                operatingHours: "Mon-Fri: 8:00 AM - 7:00 PM\nSat: 9:00 AM - 5:00 PM\nSun: Closed"
            ),
            Pharmacy(
                name: "Kiyovu Central Pharmacy",
                ownerName: "Dr. Joseph Niyonzima",
                email: "contact@kiyovupharmacy.rw",
                phoneNumber: "+250788789012",
                licenseNumber: "KGL-PH-007",
                address: "Kiyovu, Kigali",
                latitude: -1.9667,
                longitude: 30.0500,
                isVerified: true,
                rating: 4.9,
                reviewCount: 203,
                description: "Prestigious pharmacy in Kiyovu district offering premium healthcare services and exclusive medical products.",
                services: ["Prescription Medications", "Specialty Drugs", "Health Consultations", "Medical Equipment", "Cosmetics"],
                operatingHours: "Mon-Sun: 24 Hours"
            ),
            Pharmacy(
                name: "Nyabugogo Express Pharmacy",
                ownerName: "Claudine Mukamazimpaka",
                email: "info@nyabugogoexpress.rw",
                phoneNumber: "+250788890123",
                licenseNumber: "KGL-PH-008",
                address: "Nyabugogo, Kigali",
                latitude: -1.9647,
                longitude: 30.0420,
                isVerified: true,
                rating: 4.0,
                reviewCount: 62,
                description: "Fast and efficient pharmacy service near Nyabugogo bus station, serving commuters and local residents.",
                services: ["Prescription Medications", "Quick Health Checks", "Travel Medicine"],
                operatingHours: "Mon-Sun: 6:00 AM - 10:00 PM"
            )
        ]
    }
    
    /// Default location (Kigali city center) for testing
    static var defaultLocation: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: -1.9536, longitude: 30.0606)
    }
}
