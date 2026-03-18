/// Pharmacy Analytics View
///
/// Statistics and charts for the pharmacy.

import SwiftUI

struct PharmacyAnalyticsView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var viewModel: PharmacyDashboardViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Summary Cards
                analyticsSummary
                
                // Real Data Metric Visualization
                inquiriesBreakdownSection
                
                Spacer()
            }
            .padding()
        }
        .background(Color.gray.opacity(0.05))
        .navigationTitle("Analytics")
    }
    
    private var analyticsSummary: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            AnalyticsCard(title: "Total Inquiries", value: "\(viewModel.totalInquiries)", trend: "")
            AnalyticsCard(title: "Unread Messages", value: "\(viewModel.unreadInquiries)", trend: viewModel.unreadInquiries > 0 ? "Action needed" : "")
            AnalyticsCard(title: "Total Reviews", value: "\(appState.currentPharmacy?.reviewCount ?? 0)", trend: "")
            AnalyticsCard(title: "Avg Rating", value: String(format: "%.1f", appState.currentPharmacy?.rating ?? 0.0), trend: "")
        }
    }
    
    private var inquiriesBreakdownSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Inquiries Breakdown")
                .font(.headline)
                .foregroundColor(.textPrimary)
            
            let total = max(1, viewModel.totalInquiries)
            let unread = viewModel.unreadInquiries
            let read = viewModel.totalInquiries - unread
            
            let readRatio = CGFloat(read) / CGFloat(total)
            let unreadRatio = CGFloat(unread) / CGFloat(total)
            
            VStack(spacing: 20) {
                // Visual Bar
                GeometryReader { geo in
                    HStack(spacing: 0) {
                        Rectangle()
                            .fill(Color.primaryTeal)
                            .frame(width: geo.size.width * readRatio)
                        Rectangle()
                            .fill(Color.orange)
                            .frame(width: geo.size.width * unreadRatio)
                    }
                    .cornerRadius(8)
                }
                .frame(height: 24)
                
                // Legend
                HStack(spacing: 24) {
                    HStack(spacing: 8) {
                        Circle().fill(Color.primaryTeal).frame(width: 8, height: 8)
                        Text("Read (\(read))")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                    }
                    
                    HStack(spacing: 8) {
                        Circle().fill(Color.orange).frame(width: 8, height: 8)
                        Text("Unread (\(unread))")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                    }
                    Spacer()
                }
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
    }
}
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
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}
