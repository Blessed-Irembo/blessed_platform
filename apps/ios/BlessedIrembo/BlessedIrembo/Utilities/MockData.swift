/// Mock Data Generator
///
/// Provides mock pharmacy data for Xcode previews and development.
/// Data includes realistic pharmacies in Kigali, Rwanda with coordinates.
/// Uses the structured OperatingHours type so previews accurately reflect
/// what real Firestore data looks like.

import Foundation
import CoreLocation

struct MockData {

    static var pharmacies: [Pharmacy] {
        [
            Pharmacy(
                name: "City Pharmacy Kigali",
                ownerName: "Dr. Jean Mugabo",
                email: "contact@citypharmacy.rw",
                phoneNumber: "+250788123456",
                licenseNumber: "KGL-PH-001",
                address: "KN 5 Ave, Kigali",
                district: "Nyarugenge",
                latitude: -1.9536,
                longitude: 30.0606,
                isVerified: true,
                is24_7: false,
                isPremium: true,
                rating: 4.5,
                reviewCount: 127,
                whatsappClicks: 342,
                description: "Leading pharmacy in downtown Kigali offering a wide range of prescription medications, over-the-counter drugs, and health consultations.",
                services: ["Prescription Medications", "Health Consultations", "Blood Pressure Check", "Diabetes Screening", "Home Delivery"],
                operatingHours: OperatingHours(
                    is24Hours: false,
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    openTime: "07:00",
                    closeTime: "22:00"
                )
            ),
            Pharmacy(
                name: "Kimironko Medical Pharmacy",
                ownerName: "Marie Uwase",
                email: "info@kimironkopharmacy.rw",
                phoneNumber: "+250788234567",
                licenseNumber: "KGL-PH-002",
                address: "Kimironko, Kigali",
                district: "Gasabo",
                latitude: -1.9405,
                longitude: 30.1257,
                isVerified: true,
                rating: 4.7,
                reviewCount: 89,
                whatsappClicks: 201,
                description: "Trusted neighbourhood pharmacy serving Kimironko community with quality medications and professional healthcare advice.",
                services: ["Prescription Medications", "First Aid Supplies", "Baby Care Products", "Vitamins & Supplements"],
                operatingHours: OperatingHours(
                    is24Hours: false,
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    openTime: "08:00",
                    closeTime: "20:00"
                )
            ),
            Pharmacy(
                name: "Nyarutarama Health Pharmacy",
                ownerName: "Dr. Patrick Nkurunziza",
                email: "contact@nyarutaramapharmacy.rw",
                phoneNumber: "+250788345678",
                licenseNumber: "KGL-PH-003",
                address: "Nyarutarama, Kigali",
                district: "Gasabo",
                latitude: -1.9333,
                longitude: 30.1167,
                isVerified: true,
                is24_7: true,
                isPremium: true,
                rating: 4.8,
                reviewCount: 156,
                whatsappClicks: 520,
                description: "Premium pharmacy providing comprehensive healthcare services with experienced pharmacists and modern facilities.",
                services: ["Prescription Medications", "Medical Equipment", "Health Consultations", "Vaccination Services", "Lab Tests"],
                operatingHours: OperatingHours(is24Hours: true, days: [], openTime: "", closeTime: "")
            ),
            Pharmacy(
                name: "Remera Pharmacy Plus",
                ownerName: "Grace Mukamana",
                email: "info@remerpharmacy.rw",
                phoneNumber: "+250788456789",
                licenseNumber: "KGL-PH-004",
                address: "Remera, Kigali",
                district: "Gasabo",
                latitude: -1.9500,
                longitude: 30.1167,
                isVerified: true,
                rating: 4.3,
                reviewCount: 73,
                description: "Conveniently located pharmacy in Remera offering affordable medications and healthcare products.",
                services: ["Prescription Medications", "Over-the-Counter Drugs", "Personal Care", "Home Delivery"],
                operatingHours: OperatingHours(
                    is24Hours: false,
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    openTime: "08:00",
                    closeTime: "21:00"
                )
            ),
            Pharmacy(
                name: "Kacyiru Care Pharmacy",
                ownerName: "Dr. Emmanuel Habimana",
                email: "contact@kacyirucare.rw",
                phoneNumber: "+250788567890",
                licenseNumber: "KGL-PH-005",
                address: "Kacyiru, Kigali",
                district: "Kicukiro",
                latitude: -1.9447,
                longitude: 30.0850,
                isVerified: true,
                rating: 4.6,
                reviewCount: 94,
                description: "Modern pharmacy equipped with the latest healthcare products and staffed by qualified professionals.",
                services: ["Prescription Medications", "Medical Devices", "Health Screenings", "Nutrition Counseling"],
                operatingHours: OperatingHours(
                    is24Hours: false,
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    openTime: "07:30",
                    closeTime: "21:00"
                )
            )
        ]
    }

    /// Default location — Kigali city centre
    static var defaultLocation: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: -1.9536, longitude: 30.0606)
    }
}
