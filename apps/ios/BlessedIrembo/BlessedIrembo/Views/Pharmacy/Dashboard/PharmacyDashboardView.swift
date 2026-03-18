/// Pharmacy Dashboard View
///
/// Overview screen for the pharmacy dashboard showing key statistics
/// and recent activity.

import SwiftUI

struct PharmacyDashboardView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var viewModel: PharmacyDashboardViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header Section
                headerSection
                
                // Stats Grid
                statsGrid
                
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
    
    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            DashboardStatCard(
                title: "Total Inquiries",
                value: "\(viewModel.totalInquiries)",
                trend: "",
                icon: "bubble.left.fill",
                color: .blue
            )
            
            DashboardStatCard(
                title: "Unread Messages",
                value: "\(viewModel.unreadInquiries)",
                trend: viewModel.unreadInquiries > 0 ? "Action Needed" : "",
                icon: "envelope.badge.fill",
                color: .red
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
        }
        .padding(.horizontal, 20)
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
                ForEach(viewModel.inquiries.prefix(5)) { inquiry in
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

struct InquiryRow: View {
    let inquiry: Inquiry
    
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
                    Text(inquiry.userName)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.textPrimary)
                    
                    Spacer()
                    
                    Text(inquiry.timeAgoString)
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
