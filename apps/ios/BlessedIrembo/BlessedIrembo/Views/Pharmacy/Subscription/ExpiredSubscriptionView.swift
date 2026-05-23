/// Expired Subscription View (iOS)
///
/// Full-screen paywall shown in place of Dashboard, Analytics, Profile,
/// and Settings tab contents when a pharmacy's subscription has expired.
/// The Subscription tab itself is always accessible so they can renew.

import SwiftUI

struct ExpiredSubscriptionView: View {

    @EnvironmentObject var appState: AppState

    /// The index of the Subscription tab in PharmacyMainView.
    /// Passed in so tapping "Renew" jumps directly to that tab.
    @Binding var selectedTab: Int
    let subscriptionTabIndex: Int

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                Spacer(minLength: 48)

                // ── Icon ──────────────────────────────────────────────
                ZStack {
                    Circle()
                        .fill(Color.red.opacity(0.1))
                        .frame(width: 100, height: 100)
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(.red)
                }
                .padding(.bottom, 24)

                // ── Title ─────────────────────────────────────────────
                Text(appState.t("subscription.expiredTitle"))
                    .font(.title2.weight(.bold))
                    .foregroundColor(.primary)
                    .padding(.bottom, 6)

                if let name = appState.currentPharmacy?.name {
                    Text(name)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .padding(.bottom, 4)
                }

                // ── Expiry detail ─────────────────────────────────────
                if !expiryText.isEmpty {
                    Text(expiryText)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .padding(.bottom, 12)
                }

                Text(appState.t("subscription.expiredListingPaused"))
                    .font(.footnote)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .padding(.bottom, 28)

                // ── Benefits ─────────────────────────────────────────
                VStack(alignment: .leading, spacing: 10) {
                    benefitRow(appState.t("subscription.benefit1"))
                    benefitRow(appState.t("subscription.benefit2"))
                    benefitRow(appState.t("subscription.benefit3"))
                }
                .padding(16)
                .background(Color(.secondarySystemBackground))
                .cornerRadius(14)
                .padding(.horizontal, 24)
                .padding(.bottom, 28)

                // ── Renew Button ──────────────────────────────────────
                Button(action: { selectedTab = subscriptionTabIndex }) {
                    HStack {
                        Image(systemName: "arrow.clockwise.circle.fill")
                        Text(appState.t("subscription.renew"))
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(15)
                    .background(Color.primaryTeal)
                    .foregroundColor(.white)
                    .cornerRadius(14)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 16)

                // ── Support ───────────────────────────────────────────
                Button(action: {
                    if let url = URL(string: "tel:+250799538220") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Text(appState.t("subscription.needHelpCall"))
                        .font(.footnote)
                        .foregroundColor(Color.primaryTeal)
                }

                Spacer(minLength: 48)
            }
        }
        .background(Color(.systemGroupedBackground))
    }

    // MARK: - Helpers

    private var expiryText: String {
        let status = appState.subscriptionStatus
        switch status {
        case .expired:
            if let pharmacy = appState.currentPharmacy,
               let endDate = pharmacy.subscriptionEndDate {
                let formatted = endDate.formatted(date: .long, time: .omitted)
                return String(format: appState.t("subscription.expiredOnDate"), formatted)
            } else {
                return ""
            }
        default:
            return ""
        }
    }

    private func benefitRow(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(Color.primaryTeal)
                .font(.subheadline)
                .padding(.top, 1)
            Text(text)
                .font(.subheadline)
                .foregroundColor(.secondary)
            Spacer()
        }
    }
}
