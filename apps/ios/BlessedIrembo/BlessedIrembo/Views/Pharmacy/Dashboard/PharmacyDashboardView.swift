/// Pharmacy Dashboard View
///
/// Overview screen showing live engagement metrics fetched directly
/// from Firestore via the shared PharmacyDashboardViewModel listener.
/// Metrics update in real time whenever a user interacts with the pharmacy
/// on any platform (iOS or web).

import SwiftUI

struct PharmacyDashboardView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var viewModel: PharmacyDashboardViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                headerSection
                if viewModel.isLoading {
                    loadingSection
                } else {
                    statsGrid
                }
                Spacer(minLength: 20)
            }
            .padding(.bottom, 20)
        }
        .background(Color.gray.opacity(0.05))
        .navigationBarHidden(true)
    }

    // MARK: - Header

    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Logo(size: 32)
                    Text("Blessed Irembo")
                        .font(.system(size: 28, weight: .black, design: .rounded))
                        .foregroundColor(Color.primaryTeal)
                }

                Text(appState.currentPharmacy?.name.uppercased() ?? "PHARMACY NAME")
                    .font(.system(size: 14, weight: .bold, design: .monospaced))
                    .tracking(2.0)
                    .foregroundColor(Color.textSecondary)
            }
            Spacer()

            NotificationBellView()
                .padding(10)
                .background(Color.white)
                .clipShape(Circle())
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }

    // MARK: - Loading

    private var loadingSection: some View {
        VStack(spacing: 12) {
            ProgressView()
                .tint(Color.primaryTeal)
            Text("Loading live metrics…")
                .font(.caption)
                .foregroundColor(Color.textSecondary)
        }
        .padding(.top, 40)
    }

    // MARK: - Stats Grid

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            // WhatsApp Clicks
            DashboardStatCard(
                title: "WhatsApp Clicks",
                value: "\(viewModel.whatsappClicks)",
                trend: "",
                icon: "message.fill",
                color: Color(red: 0.145, green: 0.827, blue: 0.4)
            )

            // Subscription Status
            DashboardStatCard(
                title: "Subscription",
                value: viewModel.subscriptionPlan,
                trend: "",
                icon: viewModel.isPremium ? "star.fill" : "person.fill",
                color: viewModel.isPremium ? Color(hex: "4F46E5") : Color.primaryTeal
            )

            // Profile Views
            DashboardStatCard(
                title: "Profile Views",
                value: "\(viewModel.profileViews)",
                trend: "",
                icon: "eye.fill",
                color: Color.blue
            )

            // Open / Closed status
            DashboardStatCard(
                title: "Status",
                value: appState.currentPharmacy?.isCurrentlyOpen == true ? "Open" : "Closed",
                trend: "",
                icon: "clock.fill",
                color: appState.currentPharmacy?.isCurrentlyOpen == true ? Color.green : Color.red
            )
        }
        .padding(.horizontal, 20)
    }

}

// MARK: - Dashboard Stat Card

struct DashboardStatCard: View {
    let title: String
    let value: String
    let trend: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                    .padding(10)
                    .background(color.opacity(0.1))
                    .clipShape(Circle())

                Spacer()

                if trend.contains("+") {
                    Text(trend)
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(Color.green)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(4)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(Color.textPrimary)

                Text(title)
                    .font(.caption)
                    .foregroundColor(Color.textSecondary)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}
