import SwiftUI
import CoreLocation
struct QuickDetailsSheet: View {
    let pharmacy: Pharmacy
    let userLocation: CLLocationCoordinate2D
    @Binding var showAuthPrompt: Bool
    let onClose: () -> Void
    @EnvironmentObject var appState: AppState
    
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
                    
                    Text(pharmacy.district)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
                
                Spacer()
                
                Button(action: onClose) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray.opacity(0.4))
                        .font(.system(size: 24))
                }
            }
            
            // Status and Distance
            HStack(spacing: 8) {
                // Open/Closed Pill
                HStack(spacing: 4) {
                    Circle()
                        .fill(pharmacy.isCurrentlyOpen ? Color.green : Color.red)
                        .frame(width: 6, height: 6)
                    Text(appState.t(pharmacy.isCurrentlyOpen ? "details.openNow" : "map.closed"))
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(pharmacy.isCurrentlyOpen ? Color(red: 22/255, green: 101/255, blue: 52/255) : Color(red: 153/255, green: 27/255, blue: 27/255))
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(pharmacy.isCurrentlyOpen ? Color(red: 220/255, green: 252/255, blue: 231/255) : Color(red: 254/255, green: 226/255, blue: 226/255))
                .cornerRadius(12)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: "location.fill")
                        .font(.system(size: 11))
                        .foregroundColor(.textSecondary)
                    Text(pharmacy.formattedDistance(from: userLocation, localizedWith: appState))
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
            }
            
            // Address
            HStack(alignment: .top, spacing: 6) {
                Image(systemName: "map.fill")
                    .font(.system(size: 11))
                    .foregroundColor(.textSecondary)
                    .padding(.top, 2)
                
                Text(pharmacy.address)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                    .lineLimit(2)
            }
            
            // Actions
            HStack(spacing: 12) {
                if appState.currentUser == nil {
                    Button(action: { showAuthPrompt = true }) {
                        Text(appState.t("map.viewDetails"))
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.primaryTeal)
                            .cornerRadius(12)
                    }
                } else {
                    NavigationLink(destination: PharmacyDetailsView(pharmacy: pharmacy, userLocation: userLocation)) {
                        Text(appState.t("map.viewDetails"))
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.primaryTeal)
                            .cornerRadius(12)
                    }
                }
                
                // Call Button
                Button(action: {
                    if appState.currentUser == nil {
                        showAuthPrompt = true
                    } else {
                        let phoneDigits = pharmacy.phoneNumber.filter { $0.isNumber || $0 == "+" }
                        if let url = URL(string: "tel:\(phoneDigits)"), UIApplication.shared.canOpenURL(url) {
                            UIApplication.shared.open(url)
                        }
                    }
                }) {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.gray)
                        .frame(width: 44, height: 44)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                }
                
                // WhatsApp Button
                Button(action: {
                    if appState.currentUser == nil {
                        showAuthPrompt = true
                    } else {
                        let phoneDigits = pharmacy.whatsAppNumber.filter { $0.isNumber || $0 == "+" }
                        if let url = URL(string: "https://wa.me/\(phoneDigits)"), UIApplication.shared.canOpenURL(url) {
                            UIApplication.shared.open(url)
                        }
                    }
                }) {
                    Image(systemName: "message.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color.green)
                        .frame(width: 44, height: 44)
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(12)
                }
            }
            .padding(.bottom, 24)
        }
        .padding(.horizontal, 20)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .shadow(color: Color.black.opacity(0.15), radius: 20, x: 0, y: -4)
    }
}
