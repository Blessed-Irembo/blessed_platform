/// Pharmacy Notification Settings View
///
/// Notification preferences for the dashboard.

import SwiftUI

struct PharmacyNotificationSettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var emailNotifications = true
    @State private var pushNotifications = true
    @State private var marketingEmails = false
    
    var body: some View {
        List {
            Section(appState.t("settings.general")) {
                Toggle(appState.t("settings.appNotifications"), isOn: $pushNotifications)
                    .tint(.primaryTeal)
                Toggle(appState.t("settings.emailAlerts"), isOn: $emailNotifications)
                    .tint(.primaryTeal)
            }
            

            
            Section(appState.t("settings.updates")) {
                Toggle(appState.t("settings.marketingTips"), isOn: $marketingEmails)
                    .tint(.primaryTeal)
            }
        }
        .navigationTitle(appState.t("profile.notifications"))
    }
}
