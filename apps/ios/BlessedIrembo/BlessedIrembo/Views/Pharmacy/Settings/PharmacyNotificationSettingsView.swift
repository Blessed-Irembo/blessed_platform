/// Pharmacy Notification Settings View
///
/// Notification preferences for the dashboard.

import SwiftUI

struct PharmacyNotificationSettingsView: View {
    @State private var emailNotifications = true
    @State private var pushNotifications = true
    @State private var inquiryAlerts = true
    @State private var stockAlerts = false
    @State private var marketingEmails = false
    
    var body: some View {
        List {
            Section("General") {
                Toggle("Push Notifications", isOn: $pushNotifications)
                    .tint(.primaryTeal)
                Toggle("Email Notifications", isOn: $emailNotifications)
                    .tint(.primaryTeal)
            }
            
            Section("Alerts") {
                Toggle("New Inquiries", isOn: $inquiryAlerts)
                    .tint(.primaryTeal)
                Toggle("Low Stock Warnings", isOn: $stockAlerts)
                    .tint(.primaryTeal)
            }
            
            Section("Updates") {
                Toggle("Marketing & Tips", isOn: $marketingEmails)
                    .tint(.primaryTeal)
            }
        }
        .navigationTitle("Notifications")
    }
}
