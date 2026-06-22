/// User Profile View
///
/// Displays user profile information, settings, and account management options.
/// Includes logout functionality and consistent styling with the app design.

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var showLogoutConfirmation = false
    @State private var showDeleteAccountSheet = false
    @Environment(\.dismiss) var dismiss
    
    private var demoUser: User {
        User(fullName: "John Doe", email: "user@demo.com", phoneNumber: "+250788123456")
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Profile Header
                profileHeader
                
                // User Info Section
                userInfoSection
                
                // Settings Section
                settingsSection
                
                // About Section
                aboutSection
                
                // Logout Button
                logoutButton
                
                // Delete Account Button
                deleteAccountButton
                
                Spacer(minLength: 40)
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
        }
        .background(Color.gray.opacity(0.05).ignoresSafeArea())
        .navigationTitle(appState.t("profile.title"))
        .navigationBarTitleDisplayMode(.inline)
        .alert(appState.t("profile.logout"), isPresented: $showLogoutConfirmation) {
            Button(appState.t("common.cancel"), role: .cancel) { }
            Button(appState.t("profile.logout"), role: .destructive) {
                logout()
            }
        } message: {
            Text(appState.t("profile.logoutPrompt"))
        }
    }
    
    // MARK: - Profile Header
    
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.primaryTeal.opacity(0.2), Color.primaryTeal.opacity(0.1)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 100, height: 100)
                
                Image(systemName: "person.fill")
                    .font(.system(size: 45))
                    .foregroundColor(.primaryTeal)
            }
            
            // Name and Email
            VStack(spacing: 4) {
                Text((appState.currentUser ?? demoUser).fullName)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.textPrimary)
                
                Text((appState.currentUser ?? demoUser).email)
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
    
    // MARK: - User Info Section
    
    private var userInfoSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(appState.t("profile.personalInfo"))
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.textPrimary)
                Spacer()
                NavigationLink(destination: UserProfileSettingsView().environmentObject(appState)) {
                    Text(appState.t("profile.edit"))
                        .font(.subheadline)
                        .foregroundColor(.primaryTeal)
                }
            }
            .padding(.horizontal, 4)
            
            VStack(spacing: 12) {
                ProfileInfoRow(icon: "person.fill", label: appState.t("profile.fullName"), value: (appState.currentUser ?? demoUser).fullName)
                ProfileInfoRow(icon: "envelope.fill", label: appState.t("profile.email"), value: (appState.currentUser ?? demoUser).email)
                ProfileInfoRow(icon: "phone.fill", label: appState.t("profile.phone"), value: (appState.currentUser ?? demoUser).phoneNumber)
            }
            .padding(16)
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 6, x: 0, y: 2)
        }
    }
    
    // MARK: - Settings Section
    
    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(appState.t("profile.settings"))
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.textPrimary)
                .padding(.horizontal, 4)
            
            VStack(spacing: 0) {
                NavigationLink(destination: UserNotificationSettingsView()) {
                    SettingsRow(icon: "bell.fill", title: appState.t("profile.notifications"), hasChevron: true)
                }
                .buttonStyle(.plain)
                
                Divider().padding(.leading, 56)
                
                NavigationLink(destination: UserPrivacySettingsView()) {
                    SettingsRow(icon: "lock.fill", title: appState.t("profile.privacy"), hasChevron: true)
                }
                .buttonStyle(.plain)
                
                Divider().padding(.leading, 56)
                
                NavigationLink(destination: UserLocationSettingsView()) {
                    SettingsRow(icon: "map.fill", title: appState.t("profile.location"), hasChevron: true)
                }
                .buttonStyle(.plain)
                
                Divider().padding(.leading, 56)
                
                NavigationLink(destination: UserAppearanceSettingsView()) {
                    SettingsRow(icon: "paintbrush.fill", title: appState.t("profile.appearance"), hasChevron: true)
                }
                .buttonStyle(.plain)
            }
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 6, x: 0, y: 2)
        }
    }
    
    // MARK: - About Section
    
    private var aboutSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(appState.t("profile.about"))
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.textPrimary)
                .padding(.horizontal, 4)
            
            VStack(spacing: 0) {
                Link(destination: URL(string: "https://www.blessedirembo.com/help")!) {
                    SettingsRow(icon: "info.circle.fill", title: appState.t("profile.help"), hasChevron: true)
                }
                .buttonStyle(.plain)
                
                Divider().padding(.leading, 56)
                
                Link(destination: URL(string: "https://www.blessedirembo.com/terms")!) {
                    SettingsRow(icon: "doc.text.fill", title: appState.t("profile.terms"), hasChevron: true)
                }
                .buttonStyle(.plain)
                
                Divider().padding(.leading, 56)
                
                Link(destination: URL(string: "https://www.blessedirembo.com/privacy-policy")!) {
                    SettingsRow(icon: "shield.fill", title: appState.t("profile.privacyPolicy"), hasChevron: true)
                }
                .buttonStyle(.plain)
            }
            .background(Color.white)
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 6, x: 0, y: 2)
        }
    }
    
    // MARK: - Logout Button
    
    private var logoutButton: some View {
        Button(action: {
            showLogoutConfirmation = true
        }) {
            HStack(spacing: 12) {
                Image(systemName: "arrow.right.square.fill")
                    .font(.system(size: 20))
                
                Text(appState.t("profile.logout"))
                    .font(.system(size: 17, weight: .semibold))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                LinearGradient(
                    colors: [Color.red.opacity(0.8), Color.red],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(12)
            .shadow(color: Color.red.opacity(0.3), radius: 8, x: 0, y: 4)
        }
        .padding(.top, 8)
    }
    
    // MARK: - Delete Account Button
    
    private var deleteAccountButton: some View {
        Button(action: {
            showDeleteAccountSheet = true
        }) {
            HStack(spacing: 12) {
                Image(systemName: "trash.fill")
                    .font(.system(size: 20))
                
                Text(appState.t("profile.deleteAccount"))
                    .font(.system(size: 17, weight: .semibold))
            }
            .foregroundColor(.red)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.red.opacity(0.3), lineWidth: 1)
            )
        }
        .padding(.top, 8)
        .sheet(isPresented: $showDeleteAccountSheet) {
            DeleteAccountSheet()
                .environmentObject(appState)
        }
    }
    
    // MARK: - Actions
    
    private func logout() {
        appState.signOut()
        dismiss()
    }
}

// MARK: - Profile Info Row

struct ProfileInfoRow: View {
    let icon: String
    let label: String
    let value: String
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(.primaryTeal)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                
                Text(value)
                    .font(.body)
                    .foregroundColor(.textPrimary)
            }
            
            Spacer()
        }
    }
}

// MARK: - Settings Row

struct SettingsRow: View {
    let icon: String
    let title: String
    let hasChevron: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(.primaryTeal)
                .frame(width: 24)
            
            Text(title)
                .font(.body)
                .foregroundColor(.textPrimary)
            
            Spacer()
            
            if hasChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.gray.opacity(0.4))
            }
        }
        .padding(.vertical, 16)
        .padding(.horizontal, 16)
        .contentShape(Rectangle())
    }
}

#Preview {
    NavigationStack {
        ProfileView()
            .environmentObject(AppState())
    }
}
