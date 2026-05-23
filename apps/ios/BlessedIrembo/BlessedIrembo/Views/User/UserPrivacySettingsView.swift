import SwiftUI

struct UserPrivacySettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var shareData = true
    @State private var analyticsEnabled = true

    var body: some View {
        Form {
            Section(header: Text(appState.t("settings.dataSharing")), footer: Text(appState.t("settings.dataSharingFooter"))) {
                Toggle(appState.t("settings.shareUsageData"), isOn: $shareData)
                    .tint(.primaryTeal)
                Toggle(appState.t("settings.allowAnalytics"), isOn: $analyticsEnabled)
                    .tint(.primaryTeal)
            }
            
            Section(header: Text(appState.t("settings.legalInfo"))) {
                Link(appState.t("profile.privacyPolicy"), destination: URL(string: "https://blessedirembo.com/privacy-policy")!)
                    .foregroundColor(.textPrimary)
                Link(appState.t("profile.terms"), destination: URL(string: "https://blessedirembo.com/terms-and-conditions")!)
                    .foregroundColor(.textPrimary)
            }
        }
        .navigationTitle(appState.t("profile.privacy"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    UserPrivacySettingsView()
}
