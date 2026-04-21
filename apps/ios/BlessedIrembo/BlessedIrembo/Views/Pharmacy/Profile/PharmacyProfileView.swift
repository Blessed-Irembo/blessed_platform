/// Pharmacy Profile View
///
/// Profile, settings, and subscription management for the pharmacy.

import SwiftUI

struct PharmacyProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var showSignOutConfirmation = false
    
    var body: some View {
        List {
            // Header
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                            .fill(Color.primaryTeal.opacity(0.1))
                            .frame(width: 80, height: 80)
                        
                            Image(systemName: "cross.case.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 40, height: 40)
                                .foregroundColor(.primaryTeal)
                        }
                    
                        VStack(spacing: 4) {
                            Text(appState.currentPharmacy?.name ?? "My Pharmacy")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.textPrimary)
                        
                            HStack(spacing: 6) {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundColor(.green)
                                    .font(.caption)
                                Text("Verified Partner")
                                    .font(.caption)
                                    .foregroundColor(.green)
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(12)
                        }
                    }
                    Spacer()
                }
                .padding(.vertical, 20)
                .listRowBackground(Color.clear)
            }
        
            // Business Info
            Section("Business Information") {
                NavigationLink(destination: PharmacyProfileSettingsView()
                    .environmentObject(appState)) {
                    Label {
                        Text("Edit Profile")
                    } icon: {
                        Image(systemName: "pencil.circle.fill")
                            .foregroundColor(.blue)
                    }
                }
            
                NavigationLink(destination: EditOperatingHoursView()
                    .environmentObject(appState)) {
                    Label {
                        Text("Operating Hours")
                    } icon: {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.orange)
                    }
                }
            
                NavigationLink(destination: EditLocationView()
                    .environmentObject(appState)) {
                    Label {
                        Text("Location & Address")
                    } icon: {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundColor(.red)
                    }
                }
            }
        
            // Management
            Section("Management") {
                NavigationLink(destination: PharmacySubscriptionView()) {
                    Label {
                        Text("Subscription Plan")
                    } icon: {
                        Image(systemName: "creditcard.fill")
                            .foregroundColor(.purple)
                    }
                }
            }
        
            // App Settings
            Section("App Settings") {
                NavigationLink(destination: PharmacyNotificationSettingsView()) {
                    Label("Notifications", systemImage: "bell.fill")
                }
                Link(destination: URL(string: "https://blessedirembo.com/privacy-policy")!) {
                    Label("Privacy Policy", systemImage: "shield.fill")
                        .foregroundColor(.primary)
                }
                Link(destination: URL(string: "https://blessedirembo.com/terms")!) {
                    Label("Terms & Conditions", systemImage: "doc.text.fill")
                        .foregroundColor(.primary)
                }
                Link(destination: URL(string: "https://blessedirembo.com/help")!) {
                    Label("Help & Support", systemImage: "questionmark.circle.fill")
                        .foregroundColor(.primary)
                }
            }
        
            // Sign Out
            Section {
                Button(role: .destructive) {
                    showSignOutConfirmation = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Sign Out")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Profile")
        .alert("Sign Out", isPresented: $showSignOutConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Sign Out", role: .destructive) {
                appState.signOut()
            }
        } message: {
            Text("Are you sure you want to sign out?")
        }
    }
}
