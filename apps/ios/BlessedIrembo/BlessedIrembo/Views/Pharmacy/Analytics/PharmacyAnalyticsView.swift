/// Pharmacy Analytics View
///
/// Live analytics screen for the pharmacy owner.
/// Metrics are streamed from Firestore in real time via
/// PharmacyDashboardViewModel — the same listener shared with the Dashboard tab.
///
/// Tracks:
///   - WhatsApp Clicks: incremented when a user taps "Chat on WhatsApp"
///   - Profile Views:   incremented when a user opens the pharmacy detail screen

import SwiftUI

struct PharmacyAnalyticsView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var viewModel: PharmacyDashboardViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                pageHeader
                summaryCards
                whatsappSection
                profileViewsSection
                Spacer()
            }
            .padding()
        }
        .background(Color.gray.opacity(0.05))
        .navigationTitle(appState.t("nav.analytics"))
    }

    // MARK: - Page Header

    private var pageHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(appState.t("nav.analytics"))
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(Color.textPrimary)
                HStack(spacing: 5) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 7, height: 7)
                    Text(appState.t("analytics.liveData"))
                        .font(.caption)
                        .foregroundColor(Color.textSecondary)
                }
            }
            Spacer()
        }
    }

    // MARK: - Summary Cards

    private var summaryCards: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            AnalyticsCard(
                title: appState.t("dashboard.whatsappClicks"),
                value: "\(viewModel.whatsappClicks)",
                icon: "message.fill",
                color: Color(red: 0.145, green: 0.827, blue: 0.4)
            )
            AnalyticsCard(
                title: appState.t("dashboard.profileViews"),
                value: "\(viewModel.profileViews)",
                icon: "eye.fill",
                color: Color.blue
            )
            AnalyticsCard(
                title: appState.t("dashboard.subscription"),
                value: viewModel.subscriptionPlan,
                icon: viewModel.isPremium ? "star.fill" : "person.fill",
                color: viewModel.isPremium ? Color(hex: "4F46E5") : Color.primaryTeal
            )
            AnalyticsCard(
                title: appState.t("dashboard.status"),
                value: appState.t(appState.currentPharmacy?.isCurrentlyOpen == true ? "map.open" : "map.closed"),
                icon: "clock.fill",
                color: appState.currentPharmacy?.isCurrentlyOpen == true ? Color.green : Color.red
            )
        }
    }

    // MARK: - WhatsApp Engagement Section

    private var whatsappSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(appState.t("analytics.whatsappEngagement"))
                .font(.headline)
                .foregroundColor(Color.textPrimary)

            VStack(spacing: 20) {
                HStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(Color(red: 0.145, green: 0.827, blue: 0.4).opacity(0.12))
                            .frame(width: 56, height: 56)
                        Image(systemName: "message.fill")
                            .font(.system(size: 24))
                            .foregroundColor(Color(red: 0.145, green: 0.827, blue: 0.4))
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(viewModel.whatsappClicks)")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(Color.textPrimary)
                        Text(appState.t("analytics.totalWhatsappContacts"))
                            .font(.subheadline)
                            .foregroundColor(Color.textSecondary)
                    }

                    Spacer()
                }

                Divider()

                Text(appState.t("analytics.whatsappDescription"))
                    .font(.caption)
                    .foregroundColor(Color.textSecondary)
                    .multilineTextAlignment(.leading)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
    }

    // MARK: - Profile Views Section

    private var profileViewsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(appState.t("dashboard.profileViews"))
                .font(.headline)
                .foregroundColor(Color.textPrimary)

            VStack(spacing: 20) {
                HStack(spacing: 16) {
                    // Animated eye icon circle
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.10))
                            .frame(width: 56, height: 56)
                        Image(systemName: "eye.fill")
                            .font(.system(size: 24))
                            .foregroundColor(Color.blue)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(viewModel.profileViews)")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(Color.textPrimary)
                            .animation(.easeOut(duration: 0.4), value: viewModel.profileViews)
                        Text(appState.t("analytics.usersOpenedProfile"))
                            .font(.subheadline)
                            .foregroundColor(Color.textSecondary)
                    }

                    Spacer()
                }

                Divider()

                Text(appState.t("analytics.profileViewsDescription"))
                    .font(.caption)
                    .foregroundColor(Color.textSecondary)
                    .multilineTextAlignment(.leading)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
    }
}

// MARK: - Analytics Card

struct AnalyticsCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(color)
                    .padding(8)
                    .background(color.opacity(0.1))
                    .clipShape(Circle())
                Spacer()
            }

            Text(value)
                .font(.title2)
                .bold()
                .foregroundColor(Color.textPrimary)

            Text(title)
                .font(.caption)
                .foregroundColor(Color.textSecondary)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}
