/// Pharmacy Details View
///
/// Full-screen view showing comprehensive pharmacy information
/// including contact details, services, hours, and reviews.

import SwiftUI
import CoreLocation
import MapKit

struct PharmacyDetailsView: View {
    let pharmacy: Pharmacy
    let userLocation: CLLocationCoordinate2D
    
    @Environment(\.dismiss) var dismiss
    @State private var selectedTab = 0
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header with map preview
                mapHeaderSection
                
                // Main info card
                mainInfoCard
                
                // Tab selector
                tabSelector
                
                // Tab content
                Group {
                    switch selectedTab {
                    case 0:
                        aboutSection
                    case 1:
                        servicesSection
                    case 2:
                        reviewsSection
                    default:
                        aboutSection
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                shareButton
            }
        }
    }
    
    // MARK: - Header Map Section
    
    private var mapHeaderSection: some View {
        Map(coordinateRegion: .constant(MKCoordinateRegion(
            center: pharmacy.coordinate,
            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
        )), annotationItems: [pharmacy]) { pharmacy in
            MapMarker(coordinate: pharmacy.coordinate, tint: .blue)
        }
        .frame(height: 200)
        .disabled(true)
        .overlay(
            LinearGradient(
                colors: [Color.black.opacity(0.3), Color.clear],
                startPoint: .bottom,
                endPoint: .top
            )
        )
    }
    
    // MARK: - Main Info Card
    
    private var mainInfoCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Title and verification
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(pharmacy.name)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.textPrimary)
                        
                        if pharmacy.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(.primaryTeal)
                                .font(.system(size: 18))
                        }
                    }
                    
                    Text(pharmacy.formattedDistance(from: userLocation))
                        .font(.body)
                        .foregroundColor(.textSecondary)
                }
                
                Spacer()
            }
            
            // Rating
            if pharmacy.reviewCount > 0 {
                HStack(spacing: 8) {
                    HStack(spacing: 3) {
                        ForEach(0..<5) { index in
                            Image(systemName: index < Int(pharmacy.rating) ? "star.fill" : "star")
                                .font(.system(size: 18))
                                .foregroundColor(.orange)
                        }
                    }
                    
                    Text(String(format: "%.1f", pharmacy.rating))
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    
                    Text("(\(pharmacy.reviewCount) reviews)")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                }
            }
            
            Divider()
            
            // Quick actions
            HStack(spacing: 16) {
                ActionButton(
                    icon: "phone.fill",
                    label: "Call",
                    action: callPharmacy
                )
                
                ActionButton(
                    icon: "arrow.triangle.turn.up.right.circle.fill",
                    label: "Directions",
                    action: openMaps
                )
                
                ActionButton(
                    icon: "message.fill",
                    label: "Message",
                    action: {}
                )
            }
        }
        .padding(20)
        .background(Color.white)
    }
    
    // MARK: - Tab Selector
    
    private var tabSelector: some View {
        HStack(spacing: 0) {
            TabButton(title: "About", isSelected: selectedTab == 0) {
                selectedTab = 0
            }
            TabButton(title: "Services", isSelected: selectedTab == 1) {
                selectedTab = 1
            }
            TabButton(title: "Reviews", isSelected: selectedTab == 2) {
                selectedTab = 2
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 16)
    }
    
    // MARK: - About Section
    
    private var aboutSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Description
            if !pharmacy.description.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("About")
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    
                    Text(pharmacy.description)
                        .font(.body)
                        .foregroundColor(.textSecondary)
                        .lineSpacing(4)
                }
            }
            
            // Contact Information
            VStack(alignment: .leading, spacing: 12) {
                Text("Contact Information")
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                
                InfoRow(icon: "mappin.circle.fill", text: pharmacy.address)
                InfoRow(icon: "phone.fill", text: pharmacy.phoneNumber)
                InfoRow(icon: "envelope.fill", text: pharmacy.email)
            }
            
            // Operating Hours
            VStack(alignment: .leading, spacing: 12) {
                Text("Operating Hours")
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(pharmacy.operatingHours.components(separatedBy: "\n"), id: \.self) { line in
                        HStack {
                            Image(systemName: "clock.fill")
                                .foregroundColor(.primaryTeal)
                                .font(.system(size: 14))
                            Text(line)
                                .font(.body)
                                .foregroundColor(.textSecondary)
                        }
                    }
                }
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - Services Section
    
    private var servicesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Available Services")
                .font(.headline)
                .foregroundColor(.textPrimary)
            
            if pharmacy.services.isEmpty {
                Text("No services listed")
                    .font(.body)
                    .foregroundColor(.textSecondary)
                    .padding(.vertical, 40)
                    .frame(maxWidth: .infinity)
            } else {
                VStack(spacing: 12) {
                    ForEach(pharmacy.services, id: \.self) { service in
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.primaryTeal)
                                .font(.system(size: 18))
                            
                            Text(service)
                                .font(.body)
                                .foregroundColor(.textPrimary)
                            
                            Spacer()
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - Reviews Section
    
    private var reviewsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Customer Reviews")
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                
                Spacer()
                
                if pharmacy.reviewCount > 0 {
                    Text("\(pharmacy.reviewCount) reviews")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }
            }
            
            if pharmacy.reviewCount == 0 {
                VStack(spacing: 12) {
                    Image(systemName: "star.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.gray.opacity(0.3))
                    
                    Text("No reviews yet")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                    
                    Text("Be the first to review this pharmacy")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                // Placeholder for review list
                Text("Reviews will be loaded from backend")
                    .font(.body)
                    .foregroundColor(.textSecondary)
                    .padding(.vertical, 40)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.top, 20)
    }
    
    // MARK: - Share Button
    
    private var shareButton: some View {
        Button(action: sharePharmacy) {
            Image(systemName: "square.and.arrow.up")
                .foregroundColor(.primaryTeal)
        }
    }
    
    // MARK: - Actions
    
    private func callPharmacy() {
        let phone = pharmacy.phoneNumber.replacingOccurrences(of: " ", with: "")
        if let url = URL(string: "tel://\(phone)"), UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        }
    }
    
    private func openMaps() {
        let latitude = pharmacy.latitude
        let longitude = pharmacy.longitude
        let url = URL(string: "maps://?saddr=&daddr=\(latitude),\(longitude)")
        
        if let url = url, UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        }
    }
    
    private func sharePharmacy() {
        // Share pharmacy info
        let text = "\(pharmacy.name)\n\(pharmacy.address)\n\(pharmacy.phoneNumber)"
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootVC = windowScene.windows.first?.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
}

// MARK: - Supporting Views

struct ActionButton: View {
    let icon: String
    let label: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.primaryTeal.opacity(0.1))
                        .frame(width: 50, height: 50)
                    
                    Image(systemName: icon)
                        .foregroundColor(.primaryTeal)
                        .font(.system(size: 22))
                }
                
                Text(label)
                    .font(.caption)
                    .foregroundColor(.textPrimary)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct TabButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(title)
                    .font(.body)
                    .fontWeight(isSelected ? .semibold : .regular)
                    .foregroundColor(isSelected ? .primaryTeal : .textSecondary)
                
                Rectangle()
                    .fill(isSelected ? Color.primaryTeal : Color.clear)
                    .frame(height: 2)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct InfoRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.primaryTeal)
                .font(.system(size: 16))
                .frame(width: 20)
            
            Text(text)
                .font(.body)
                .foregroundColor(.textSecondary)
        }
    }
}

#Preview {
    NavigationStack {
        PharmacyDetailsView(
            pharmacy: MockData.pharmacies[0],
            userLocation: MockData.defaultLocation
        )
    }
}
