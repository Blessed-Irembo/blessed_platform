/// Pharmacy Analytics View
///
/// Statistics and charts for the pharmacy owner.
/// Uses WhatsApp engagement data as the primary metric
/// (inquiries removed — users contact via WhatsApp instead).

import SwiftUI

struct PharmacyAnalyticsView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var viewModel: PharmacyDashboardViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                analyticsSummary
                whatsappEngagementSection
                Spacer()
            }
            .padding()
        }
        .background(Color.gray.opacity(0.05))
        .navigationTitle("Analytics")
    }

    // MARK: - Summary Cards

    private var analyticsSummary: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            AnalyticsCard(
                title: "WhatsApp Clicks",
                value: "\(viewModel.totalWhatsappClicks)",
                trend: ""
            )
            AnalyticsCard(
                title: "Avg Rating",
                value: String(format: "%.1f", appState.currentPharmacy?.rating ?? 0.0),
                trend: ""
            )
            AnalyticsCard(
                title: "Total Reviews",
                value: "\(appState.currentPharmacy?.reviewCount ?? 0)",
                trend: ""
            )
            AnalyticsCard(
                title: "Status",
                value: appState.currentPharmacy?.isCurrentlyOpen == true ? "Open" : "Closed",
                trend: ""
            )
        }
    }

    // MARK: - WhatsApp Engagement Section

    private var whatsappEngagementSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("WhatsApp Engagement")
                .font(.headline)
                .foregroundColor(.textPrimary)

            VStack(spacing: 20) {
                HStack(spacing: 16) {
                    // WhatsApp icon circle
                    ZStack {
                        Circle()
                            .fill(Color(red: 0.145, green: 0.827, blue: 0.4).opacity(0.12))
                            .frame(width: 56, height: 56)
                        Image(systemName: "message.fill")
                            .font(.system(size: 24))
                            .foregroundColor(Color(red: 0.145, green: 0.827, blue: 0.4))
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(viewModel.totalWhatsappClicks)")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(.textPrimary)
                        Text("Users contacted your pharmacy via WhatsApp")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                    }

                    Spacer()
                }

                Divider()

                Text("Every WhatsApp click is tracked when a user taps \"Chat on WhatsApp\" on your pharmacy profile.")
                    .font(.caption)
                    .foregroundColor(.textSecondary)
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
    let trend: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.caption)
                .foregroundColor(.textSecondary)

            HStack {
                Text(value)
                    .font(.title2)
                    .bold()
                    .foregroundColor(.textPrimary)

                Spacer()

                if !trend.isEmpty {
                    Text(trend)
                        .font(.caption)
                        .foregroundColor(trend.contains("+") ? .green : .red)
                        .padding(4)
                        .background(
                            (trend.contains("+") ? Color.green : Color.red)
                                .opacity(0.1)
                        )
                        .cornerRadius(4)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}
