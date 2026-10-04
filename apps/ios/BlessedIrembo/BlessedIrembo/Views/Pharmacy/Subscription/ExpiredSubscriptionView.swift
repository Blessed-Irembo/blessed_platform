/// Expired Subscription View (iOS)
///
/// High-end, professional paywall and account recovery screen shown
/// when a pharmacy's subscription has expired.
///
/// Features:
/// - Reassuring status badge and ambient hero illustration
/// - Safe data preservation reassurance banner
/// - Clear overview of reactivation benefits (map pin, contacts, analytics)
/// - One-tap renewal button redirecting to Subscription tab
/// - Quick support channels (WhatsApp & direct phone call)
/// - Direct "Go to Profile" and "Sign Out" actions so owners are NEVER locked in

import SwiftUI

struct ExpiredSubscriptionView: View {

    @EnvironmentObject var appState: AppState

    /// The index of the Subscription tab in PharmacyMainView.
    /// Passed in so tapping "Renew" jumps directly to that tab.
    @Binding var selectedTab: Int
    let subscriptionTabIndex: Int

    @State private var showSignOutAlert: Bool = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // ── Hero Section ──────────────────────────────────────
                VStack(spacing: 16) {
                    // Status Pill
                    HStack(spacing: 6) {
                        Circle()
                            .fill(Color.orange)
                            .frame(width: 8, height: 8)
                        Text(appState.t("subscription.listingPausedStatus"))
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.orange)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.orange.opacity(0.12))
                    .clipShape(Capsule())

                    // Ambient Hero Badge
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color.orange.opacity(0.18), Color.orange.opacity(0.06)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 92, height: 92)

                        Circle()
                            .strokeBorder(Color.orange.opacity(0.25), lineWidth: 1.5)
                            .frame(width: 92, height: 92)

                        Image(systemName: "pause.circle.fill")
                            .font(.system(size: 46, weight: .semibold))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [Color.orange, Color.red.opacity(0.85)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                    }

                    // Title & Pharmacy Name
                    VStack(spacing: 6) {
                        Text(appState.t("subscription.expiredTitle"))
                            .font(.title2.weight(.bold))
                            .foregroundColor(.primary)

                        if let name = appState.currentPharmacy?.name {
                            HStack(spacing: 6) {
                                Image(systemName: "cross.case.fill")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                Text(name)
                                    .font(.subheadline.weight(.medium))
                                    .foregroundColor(.secondary)
                            }
                        }
                    }

                    // Expiry Date Badge
                    if !expiryText.isEmpty {
                        HStack(spacing: 6) {
                            Image(systemName: "calendar.badge.clock")
                                .font(.caption)
                                .foregroundColor(.orange)
                            Text(expiryText)
                                .font(.caption.weight(.medium))
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(Capsule())
                    }

                    Text(appState.t("subscription.expiredSubtitle"))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .padding(.top, 12)

                // ── Data Preservation Reassurance Card ─────────────────
                HStack(alignment: .top, spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(Color.primaryTeal.opacity(0.12))
                            .frame(width: 40, height: 40)
                        Image(systemName: "lock.shield.fill")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(Color.primaryTeal)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(appState.t("subscription.dataPreserved"))
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.primary)
                        Text(appState.t("subscription.expiredListingPaused"))
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 0)
                }
                .padding(14)
                .background(Color(.secondarySystemBackground))
                .cornerRadius(14)
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .strokeBorder(Color.primaryTeal.opacity(0.2), lineWidth: 1)
                )
                .padding(.horizontal, 20)

                // ── Reactivation Benefits ──────────────────────────────
                VStack(alignment: .leading, spacing: 14) {
                    Text(appState.t("subscription.whatReactivationUnlocks"))
                        .font(.caption.weight(.semibold))
                        .foregroundColor(.secondary)
                        .textCase(.uppercase)
                        .padding(.horizontal, 4)

                    VStack(spacing: 12) {
                        benefitRow(
                            icon: "map.fill",
                            iconColor: Color.primaryTeal,
                            title: appState.t("subscription.benefit1"),
                            description: appState.t("subscription.benefitMapDesc")
                        )

                        Divider()
                            .padding(.leading, 48)

                        benefitRow(
                            icon: "phone.bubble.fill",
                            iconColor: .green,
                            title: appState.t("subscription.benefit2"),
                            description: appState.t("subscription.benefitContactDesc")
                        )

                        Divider()
                            .padding(.leading, 48)

                        benefitRow(
                            icon: "chart.xyaxis.line",
                            iconColor: .indigo,
                            title: appState.t("subscription.benefit3"),
                            description: appState.t("subscription.benefitAnalyticsDesc")
                        )
                    }
                    .padding(16)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(16)
                }
                .padding(.horizontal, 20)

                // ── Primary Action: Renew Button ───────────────────────
                VStack(spacing: 8) {
                    Button(action: { selectedTab = subscriptionTabIndex }) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.clockwise.circle.fill")
                                .font(.headline)
                            Text(appState.t("subscription.renew"))
                                .font(.headline.weight(.semibold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.primaryTeal)
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .shadow(color: Color.primaryTeal.opacity(0.3), radius: 8, x: 0, y: 4)
                    }

                    Text(appState.t("subscription.plansStartFrom"))
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack(spacing: 4) {
                        Image(systemName: "bolt.shield.fill")
                            .font(.caption2)
                            .foregroundColor(.green)
                        Text(appState.t("subscription.instantActivation"))
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal, 20)

                // ── Support Channels ──────────────────────────────────
                HStack(spacing: 12) {
                    Button(action: openWhatsAppSupport) {
                        HStack(spacing: 6) {
                            Image(systemName: "bubble.left.fill")
                                .font(.subheadline)
                            Text(appState.t("subscription.whatsappSupport"))
                                .font(.subheadline.weight(.medium))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color(.secondarySystemBackground))
                        .foregroundColor(.green)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }

                    Button(action: openPhoneSupport) {
                        HStack(spacing: 6) {
                            Image(systemName: "phone.fill")
                                .font(.subheadline)
                            Text(appState.t("subscription.callSupport"))
                                .font(.subheadline.weight(.medium))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color(.secondarySystemBackground))
                        .foregroundColor(Color.primaryTeal)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                }
                .padding(.horizontal, 20)

                // ── Account Management & Sign Out ─────────────────────
                VStack(spacing: 10) {
                    // Navigate to Profile tab (Tab 2)
                    Button(action: { selectedTab = 2 }) {
                        HStack(spacing: 8) {
                            Image(systemName: "person.crop.circle")
                            Text(appState.t("subscription.manageProfileSettings"))
                        }
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.primary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }

                    // Direct Sign Out
                    Button(role: .destructive, action: { showSignOutAlert = true }) {
                        HStack(spacing: 8) {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text(appState.t("subscription.accountSignOut"))
                        }
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.red.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 4)
                .padding(.bottom, 36)
            }
        }
        .background(Color(.systemGroupedBackground))
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showSignOutAlert = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text(appState.t("profile.pharmacy.logout"))
                    }
                    .font(.footnote.weight(.medium))
                    .foregroundColor(.red)
                }
            }
        }
        .alert(appState.t("profile.pharmacy.logout"), isPresented: $showSignOutAlert) {
            Button(appState.t("common.cancel"), role: .cancel) { }
            Button(appState.t("profile.pharmacy.logout"), role: .destructive) {
                appState.signOut()
            }
        } message: {
            Text(appState.t("profile.pharmacy.logoutPrompt"))
        }
    }

    // MARK: - Helpers

    private var expiryText: String {
        if let pharmacy = appState.currentPharmacy,
           let endDate = pharmacy.subscriptionEndDate {
            let formatted = endDate.formatted(date: .long, time: .omitted)
            return String(format: appState.t("subscription.expiredOnDate"), formatted)
        }
        return ""
    }

    private func benefitRow(icon: String, iconColor: Color, title: String, description: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(iconColor.opacity(0.12))
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(iconColor)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.primary)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
    }

    private func openWhatsAppSupport() {
        let phone = "250799538220"
        let message = "Hello Blessed HealthConnect Support, I need help with my pharmacy subscription renewal."
        let escaped = message.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        if let url = URL(string: "https://wa.me/\(phone)?text=\(escaped)") {
            UIApplication.shared.open(url)
        }
    }

    private func openPhoneSupport() {
        if let url = URL(string: "tel:+250799538220") {
            UIApplication.shared.open(url)
        }
    }
}
