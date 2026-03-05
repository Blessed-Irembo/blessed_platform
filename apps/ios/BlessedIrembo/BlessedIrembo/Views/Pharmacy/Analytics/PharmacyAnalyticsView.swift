/// Pharmacy Analytics View
///
/// Statistics and charts for the pharmacy.

import SwiftUI

struct PharmacyAnalyticsView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Summary Cards
                analyticsSummary
                
                // Chart Placeholder (Views)
                chartSection(title: "Profile Views", height: 200, color: .primaryTeal)
                
                // Chart Placeholder (Inquiries)
                chartSection(title: "Inquiries Over Time", height: 200, color: .purple)
                
                // Top Products? or Top Questions
                topQuestionsSection
                
                Spacer()
            }
            .padding()
        }
        .background(Color.gray.opacity(0.05))
        .navigationTitle("Analytics")
    }
    
    private var analyticsSummary: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
            AnalyticsCard(title: "Total Visits", value: "3,450", trend: "+15%")
            AnalyticsCard(title: "Impressions", value: "12.5k", trend: "+8%")
            AnalyticsCard(title: "Click Rate", value: "4.2%", trend: "-1%")
            AnalyticsCard(title: "Avg Time", value: "1m 30s", trend: "+12%")
        }
    }
    
    private func chartSection(title: String, height: CGFloat, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)
                .foregroundColor(.textPrimary)
            
            // Mock Chart - just a rounded rect with visual flair for now
            ZStack(alignment: .bottom) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.white)
                    .frame(height: height)
                    .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                
                // Visual bars
                HStack(alignment: .bottom, spacing: 12) {
                    ForEach(0..<7) { _ in
                        RoundedRectangle(cornerRadius: 4)
                            .fill(color.opacity(Double.random(in: 0.3...1.0)))
                            .frame(height: CGFloat.random(in: 40...140))
                    }
                }
                .padding(.bottom, 20)
            }
        }
    }
    
    private var topQuestionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Top User Questions")
                .font(.headline)
                .foregroundColor(.textPrimary)
            
            VStack(spacing: 0) {
                TopQuestionRow(question: "Do you have Amoxicillin?", percentage: "35%")
                Divider()
                TopQuestionRow(question: "Are you open on Sundays?", percentage: "25%")
                Divider()
                TopQuestionRow(question: "Do you accept insurance?", percentage: "15%")
            }
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

struct TopQuestionRow: View {
    let question: String
    let percentage: String
    
    var body: some View {
        HStack {
            Text(question)
                .font(.subheadline)
                .foregroundColor(.textPrimary)
            Spacer()
            Text(percentage)
                .font(.subheadline)
                .bold()
                .foregroundColor(.primaryTeal)
        }
        .padding()
    }
}
