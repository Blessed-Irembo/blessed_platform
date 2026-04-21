import SwiftUI

struct UserNotificationSettingsView: View {
    @State private var pushEnabled = true
    @State private var emailEnabled = true
    @State private var smsEnabled = false
    @State private var promoEnabled = false

    var body: some View {
        Form {
            Section(header: Text("App Notifications"), footer: Text("Enable these to stay up-to-date with your orders and pharmacy interactions.")) {
                Toggle("Push Notifications", isOn: $pushEnabled)
                    .tint(.primaryTeal)
                Toggle("Email Alerts", isOn: $emailEnabled)
                    .tint(.primaryTeal)
                Toggle("SMS Notifications", isOn: $smsEnabled)
                    .tint(.primaryTeal)
            }
            
            Section(header: Text("Marketing")) {
                Toggle("Promotional Offers", isOn: $promoEnabled)
                    .tint(.primaryTeal)
            }
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    UserNotificationSettingsView()
}
