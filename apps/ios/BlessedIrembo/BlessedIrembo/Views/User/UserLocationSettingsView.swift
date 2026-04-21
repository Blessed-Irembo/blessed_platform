import SwiftUI
import UIKit

struct UserLocationSettingsView: View {
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "location.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.primaryTeal)
                .padding(.top, 40)
            
            Text("Location Services")
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(.textPrimary)
            
            Text("Blessed Irembo uses your location to show you nearby verified pharmacies on the map and calculate distances accurately.")
                .font(.body)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .lineSpacing(6)
            
            Spacer()
            
            Button(action: openSystemSettings) {
                HStack {
                    Image(systemName: "gearshape.fill")
                    Text("Manage iOS Settings")
                        .font(.headline)
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.primaryTeal)
                .cornerRadius(12)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .navigationTitle("Location Services")
        .navigationBarTitleDisplayMode(.inline)
        .background(Color.gray.opacity(0.05).ignoresSafeArea())
    }
    
    private func openSystemSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
    }
}

#Preview {
    UserLocationSettingsView()
}
