/// Pharmacy Subscription View
///
/// Subscription plans and payment management.

import SwiftUI

struct PharmacySubscriptionView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Text("Upgrade Your Plan")
                        .font(.title2)
                        .bold()
                        .foregroundColor(.textPrimary)
                    
                    Text("Choose the best plan for your pharmacy business needs")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding(.top, 20)
                
                // Current Plan
                VStack(alignment: .leading, spacing: 12) {
                    Text("Current Plan")
                        .font(.headline)
                        .foregroundColor(.textSecondary)
                    
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Basic")
                                .font(.title3)
                                .bold()
                                .foregroundColor(.primaryTeal)
                            Text("Free Forever")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                            .font(.title2)
                    }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                }
                .padding(.horizontal)
                
                // PRO Plan
                VStack(spacing: 0) {
                    // Banner
                    Text("MOST POPULAR")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.vertical, 6)
                        .frame(maxWidth: .infinity)
                        .background(Color.primaryTeal)
                    
                    VStack(spacing: 20) {
                        Text("Professional")
                            .font(.title)
                            .bold()
                            .foregroundColor(.textPrimary)
                        
                        HStack(alignment: .lastTextBaseline, spacing: 4) {
                            Text("RWF 25,000")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.textPrimary)
                            Text("/month")
                                .font(.body)
                                .foregroundColor(.textSecondary)
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            FeatureRow(text: "Unlimited Inquiries")
                            FeatureRow(text: "Advanced Analytics")
                            FeatureRow(text: "Priority Support")
                            FeatureRow(text: "Verified Badge")
                            FeatureRow(text: "Featured on Search")
                        }
                        
                        Button(action: {}) {
                            Text("Upgrade Now")
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.primaryTeal)
                                .cornerRadius(10)
                        }
                    }
                    .padding(24)
                    .background(Color.white)
                }
                .cornerRadius(16)
                .shadow(color: Color.primaryTeal.opacity(0.2), radius: 10, x: 0, y: 5)
                .padding(.horizontal)
                
                // Enterprise Plan
                VStack(spacing: 20) {
                    Text("Enterprise")
                        .font(.title2)
                        .bold()
                        .foregroundColor(.textPrimary)
                    
                    Text("Contact Us for pricing")
                        .font(.headline)
                        .foregroundColor(.textSecondary)
                    
                    Button(action: {}) {
                        Text("Contact Sales")
                            .fontWeight(.semibold)
                            .foregroundColor(.primaryTeal)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(Color.primaryTeal, lineWidth: 2)
                            )
                    }
                }
                .padding(24)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                .padding(.horizontal)
                
                Spacer(minLength: 20)
            }
        }
        .background(Color.gray.opacity(0.05))
        .navigationTitle("Subscription")
    }
}

struct FeatureRow: View {
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.green)
            Text(text)
                .font(.body)
                .foregroundColor(.textSecondary)
        }
    }
}
