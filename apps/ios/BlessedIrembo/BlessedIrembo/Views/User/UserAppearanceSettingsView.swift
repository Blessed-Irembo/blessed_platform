import SwiftUI

struct UserAppearanceSettingsView: View {
    @EnvironmentObject var appState: AppState
    @AppStorage("userInterfaceStyle") private var userInterfaceStyle: Int = 0 // 0=System, 1=Light, 2=Dark

    var body: some View {
        Form {
            // Theme Selection Section
            Section(
                header: Text(appState.t("appearance.themeSection")),
                footer: Text(appState.t("appearance.themeFooter"))
            ) {
                Picker(appState.t("appearance.themeLabel"), selection: $userInterfaceStyle) {
                    Text(appState.t("appearance.system")).tag(0)
                        .font(.body)
                    Text(appState.t("appearance.light")).tag(1)
                    Text(appState.t("appearance.dark")).tag(2)
                }
                .pickerStyle(InlinePickerStyle())
                .tint(.primaryTeal)
            }
            
            // App Language Section
            Section(
                header: Text(appState.t("appearance.languageSection")),
                footer: Text(appState.t("appearance.languageFooter"))
            ) {
                Picker(appState.t("appearance.languageLabel"), selection: $appState.selectedLanguage) {
                    ForEach(Language.allCases) { language in
                        Text(language.fullName)
                            .tag(language)
                    }
                }
                .pickerStyle(InlinePickerStyle())
                .tint(.primaryTeal)
                .onChange(of: appState.selectedLanguage) { newValue in
                    // Automatically persist selection to UserDefaults
                    UserDefaults.standard.set(newValue.code, forKey: UserDefaultsKeys.selectedLanguage)
                }
            }
        }
        .navigationTitle(appState.t("appearance.title"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    UserAppearanceSettingsView()
        .environmentObject(AppState())
}
