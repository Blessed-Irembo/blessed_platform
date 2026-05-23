import SwiftUI
import UIKit

struct UserLocationSettingsView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "location.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.primaryTeal)
                .padding(.top, 40)
            
            Text(appState.t("profile.location"))
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(.textPrimary)
            
            Text(appState.t("settings.locationUsageDesc"))
                .font(.body)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .lineSpacing(6)
            
            Spacer()
            
            Button(action: openSystemSettings) {
                HStack {
                    Image(systemName: "gearshape.fill")
                    Text(appState.t("settings.manageSettings"))
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
        .navigationTitle(appState.t("profile.location"))
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
