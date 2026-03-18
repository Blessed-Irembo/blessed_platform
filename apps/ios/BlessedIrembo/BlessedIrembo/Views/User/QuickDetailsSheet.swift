import SwiftUI
import CoreLocation

struct QuickDetailsSheet: View {
    let pharmacy: Pharmacy
    let userLocation: CLLocationCoordinate2D
    let onClose: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Drag indicator
            HStack {
                Spacer()
                Capsule()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40, height: 4)
                Spacer()
            }
            .padding(.top, 8)
            
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(pharmacy.name)
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.textPrimary)
                        
                        if pharmacy.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(.primaryTeal)
                        }
                    }
                    
                    HStack(spacing: 8) {
                        Image(systemName: "location.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.primaryTeal)
                        Text(pharmacy.formattedDistance(from: userLocation))
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                    }
                    
                    Text(pharmacy.address)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                        .lineLimit(2)
                }
                
                Spacer()
                
                Button(action: onClose) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray.opacity(0.4))
                        .font(.system(size: 24))
                }
            }
            
            NavigationLink(destination: PharmacyDetailsView(pharmacy: pharmacy, userLocation: userLocation)) {
                Text("View Details")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.primaryTeal)
                    .cornerRadius(12)
            }
            .padding(.bottom, 24)
        }
        .padding(.horizontal, 20)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .shadow(color: Color.black.opacity(0.15), radius: 20, x: 0, y: -4)
    }
}
