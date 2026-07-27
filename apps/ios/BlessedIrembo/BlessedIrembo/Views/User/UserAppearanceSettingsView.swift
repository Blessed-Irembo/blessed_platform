import SwiftUI

struct UserAppearanceSettingsView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Form {
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
        .navigationTitle(appState.t("profile.appLanguage"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    UserAppearanceSettingsView()
        .environmentObject(AppState())
}
