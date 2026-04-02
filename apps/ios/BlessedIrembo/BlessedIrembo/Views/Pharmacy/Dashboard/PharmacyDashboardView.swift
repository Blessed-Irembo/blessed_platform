/// Pharmacy Dashboard View
///
/// Overview screen for the pharmacy dashboard showing key statistics
/// and recent activity. Inquiries section removed — contact is via WhatsApp now.

import SwiftUI

struct PharmacyDashboardView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var viewModel: PharmacyDashboardViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                headerSection
                statsGrid
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
                Text("Blessed Irembo")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(.textPrimary)

                Text(appState.currentPharmacy?.name ?? "Pharmacy Name")
                    .font(.title3)
                    .foregroundColor(.textSecondary)
            }
            Spacer()

            // Notification Bell
            Button(action: {}) {
                Image(systemName: "bell.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.primaryTeal)
                    .padding(10)
                    .background(Color.white)
                    .clipShape(Circle())
                    .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }

    // MARK: - Stats Grid

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            DashboardStatCard(
                title: "WhatsApp Clicks",
                value: "\(viewModel.totalWhatsappClicks)",
                trend: "",
                icon: "message.fill",
                color: Color(red: 0.145, green: 0.827, blue: 0.4) // #25D366
            )

            DashboardStatCard(
                title: "Avg. Rating",
                value: String(format: "%.1f", appState.currentPharmacy?.rating ?? 0.0),
                trend: "",
                icon: "star.fill",
                color: .orange
            )

            DashboardStatCard(
                title: "Total Reviews",
                value: "\(appState.currentPharmacy?.reviewCount ?? 0)",
                trend: "",
                icon: "person.2.fill",
                color: .purple
            )

            DashboardStatCard(
                title: "Status",
                value: appState.currentPharmacy?.isCurrentlyOpen == true ? "Open" : "Closed",
                trend: "",
                icon: "clock.fill",
                color: appState.currentPharmacy?.isCurrentlyOpen == true ? .green : .red
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
                        .foregroundColor(.green)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(4)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.textPrimary)

                Text(title)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}
