import SwiftUI

struct UserNotificationSettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var pushEnabled = true
    @State private var emailEnabled = true
    @State private var smsEnabled = false
    @State private var promoEnabled = false

    var body: some View {
        Form {
            Section(header: Text(appState.t("settings.appNotifications")), footer: Text(appState.t("settings.appNotificationsFooter"))) {
                Toggle(appState.t("profile.notifications"), isOn: $pushEnabled)
                    .tint(.primaryTeal)
                Toggle(appState.t("settings.emailAlerts"), isOn: $emailEnabled)
                    .tint(.primaryTeal)
                Toggle(appState.t("settings.smsAlerts"), isOn: $smsEnabled)
                    .tint(.primaryTeal)
            }
            
            Section(header: Text(appState.t("settings.marketing"))) {
                Toggle(appState.t("settings.promotionalOffers"), isOn: $promoEnabled)
                    .tint(.primaryTeal)
            }
        }
        .navigationTitle(appState.t("profile.notifications"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    UserNotificationSettingsView()
}
