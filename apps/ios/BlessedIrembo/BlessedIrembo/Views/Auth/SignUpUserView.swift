/// Sign Up User View
///
/// Registration screen for regular users looking for pharmacies.
/// Phone number is the PRIMARY field — email is optional.

import SwiftUI

struct SignUpUserView: View {
    @StateObject private var viewModel = AuthViewModel()
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var fullName        = ""
    @State private var phoneNumber     = ""   // PRIMARY
    @State private var email           = ""   // optional
    @State private var password        = ""
    @State private var confirmPassword = ""
    @State private var acceptedTerms   = false
    @State private var showPassword         = false
    @State private var showConfirmPassword  = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // ── Header ──────────────────────────────────────────────
                VStack(spacing: 10) {
                    Logo(size: 64)
                        .padding(.top, 28)
                    Text("Create Account")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(.textPrimary)
                    Text("Sign up to find pharmacies near you")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }
                .padding(.bottom, 28)

                // ── Form card ────────────────────────────────────────────
                VStack(spacing: 20) {

                    // Error banner
                    if let error = viewModel.errorMessage {
                        HStack(spacing: 10) {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundColor(.red)
                            Text(error)
                                .font(.subheadline)
                                .foregroundColor(.red)
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.08))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.red.opacity(0.25)))
                        .cornerRadius(12)
                    }

                    // 1. Full Name
                    fieldRow(
                        label: "Full Name",
                        systemImage: "person",
                        content: {
                            TextField("Enter your full name", text: $fullName)
                                .autocapitalization(.words)
                        }
                    )

                    // 2. Phone Number — PRIMARY
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 4) {
                            Label("Phone Number", systemImage: "phone")
                                .font(.subheadline).fontWeight(.semibold)
                                .foregroundColor(.textPrimary)
                            Text("*")
                                .foregroundColor(.primaryTeal)
                                .fontWeight(.bold)
                        }
                        Text("Used to sign in and connect with pharmacies via WhatsApp")
                            .font(.caption)
                            .foregroundColor(.textSecondary)

                        TextField("+250 788 123 456", text: $phoneNumber)
                            .keyboardType(.phonePad)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                    }

                    // 3. Email — optional
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Label("Email Address", systemImage: "envelope")
                                .font(.subheadline).fontWeight(.semibold)
                                .foregroundColor(.textPrimary)
                            Text("(optional)")
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }
                        Text("Recommended for password recovery")
                            .font(.caption)
                            .foregroundColor(.textSecondary)

                        TextField("you@example.com", text: $email)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                    }

                    // 4. Password
                    fieldRow(label: "Password", systemImage: "lock") {
                        HStack {
                            Group {
                                if showPassword {
                                    TextField("Min. 6 characters", text: $password)
                                        .autocapitalization(.none)
                                } else {
                                    SecureField("Min. 6 characters", text: $password)
                                }
                            }
                            Button { showPassword.toggle() } label: {
                                Image(systemName: showPassword ? "eye.slash" : "eye")
                                    .foregroundColor(.textSecondary)
                            }
                        }
                    }

                    // 5. Confirm Password
                    fieldRow(label: "Confirm Password", systemImage: "lock") {
                        HStack {
                            Group {
                                if showConfirmPassword {
                                    TextField("Re-enter password", text: $confirmPassword)
                                        .autocapitalization(.none)
                                } else {
                                    SecureField("Re-enter password", text: $confirmPassword)
                                }
                            }
                            Button { showConfirmPassword.toggle() } label: {
                                Image(systemName: showConfirmPassword ? "eye.slash" : "eye")
                                    .foregroundColor(.textSecondary)
                            }
                        }
                    }

                    // 6. Terms & Conditions
                    Toggle(isOn: $acceptedTerms) {
                        HStack(spacing: 4) {
                            Text("I accept the")
                                .font(.subheadline)
                                .foregroundColor(.textSecondary)
                            Text("Terms & Conditions")
                                .font(.subheadline)
                                .foregroundColor(.primaryTeal)
                                .fontWeight(.semibold)
                        }
                    }
                    .tint(.primaryTeal)

                    // Submit
                    PrimaryButton(title: "Create Account", isLoading: viewModel.isLoading) {
                        signUp()
                    }

                    // Sign in link
                    Button { dismiss() } label: {
                        HStack(spacing: 4) {
                            Text("Already have an account?")
                                .foregroundColor(.textSecondary)
                            Text("Sign In")
                                .foregroundColor(.primaryTeal)
                                .fontWeight(.semibold)
                        }
                        .font(.subheadline)
                    }
                    .padding(.bottom, 40)
                }
                .padding(20)
                .background(Color(.systemBackground))
                .cornerRadius(20)
                .shadow(color: .black.opacity(0.05), radius: 10)
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Sign Up")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: – Helpers

    @ViewBuilder
    private func fieldRow<Content: View>(
        label: String,
        systemImage: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(label, systemImage: systemImage)
                .font(.subheadline).fontWeight(.semibold)
                .foregroundColor(.textPrimary)
            content()
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
        }
    }

    private func signUp() {
        viewModel.signUpUser(
            fullName: fullName,
            phoneNumber: phoneNumber,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            acceptedTerms: acceptedTerms
        ) { result in
            switch result {
            case .success(let user):
                appState.signIn(user: user)
            case .failure(let error):
                print("User sign-up failed: \(error)")
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
