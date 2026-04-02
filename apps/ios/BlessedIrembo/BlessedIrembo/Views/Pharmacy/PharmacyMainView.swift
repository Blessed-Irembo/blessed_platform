/// Pharmacy Main View
///
/// Main container for the pharmacy dashboard using TabView navigation.
/// Shows Dashboard, Analytics, Profile, and Settings tabs.
/// Inquiries tab has been removed — users contact pharmacies via WhatsApp instead.

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

            // Profile
            PharmacyProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.crop.circle.fill")
                }
                .tag(2)
        }
        .tint(.primaryTeal)
        .onAppear {
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
}
