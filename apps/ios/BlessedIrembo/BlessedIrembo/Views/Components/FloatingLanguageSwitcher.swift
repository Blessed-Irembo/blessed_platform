/// Floating Language Switcher
///
/// A premium, glassmorphic pill toggle component that overlays
/// safe areas to allow instant switching between English and Kinyarwanda.

import SwiftUI

struct FloatingLanguageSwitcher: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Button(action: {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                appState.toggleLanguage()
            }
        }) {
            HStack(spacing: 8) {
                Text("EN")
                    .font(.system(size: 13, weight: appState.selectedLanguage == .english ? .bold : .medium))
                    .foregroundColor(appState.selectedLanguage == .english ? Color.primaryTeal : Color.textSecondary.opacity(0.7))
                    .padding(.vertical, 4)
                    .padding(.horizontal, 6)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(appState.selectedLanguage == .english ? Color.primaryTeal.opacity(0.12) : Color.clear)
                    )
                
                Text("|")
                    .font(.system(size: 13, weight: .light))
                    .foregroundColor(Color.textSecondary.opacity(0.3))
                
                Text("RW")
                    .font(.system(size: 13, weight: appState.selectedLanguage == .kinyarwanda ? .bold : .medium))
                    .foregroundColor(appState.selectedLanguage == .kinyarwanda ? Color.primaryTeal : Color.textSecondary.opacity(0.7))
                    .padding(.vertical, 4)
                    .padding(.horizontal, 6)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(appState.selectedLanguage == .kinyarwanda ? Color.primaryTeal.opacity(0.12) : Color.clear)
                    )
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(Color.white.opacity(0.92))
                    .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 3)
            )
            .overlay(
                Capsule()
                    .stroke(Color.primaryTeal.opacity(0.15), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ZStack {
        Color.gray.opacity(0.2).ignoresSafeArea()
        FloatingLanguageSwitcher()
            .environmentObject(AppState())
    }
}
