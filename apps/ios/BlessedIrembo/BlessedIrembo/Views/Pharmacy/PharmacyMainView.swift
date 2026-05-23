/// Pharmacy Main View
///
/// Main container for the pharmacy dashboard using TabView navigation.
/// Shows Dashboard, Analytics, and Profile tabs.
///
/// Each tab that needs push navigation (Profile) is wrapped in its own
/// NavigationStack so NavigationLink destinations receive the environment
/// objects correctly and each tab has an independent navigation stack.

import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct PharmacyMainView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var dashboardViewModel = PharmacyDashboardViewModel()
    @State private var selectedTab = 0

    var body: some View {
        let isExpired: Bool = {
            if case .expired = appState.subscriptionStatus { return true }
            return false
        }()

        TabView(selection: $selectedTab) {
            // Dashboard — gated when expired
            NavigationStack {
                if isExpired {
                    ExpiredSubscriptionView(selectedTab: $selectedTab, subscriptionTabIndex: 3)
                        .navigationTitle("Dashboard")
                        .navigationBarTitleDisplayMode(.large)
                } else {
                    PharmacyDashboardView(viewModel: dashboardViewModel)
                }
            }
            .tabItem { Label(appState.t("nav.home"), systemImage: "house.fill") }
            .tag(0)

            // Analytics — gated when expired
            NavigationStack {
                if isExpired {
                    ExpiredSubscriptionView(selectedTab: $selectedTab, subscriptionTabIndex: 3)
                        .navigationTitle(appState.t("nav.analytics"))
                        .navigationBarTitleDisplayMode(.large)
                } else {
                    PharmacyAnalyticsView(viewModel: dashboardViewModel)
                }
            }
            .tabItem { Label(appState.t("nav.analytics"), systemImage: "chart.bar.fill") }
            .tag(1)

            // Profile — gated when expired
            NavigationStack {
                if isExpired {
                    ExpiredSubscriptionView(selectedTab: $selectedTab, subscriptionTabIndex: 3)
                        .navigationTitle(appState.t("nav.profile"))
                        .navigationBarTitleDisplayMode(.large)
                } else {
                    PharmacyProfileView()
                }
            }
            .tabItem { Label(appState.t("nav.profile"), systemImage: "person.crop.circle.fill") }
            .tag(2)

            // Subscription — ALWAYS accessible, never gated
            NavigationStack {
                PharmacySubscriptionView()
            }
            .tabItem { Label(appState.t("nav.subscription"), systemImage: "creditcard.fill") }
            .tag(3)
        }
        .tint(Color.primaryTeal)
        .onAppear {
            styleTabBar()
            startMetricsListener()
        }
        .onChange(of: appState.currentPharmacy?.id) { _ in
            startMetricsListener()
        }
    }

    // MARK: - Helpers

    private func startMetricsListener() {
        if let id = appState.currentPharmacy?.id {
            dashboardViewModel.startListening(for: id)
        }
    }

    private func styleTabBar() {
#if canImport(UIKit)
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = .white
        UITabBar.appearance().standardAppearance = appearance
        if #available(iOS 15.0, *) {
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
#endif
    }
}
