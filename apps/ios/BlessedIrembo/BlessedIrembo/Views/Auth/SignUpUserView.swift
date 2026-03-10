/// Sign Up User View
///
/// Registration screen for regular users looking for pharmacies.
/// Includes form validation and terms & conditions acceptance.

import SwiftUI
import FirebaseAuth

struct SignUpUserView: View {
    @StateObject private var viewModel = AuthViewModel()
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    @State private var fullName = ""
    @State private var email = ""
    @State private var phoneNumber = ""
    @State private var password = ""
    @State private var confirmPassword = ""
   @State private var acceptedTerms = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 12) {
                    Logo(size: 70)
                        .padding(.top, 20)
                    
                    Text("Create Account")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textPrimary)
                    
                    Text("Sign up to find pharmacies")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                }
                
                // Form
                VStack(spacing: 16) {
                    CustomTextField(
                        placeholder: "Full Name",
                        systemImage: "person",
                        text: $fullName
                    )
                    
                    CustomTextField(
                        placeholder: "Email",
                        systemImage: "envelope",
                        text: $email,
                        keyboardType: .emailAddress
                    )
                    
                    CustomTextField(
                        placeholder: "Phone Number",
                        systemImage: "phone",
                        text: $phoneNumber,
                        keyboardType: .phonePad
                    )
                    
                    CustomTextField(
                        placeholder: "Password",
                        systemImage: "lock",
                        text: $password,
                        isSecure: true
                    )
                    
                    CustomTextField(
                        placeholder: "Confirm Password",
                        systemImage: "lock",
                        text: $confirmPassword,
                        isSecure: true
                    )
                    
                    // Terms & Conditions
                    Toggle(isOn: $acceptedTerms) {
                        HStack(spacing: 4) {
                            Text("I accept the")
                                .font(.subheadline)
                                .foregroundColor(.textSecondary)
                            Text("Terms & Conditions")
                                .font(.subheadline)
                                .foregroundColor(.primaryTeal)
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 24)
                
                // Sign Up button
                PrimaryButton(
                    title: "Sign Up",
                    isLoading: viewModel.isLoading
                ) {
                    signUp()
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
                
                // Sign in link
                Button(action: { dismiss() }) {
                    HStack(spacing: 4) {
                        Text("Already have an account?")
                            .foregroundColor(.textSecondary)
                        Text("Sign In")
                            .foregroundColor(.primaryTeal)
                            .fontWeight(.semibold)
                    }
                    .font(.body)
                }
                .padding(.bottom, 32)
            }
        }
        .navigationTitle("Sign Up")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func signUp() {
        viewModel.signUpUser(
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            password: password,
            confirmPassword: confirmPassword,
            acceptedTerms: acceptedTerms
        ) { result in
            switch result {
            case .success(let user):
                appState.signIn(user: user)
            case .failure(let error):
                print("Sign up failed: \(error)")
            }
        }
    }
}

#Preview {
    NavigationStack {
        SignUpUserView()
            .environmentObject(AppState())
    }
}
