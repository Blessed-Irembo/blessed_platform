/// Guest Sign In Prompt View
///
/// Prompts guest users to sign in or register an account to view pharmacy details.
/// Features a logo lock illustration, clear CTAs, and a dismiss link.

import SwiftUI

struct GuestSignInPromptView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    // Navigation triggers inside the sheet
    @State private var navigateToSignIn = false
    @State private var navigateToUserSignUp = false
    @State private var navigateToPharmacySignUp = false
    
    // Auth type selection modal/alert
    @State private var showSignUpOptions = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Spacer()
                
                // ── Illustration (Logo + Lock Badge) ──
                ZStack {
                    // Soft teal circle backdrop
                    Circle()
                        .fill(
                            RadialGradient(
                                gradient: Gradient(colors: [
                                    Color.primaryTeal.opacity(0.12),
                                    Color.primaryTeal.opacity(0.04)
                                ]),
                                center: .center,
                                startRadius: 0,
                                endRadius: 80
                            )
                        )
                        .frame(width: 160, height: 160)
                    
                    // Logo image
                    Image("logo2")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 110, height: 110)
                    
                    // Lock icon badge at bottom right
                    Circle()
                        .fill(Color.primaryTeal)
                        .frame(width: 40, height: 40)
                        .overlay(
                            Image(systemName: "lock.fill")
                                .foregroundColor(.white)
                                .font(.system(size: 18, weight: .bold))
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 2, y: 2)
                        .offset(x: 55, y: 55)
                }
                .padding(.bottom, 36)
                
                // ── Title & Subtitle ──
                VStack(spacing: 12) {
                    Text(appState.t("guest.signInTitle"))
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(.textPrimary)
                        .multilineTextAlignment(.center)
                    
                    Text(appState.t("guest.signInSubtitle"))
                        .font(.system(size: 15))
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                        .padding(.horizontal, 24)
                }
                .padding(.bottom, 40)
                
                Spacer()
                
                // ── Action Buttons ──
                VStack(spacing: 12) {
                    // Sign In Button
                    Button(action: { navigateToSignIn = true }) {
                        Text(appState.t("guest.signInButton"))
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.primaryTeal)
                            .cornerRadius(14)
                            .shadow(color: Color.primaryTeal.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                    
                    // Create Account Button (Outlined)
                    Button(action: { showSignUpOptions = true }) {
                        Text(appState.t("guest.createAccount"))
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.primaryTeal)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(Color.primaryTeal, lineWidth: 1.5)
                            )
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
                
                // ── OR Divider ──
                HStack {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 1)
                    Text(appState.t("common.or"))
                        .font(.system(size: 13))
                        .foregroundColor(.gray.opacity(0.6))
                        .padding(.horizontal, 8)
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 1)
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 20)
                
                // ── Continue Browsing Link ──
                Button(action: { dismiss() }) {
                    Text(appState.t("guest.continueBrowsing"))
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.primaryTeal)
                        .padding(.vertical, 8)
                }
                .padding(.bottom, 32)
            }
            .background(Color(.systemBackground).ignoresSafeArea())
            
            // ── Navigation Destinations inside the sheet ──
            .navigationDestination(isPresented: $navigateToSignIn) {
                SignInView()
                    .environmentObject(appState)
            }
            .navigationDestination(isPresented: $navigateToUserSignUp) {
                SignUpUserView()
                    .environmentObject(appState)
            }
            .navigationDestination(isPresented: $navigateToPharmacySignUp) {
                SignUpPharmacyView()
                    .environmentObject(appState)
            }
            
            // ── Sign Up options dialog ──
            .confirmationDialog(
                appState.t("profile.signInOrRegister"),
                isPresented: $showSignUpOptions,
                titleVisibility: .visible
            ) {
                Button(appState.t("role.registerUser")) {
                    navigateToUserSignUp = true
                }
                Button(appState.t("role.registerPharmacy")) {
                    navigateToPharmacySignUp = true
                }
                Button(appState.t("common.cancel"), role: .cancel) {}
            }
        }
    }
}

#Preview {
    GuestSignInPromptView()
        .environmentObject(AppState())
}
