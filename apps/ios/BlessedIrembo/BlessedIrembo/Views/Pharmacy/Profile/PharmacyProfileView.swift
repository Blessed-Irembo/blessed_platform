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
                                Text(appState.t("profile.verifiedPartner"))
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
            Section(appState.t("profile.businessInfo")) {
                NavigationLink(destination: PharmacyProfileSettingsView()
                    .environmentObject(appState)) {
                    Label {
                        Text(appState.t("profile.editProfile"))
                    } icon: {
                        Image(systemName: "pencil.circle.fill")
                            .foregroundColor(.blue)
                    }
                }
            
                NavigationLink(destination: EditOperatingHoursView()
                    .environmentObject(appState)) {
                    Label {
                        Text(appState.t("profile.operatingHours"))
                    } icon: {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.orange)
                    }
                }
            
                NavigationLink(destination: EditLocationView()
                    .environmentObject(appState)) {
                    Label {
                        Text(appState.t("profile.locationAddress"))
                    } icon: {
                        Image(systemName: "mappin.circle.fill")
                            .foregroundColor(.red)
                    }
                }
            }
        
            // Management
            Section(appState.t("profile.management")) {
                NavigationLink(destination: PharmacySubscriptionView()) {
                    Label {
                        Text(appState.t("profile.subscriptionPlan"))
                    } icon: {
                        Image(systemName: "creditcard.fill")
                            .foregroundColor(.purple)
                    }
                }
            }
        
            // App Settings
            Section(appState.t("profile.appSettings")) {
                NavigationLink(destination: PharmacyNotificationSettingsView()) {
                    Label(appState.t("profile.notifications"), systemImage: "bell.fill")
                }
                Link(destination: URL(string: "https://www.blessedirembo.com/privacy-policy")!) {
                    Label(appState.t("profile.privacyPolicy"), systemImage: "shield.fill")
                        .foregroundColor(.primary)
                }
                Link(destination: URL(string: "https://www.blessedirembo.com/terms")!) {
                    Label(appState.t("profile.terms"), systemImage: "doc.text.fill")
                        .foregroundColor(.primary)
                }
                Link(destination: URL(string: "https://www.blessedirembo.com/help")!) {
                    Label(appState.t("profile.help"), systemImage: "questionmark.circle.fill")
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
                        Text(appState.t("profile.pharmacy.logout"))
                            .fontWeight(.semibold)
                        Spacer()
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle(appState.t("nav.profile"))
        .alert(appState.t("profile.pharmacy.logout"), isPresented: $showSignOutConfirmation) {
            Button(appState.t("common.cancel"), role: .cancel) { }
            Button(appState.t("profile.pharmacy.logout"), role: .destructive) {
                appState.signOut()
            }
        } message: {
            Text(appState.t("profile.pharmacy.logoutPrompt"))
        }
    }
}
