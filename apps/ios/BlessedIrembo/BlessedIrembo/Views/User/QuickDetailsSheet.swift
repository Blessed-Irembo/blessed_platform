/// Quick Details Sheet
///
/// Bottom drawer showing brief pharmacy information when marker is tapped.
/// Provides quick actions and navigation to full details.

import SwiftUI
import CoreLocation

struct QuickDetailsSheet: View {
    let pharmacy: Pharmacy
    let userLocation: CLLocationCoordinate2D
    let onDismiss: () -> Void
    
    @State private var showFullDetails = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Drag handle with background
            VStack(spacing: 0) {
                RoundedRectangle(cornerRadius: 2.5)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40, height: 5)
                    .padding(.top, 12)
                    .padding(.bottom, 20)
                
                // Content
                VStack(alignment: .leading, spacing: 16) {
                    // Header with gradient background
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 6) {
                                HStack(spacing: 8) {
                                    Text(pharmacy.name)
                                        .font(.system(size: 22, weight: .bold))
                                        .foregroundColor(.textPrimary)
                                    
                                    if pharmacy.isVerified {
                                        Image(systemName: "checkmark.seal.fill")
                                            .foregroundColor(.primaryTeal)
                                            .font(.system(size: 18))
                                    }
                                }
                                
                                // Distance with icon
                                HStack(spacing: 4) {
                                    Image(systemName: "location.fill")
                                        .font(.system(size: 12))
                                        .foregroundColor(.primaryTeal)
                                    
                                    Text(pharmacy.formattedDistance(from: userLocation))
                                        .font(.subheadline)
                                        .foregroundColor(.textSecondary)
                                }
                            }
                            
                            Spacer()
                            
                            Button(action: onDismiss) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 28))
                                    .foregroundColor(.gray.opacity(0.4))
                            }
                        }
                        
                        // Rating with better visuals
                        if pharmacy.reviewCount > 0 {
                            HStack(spacing: 8) {
                                HStack(spacing: 3) {
                                    ForEach(0..<5) { index in
                                        Image(systemName: index < Int(pharmacy.rating) ? "star.fill" : "star")
                                            .font(.system(size: 16))
                                            .foregroundColor(.orange)
                                    }
                                }
                                
                                Text(String(format: "%.1f", pharmacy.rating))
                                    .font(.body)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.textPrimary)
                                
                                Text("(\(pharmacy.reviewCount) reviews)")
                                    .font(.subheadline)
                                    .foregroundColor(.textSecondary)
                            }
                            .padding(.top, 4)
                        }
                    }
                    .padding(20)
                    .background(
                        LinearGradient(
                            colors: [Color.primaryTeal.opacity(0.05), Color.white],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(16)
                    
                    // Quick info cards
                    VStack(spacing: 12) {
                        // Address
                        InfoQuickCard(
                            icon: "mappin.circle.fill",
                            title: "Address",
                            detail: pharmacy.address
                        )
                        
                        // Operating hours
                        InfoQuickCard(
                            icon: "clock.fill",
                            title: "Hours",
                            detail: pharmacy.operatingHours.components(separatedBy: "\n").first ?? ""
                        )
                    }
                    
                    // Action buttons with improved styling
                    HStack(spacing: 12) {
                        // Get Directions - Primary button
                        Button(action: openMaps) {
                            HStack(spacing: 8) {
                                Image(systemName: "arrow.triangle.turn.up.right.circle.fill")
                                    .font(.system(size: 18))
                                Text("Directions")
                                    .fontWeight(.semibold)
                            }
                            .font(.body)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                LinearGradient(
                                    colors: [Color.primaryTeal, Color.primaryTeal.opacity(0.8)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(12)
                            .shadow(color: Color.primaryTeal.opacity(0.3), radius: 8, x: 0, y: 4)
                        }
                        
                        // View Details - Secondary button
                        NavigationLink(destination: PharmacyDetailsView(pharmacy: pharmacy, userLocation: userLocation), isActive: $showFullDetails) {
                            Button(action: { showFullDetails = true }) {
                                HStack(spacing: 8) {
                                    Image(systemName: "info.circle.fill")
                                        .font(.system(size: 18))
                                    Text("Details")
                                        .fontWeight(.semibold)
                                }
                                .font(.body)
                                .foregroundColor(.primaryTeal)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color.primaryTeal.opacity(0.1))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.primaryTeal.opacity(0.3), lineWidth: 1)
                                )
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color.white)
                .shadow(color: Color.black.opacity(0.15), radius: 20, x: 0, y: -5)
        )
        .padding(.horizontal, 8)
    }
    
    private func openMaps() {
        let latitude = pharmacy.latitude
        let longitude = pharmacy.longitude
        let url = URL(string: "maps://?saddr=&daddr=\(latitude),\(longitude)")
        
        if let url = url, UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        } else {
            // Fallback to Google Maps or Apple Maps web
            let webUrl = URL(string: "http://maps.apple.com/?daddr=\(latitude),\(longitude)")!
            UIApplication.shared.open(webUrl)
        }
    }
}

// MARK: - Info Quick Card Component

struct InfoQuickCard: View {
    let icon: String
    let title: String
    let detail: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.primaryTeal)
                .font(.system(size: 18))
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                
                Text(detail)
                    .font(.body)
                    .foregroundColor(.textPrimary)
                    .lineLimit(2)
            }
            
            Spacer()
        }
        .padding(12)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(10)
    }
}

#Preview {
    NavigationStack {
        ZStack {
            Color.gray.opacity(0.2)
            
            VStack {
                Spacer()
                QuickDetailsSheet(
                    pharmacy: MockData.pharmacies[0],
                    userLocation: MockData.defaultLocation,
                    onDismiss: {}
                )
            }
        }
        .edgesIgnoringSafeArea(.all)
    }
}
