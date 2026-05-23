/// Pharmacy Inquiries View — Removed
///
/// This view is no longer used. Users contact pharmacies via WhatsApp.
/// The file is kept as a stub so existing Xcode project references compile.

import SwiftUI

struct PharmacyInquiriesView: View {
    @EnvironmentObject var appState: AppState
    // ViewModel kept in signature for backward compatibility with any existing
    // Xcode project file reference, but is no longer used in the UI.
    var viewModel: PharmacyDashboardViewModel? = nil

    var body: some View {
        VStack(spacing: 20) {
            Spacer()

            Image(systemName: "message.fill")
                .font(.system(size: 48))
                .foregroundColor(.primaryTeal.opacity(0.4))

            Text(appState.t("inquiries.removedTitle"))
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            Text(appState.t("inquiries.removedDesc"))
                .font(.body)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Spacer()
        }
        .navigationTitle(appState.t("nav.inquiries"))
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .white : .textPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.primaryTeal : Color.white)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
        }
    }
}
