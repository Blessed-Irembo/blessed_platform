import SwiftUI

struct UserPrivacySettingsView: View {
    @State private var shareData = true
    @State private var analyticsEnabled = true

    var body: some View {
        Form {
            Section(header: Text("Data Sharing"), footer: Text("Help us improve the Blessed Irembo map accuracy and services by sharing anonymous usage data.")) {
                Toggle("Share Usage Data", isOn: $shareData)
                    .tint(.primaryTeal)
                Toggle("Allow Analytics", isOn: $analyticsEnabled)
                    .tint(.primaryTeal)
            }
            
            Section(header: Text("Legal Information")) {
                Link("Privacy Policy", destination: URL(string: "https://blessedirembo.com/privacy-policy")!)
                    .foregroundColor(.textPrimary)
                Link("Terms and Conditions", destination: URL(string: "https://blessedirembo.com/terms-and-conditions")!)
                    .foregroundColor(.textPrimary)
            }
        }
        .navigationTitle("Privacy & Security")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    UserPrivacySettingsView()
}
