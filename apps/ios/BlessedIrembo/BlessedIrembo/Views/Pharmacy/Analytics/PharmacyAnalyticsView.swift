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
        .navigationTitle("Analytics")
    }

    // MARK: - Page Header

    private var pageHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Analytics")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(Color.textPrimary)
                HStack(spacing: 5) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 7, height: 7)
                    Text("Live data")
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
                title: "WhatsApp Clicks",
                value: "\(viewModel.whatsappClicks)",
                icon: "message.fill",
                color: Color(red: 0.145, green: 0.827, blue: 0.4)
            )
            AnalyticsCard(
                title: "Profile Views",
                value: "\(viewModel.profileViews)",
                icon: "eye.fill",
                color: Color.blue
            )
            AnalyticsCard(
                title: "Subscription",
                value: viewModel.subscriptionPlan,
                icon: viewModel.isPremium ? "star.fill" : "person.fill",
                color: viewModel.isPremium ? Color(hex: "4F46E5") : Color.primaryTeal
            )
            AnalyticsCard(
                title: "Status",
                value: appState.currentPharmacy?.isCurrentlyOpen == true ? "Open" : "Closed",
                icon: "clock.fill",
                color: appState.currentPharmacy?.isCurrentlyOpen == true ? Color.green : Color.red
            )
        }
    }

    // MARK: - WhatsApp Engagement Section

    private var whatsappSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("WhatsApp Engagement")
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
                        Text("Total WhatsApp contacts")
                            .font(.subheadline)
                            .foregroundColor(Color.textSecondary)
                    }

                    Spacer()
                }

                Divider()

                Text("Every tap on \"Chat on WhatsApp\" from your pharmacy profile — on iOS or the web — is counted here in real time.")
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
            Text("Profile Views")
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
                        Text("Users who opened your pharmacy profile")
                            .font(.subheadline)
                            .foregroundColor(Color.textSecondary)
                    }

                    Spacer()
                }

                Divider()

                Text("A view is counted each time any user taps into the full details screen of your pharmacy — both from the map and from search results.")
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
