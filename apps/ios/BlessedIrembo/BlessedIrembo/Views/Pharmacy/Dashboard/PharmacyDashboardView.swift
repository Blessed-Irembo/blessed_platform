/// Pharmacy Dashboard View
///
/// Overview screen for the pharmacy dashboard showing key statistics
/// and recent activity.

import SwiftUI

struct PharmacyDashboardView: View {
    @EnvironmentObject var appState: AppState
    
    // Mock Data for UI
    private let recentInquiries: [MockInquiry] = [
        MockInquiry(name: "John Doe", message: "Do you have Amoxicillin 500mg in stock?", time: "2m ago", initials: "JD"),
        MockInquiry(name: "Sarah Smith", message: "What are your opening hours on Sunday?", time: "15m ago", initials: "SS"),
        MockInquiry(name: "David N.", message: "I need a prescription refilled.", time: "1h ago", initials: "DN"),
        MockInquiry(name: "Alice M.", message: "Do you deliver to Kacyiru?", time: "2h ago", initials: "AM"),
        MockInquiry(name: "Peter K.", message: "Price for Vitamin C supplements?", time: "3h ago", initials: "PK")
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header Section
                headerSection
                
                // Stats Grid
                statsGrid
                
                // Quick Actions
                quickActionsSection
                
                // Recent Inquiries
                recentInquiriesSection
                
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
                Text("Dashboard")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(.textPrimary)
                
                Text(appState.currentPharmacy?.name ?? "Pharmacy Name")
                    .font(.title3)
                    .foregroundColor(.textSecondary)
            }
            Spacer()
            
            // Notification Bell
            Button(action: {}) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.primaryTeal)
                        .padding(10)
                        .background(Color.white)
                        .clipShape(Circle())
                        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                    
                    Circle()
                        .fill(Color.red)
                        .frame(width: 10, height: 10)
                        .offset(x: 0, y: 0)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }
    
    // MARK: - Stats Grid
    
    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            DashboardStatCard(
                title: "Total Inquiries",
                value: "125",
                trend: "+12%",
                icon: "bubble.left.fill",
                color: .blue
            )
            
            DashboardStatCard(
                title: "Profile Views",
                value: "1,240",
                trend: "+5%",
                icon: "eye.fill",
                color: .green
            )
            
            DashboardStatCard(
                title: "Avg. Rating",
                value: String(format: "%.1f", appState.currentPharmacy?.rating ?? 4.8),
                trend: "4.8", // Using trend for secondary info
                icon: "star.fill",
                color: .orange
            )
            
            DashboardStatCard(
                title: "Response Rate",
                value: "98%",
                trend: "High",
                icon: "arrow.turn.up.left",
                color: .purple
            )
        }
        .padding(.horizontal, 20)
    }
    
    // MARK: - Quick Actions
    
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Actions")
                .font(.headline)
                .foregroundColor(.textPrimary)
                .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    QuickActionButton(title: "Log Sale", icon: "plus.circle.fill", color: .primaryTeal)
                    QuickActionButton(title: "Update Stock", icon: "scribble.variable", color: .green) // box.truck.badge.clock.fill unavailable in iOS 14
                    QuickActionButton(title: "Add Promotion", icon: "megaphone.fill", color: .orange)
                    QuickActionButton(title: "Support", icon: "questionmark.circle.fill", color: .blue)
                }
                .padding(.horizontal, 20)
            }
        }
    }
    
    // MARK: - Recent Inquiries
    
    private var recentInquiriesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Recent Inquiries")
                    .font(.headline)
                    .foregroundColor(.textPrimary)
                
                Spacer()
                
                Button(action: {}) {
                    Text("View All")
                        .font(.subheadline)
                        .foregroundColor(.primaryTeal)
                        .fontWeight(.semibold)
                }
            }
            .padding(.horizontal, 20)
            
            VStack(spacing: 12) {
                ForEach(recentInquiries) { inquiry in
                    InquiryRow(inquiry: inquiry)
                }
            }
            .padding(.horizontal, 20)
        }
    }
}

// MARK: - Supporting Views & Models

struct MockInquiry: Identifiable {
    let id = UUID()
    let name: String
    let message: String
    let time: String
    let initials: String
}

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
                
                if title == "Avg. Rating" {
                    // special case for rating stars
                     HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                             .font(.caption2)
                             .foregroundColor(.orange)
                    }
                } else if trend.contains("+") {
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

struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color
    
    var body: some View {
        Button(action: {}) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(.white)
                    .frame(width: 50, height: 50)
                    .background(color)
                    .clipShape(Circle())
                    .shadow(color: color.opacity(0.3), radius: 5, x: 0, y: 3)
                
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.textPrimary)
            }
            .frame(width: 80)
        }
    }
}

struct InquiryRow: View {
    let inquiry: MockInquiry
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Avatar
            Circle()
                .fill(Color.gray.opacity(0.2))
                .frame(width: 48, height: 48)
                .overlay(
                    Text(inquiry.initials)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.gray)
                )
            
            // Content
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(inquiry.name)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    
                    Spacer()
                    
                    Text(inquiry.time)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }
                
                Text(inquiry.message)
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
                    .lineLimit(2)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.03), radius: 6, x: 0, y: 2)
    }
}
