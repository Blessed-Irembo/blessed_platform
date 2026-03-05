/// Sign In View
///
/// Universal sign in screen for both users and pharmacy owners.
/// Includes email/password authentication, remember me, and forgot password.

import SwiftUI

struct SignInView: View {
    @StateObject private var viewModel = AuthViewModel()
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    @State private var email = ""
    @State private var password = ""
    @State private var rememberMe = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 12) {
                    Logo(size: 80)
                        .padding(.top, 40)
                    
                    Text("Welcome Back")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textPrimary)
                    
                    Text("Sign in to continue")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                }
                
                // Form
                VStack(spacing: 16) {
                    CustomTextField(
                        placeholder: "Email",
                        systemImage: "envelope",
                        text: $email,
                        keyboardType: .emailAddress
                    )
                    
                    CustomTextField(
                        placeholder: "Password",
                        systemImage: "lock",
                        text: $password,
                        isSecure: true
                    )
                    
                    // Remember me & Forgot password
                    HStack {
                        Toggle("Remember me", isOn: $rememberMe)
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                        
                        Spacer()
                        
                        Button("Forgot?") {
                            // Forgot password action
                        }
                        .font(.subheadline)
                        .foregroundColor(.primaryTeal)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 32)
                
                // Sign In button
                PrimaryButton(
                    title: "Sign In",
                    isLoading: viewModel.isLoading
                ) {
                    signIn()
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                
                // Error message
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .font(.subheadline)
                        .foregroundColor(.red)
                        .padding(.horizontal, 24)
                }
                
                Spacer()
            }
        }
        .navigationTitle("Sign In")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func signIn() {
        // Capture appState and dismiss before entering closure
        let currentAppState = appState
        let dismissAction = dismiss
        print("DEBUG: signIn() called with email: \(email)")
        viewModel.signIn(email: email, password: password, rememberMe: rememberMe) { result in
            print("DEBUG: signIn completion called")
            DispatchQueue.main.async {
                switch result {
                case .success(let data):
                    print("DEBUG: signIn success - user: \(String(describing: data.user)), pharmacy: \(String(describing: data.pharmacy))")
                    if let user = data.user {
                        print("DEBUG: Calling appState.signIn(user:)")
                        currentAppState.signIn(user: user)
                        print("DEBUG: isAuthenticated = \(currentAppState.isAuthenticated)")
                    } else if let pharmacy = data.pharmacy {
                        print("DEBUG: Calling appState.signIn(pharmacy:)")
                        currentAppState.signIn(pharmacy: pharmacy)
                        print("DEBUG: isAuthenticated = \(currentAppState.isAuthenticated)")
                    }
                    // Dismiss SignInView to pop back to root - now showing authenticated view
                    print("DEBUG: Calling dismiss()")
                    dismissAction()
                case .failure(let error):
                    print("DEBUG: Sign in failed: \(error)")
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        SignInView()
            .environmentObject(AppState())
    }
}
