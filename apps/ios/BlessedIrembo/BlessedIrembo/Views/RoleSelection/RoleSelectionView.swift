/// Role Selection View
///
/// Screen allowing users to choose between signing up as a regular user
/// or as a pharmacy owner. Also provides access to sign in.

import SwiftUI

struct RoleSelectionView: View {
    @State private var navigateToUserSignUp = false
    @State private var navigateToPharmacySignUp = false
    @State private var navigateToSignIn = false
    
    var body: some View {
        ZStack {
            Color.white.ignoresSafeArea()
            
            VStack(spacing: 32) {
                // Logo and title
                VStack(spacing: 16) {
                    Logo(size: 100)
                    
                    Text("Welcome Back!")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.textPrimary)
                    
                    Text("How would you like to continue?")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, 60)
                
                Spacer()
                
                // Role cards
                VStack(spacing: 20) {
                    RoleCard(
                        icon: "person.fill",
                        title: "I'm looking for a pharmacy",
                        description: "Find and connect with pharmacies",
                        color:.primaryTeal
                    ) {
                        navigateToUserSignUp = true
                    }
                    
                    RoleCard(
                        icon: "cross.case.fill",
                        title: "I own a pharmacy",
                        description: "Register your pharmacy",
                        color: .primaryTeal.opacity(0.8)
                    ) {
                        navigateToPharmacySignUp = true
                    }
                }
                .padding(.horizontal, 24)
                
                Spacer()
                
                // Sign in link
                Button(action: { navigateToSignIn = true }) {
                    HStack(spacing: 4) {
                        Text("Already have an account?")
                            .foregroundColor(.textSecondary)
                        Text("Sign In")
                            .foregroundColor(.primaryTeal)
                            .fontWeight(.semibold)
                    }
                    .font(.body)
                }
                .padding(.bottom, 40)
            }
        }
        .navigationDestination(isPresented: $navigateToUserSignUp) {
            SignUpUserView()
                .environmentObject(appState)
        }
        .navigationDestination(isPresented: $navigateToPharmacySignUp) {
            SignUpPharmacyView()
                .environmentObject(appState)
        }
        .navigationDestination(isPresented: $navigateToSignIn) {
            SignInView()
                .environmentObject(appState)
        }
    }
    
    @EnvironmentObject var appState: AppState
}

/// Role Selection Card Component
struct RoleCard: View {
    let icon: String
    let title: String
    let description: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 32))
                    .foregroundColor(color)
                    .frame(width: 60, height: 60)
                    .background(color.opacity(0.1))
                    .cornerRadius(12)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.textPrimary)
                    
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.textSecondary)
            }
            .padding()
            .background(Color.backgroundLight)
            .cornerRadius(Constants.Dimensions.cornerRadius)
            .overlay(
                RoundedRectangle(cornerRadius: Constants.Dimensions.cornerRadius)
                    .stroke(color.opacity(0.2), lineWidth: 1)
            )
        }
    }
}

#Preview {
    RoleSelectionView()
}
