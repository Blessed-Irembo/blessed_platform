import SwiftUI

struct UserAppearanceSettingsView: View {
    @AppStorage("userInterfaceStyle") private var userInterfaceStyle: Int = 0 // 0=System, 1=Light, 2=Dark

    var body: some View {
        Form {
            Section(header: Text("Appearance Mode"), footer: Text("Choose how the Blessed Irembo app looks for you. System option matches your device settings.")) {
                Picker("Theme", selection: $userInterfaceStyle) {
                    Text("System Settings").tag(0)
                        .font(.body)
                    Text("Light Mode").tag(1)
                    Text("Dark Mode").tag(2)
                }
                .pickerStyle(InlinePickerStyle())
                .tint(.primaryTeal)
            }
        }
        .navigationTitle("Appearance")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    UserAppearanceSettingsView()
}
