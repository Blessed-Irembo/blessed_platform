/// Pharmacy Main View
///
/// Main container for the pharmacy dashboard using TabView navigation.
/// Shows Dashboard, Inquiries, Analytics, and Profile tabs.

import SwiftUI

struct PharmacyMainView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Dashboard
            PharmacyDashboardView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            // Inquiries
            PharmacyInquiriesView()
                .tabItem {
                    Label("Inquiries", systemImage: "bubble.left.and.bubble.right.fill")
                }
                .tag(1)
            
            // Analytics
            PharmacyAnalyticsView()
                .tabItem {
                    Label("Analytics", systemImage: "chart.bar.fill")
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
            // Ensure UITabBar appearance matches app style
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = .white
            
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}


