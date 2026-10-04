/// Pharmacy Profile View
///
/// Profile, settings, and subscription management for the pharmacy.

import SwiftUI

struct PharmacyProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var showSignOutConfirmation = false
    @State private var showDeleteConfirmation = false
    
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

            // Expired Subscription Alert Banner
            if case .expired = appState.subscriptionStatus {
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(.title3)
                                .foregroundColor(.orange)
                                .padding(.top, 2)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(appState.t("profile.subscriptionExpiredBannerTitle"))
                                    .font(.subheadline.weight(.bold))
                                    .foregroundColor(.textPrimary)
                                
                                Text(appState.t("profile.subscriptionExpiredBannerMessage"))
                                    .font(.caption)
                                    .foregroundColor(.textSecondary)
                                    .lineSpacing(2)
                            }
                        }
                        
                        NavigationLink(destination: PharmacySubscriptionView()) {
                            HStack {
                                Spacer()
                                Image(systemName: "arrow.clockwise.circle.fill")
                                Text(appState.t("profile.renewNow"))
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                            .font(.subheadline)
                            .foregroundColor(.white)
                            .padding(.vertical, 10)
                            .background(Color.primaryTeal)
                            .cornerRadius(10)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.vertical, 6)
                }
                .listRowBackground(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.orange.opacity(0.08))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.orange.opacity(0.25), lineWidth: 1)
                        )
                )
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
                    HStack {
                        Label {
                            Text(appState.t("profile.subscriptionPlan"))
                        } icon: {
                            Image(systemName: "creditcard.fill")
                                .foregroundColor(.purple)
                        }
                        Spacer()
                        if case .expired = appState.subscriptionStatus {
                            Text(appState.t("subscription.listingPausedStatus"))
                                .font(.caption.weight(.semibold))
                                .foregroundColor(.orange)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.orange.opacity(0.12))
                                .cornerRadius(8)
                        }
                    }
                }
            }
        
            // App Settings
            Section(appState.t("profile.appSettings")) {
                NavigationLink(destination: UserAppearanceSettingsView()) {
                    Label(appState.t("profile.appLanguage"), systemImage: "character.bubble.fill")
                }
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

            // Danger Zone (Delete Account)
            Section(header: Text("Danger Zone")) {
                Button(role: .destructive) {
                    showDeleteConfirmation = true
                } label: {
                    HStack {
                        Spacer()
                        Label(appState.t("profile.deleteAccount"), systemImage: "trash.fill")
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
        .sheet(isPresented: $showDeleteConfirmation) {
            DeleteAccountSheet()
                .environmentObject(appState)
        }
    }
}
