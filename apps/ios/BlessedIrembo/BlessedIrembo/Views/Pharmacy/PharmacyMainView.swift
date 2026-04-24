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
        TabView(selection: $selectedTab) {
            // Dashboard
            PharmacyDashboardView(viewModel: dashboardViewModel)
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            // Analytics
            PharmacyAnalyticsView(viewModel: dashboardViewModel)
                .tabItem {
                    Label("Analytics", systemImage: "chart.bar.fill")
                }
                .tag(1)

            // Profile — wrapped in its own NavigationStack so that
            // NavigationLink destinations (Edit Profile, Operating Hours,
            // Location & Address) can push and automatically receive
            // the AppState environment object.
            NavigationStack {
                PharmacyProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.crop.circle.fill")
            }
            .tag(2)

            // Subscription — wrapped in its own NavigationStack
            NavigationStack {
                PharmacySubscriptionView()
            }
            .tabItem {
                Label("Subscription", systemImage: "creditcard.fill")
            }
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
