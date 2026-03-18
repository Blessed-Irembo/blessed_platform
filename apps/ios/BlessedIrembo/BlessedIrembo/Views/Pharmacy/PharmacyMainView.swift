/// Pharmacy Main View
///
/// Main container for the pharmacy dashboard using TabView navigation.
/// Shows Dashboard, Inquiries, Analytics, and Profile tabs.

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
            
            // Inquiries
            PharmacyInquiriesView(viewModel: dashboardViewModel)
                .tabItem {
                    Label("Inquiries", systemImage: "bubble.left.and.bubble.right.fill")
                }
                .tag(1)
            
            // Analytics
            PharmacyAnalyticsView(viewModel: dashboardViewModel)
                .tabItem {
                    Image(systemName: "chart.bar.fill")
                    Text("Analytics")
                }
                .tag(2)
            
            // Profile
            PharmacyProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.crop.circle.fill")
                }
                .tag(3)
        }
        .tint(.primaryTeal)
        .onAppear {
            if let pharmacyId = appState.currentPharmacy?.id {
                dashboardViewModel.fetchInquiries(for: pharmacyId)
            }
            
#if canImport(UIKit)
            // Ensure UITabBar appearance matches app style
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


