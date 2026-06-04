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
        ZStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Header spacer for switcher
                    Spacer()
                        .frame(height: 36)

                    // ── Header ──────────────────────────────────────────────
                    VStack(spacing: 10) {
                        Logo(size: 64)
                            .padding(.top, 28)
                        Text(appState.t("auth.signUp"))
                            .font(.system(size: 26, weight: .bold))
                            .foregroundColor(.textPrimary)
                        Text(appState.t("auth.registerUserSubtitle"))
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
                            label: appState.t("auth.fullNameLabel"),
                            systemImage: "person",
                            content: {
                                TextField(appState.t("auth.fullNamePlaceholder"), text: $fullName)
                                    .autocapitalization(.words)
                            }
                        )

                        // 2. Phone Number — PRIMARY
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 4) {
                                Label(appState.t("auth.phoneLabel"), systemImage: "phone")
                                    .font(.subheadline).fontWeight(.semibold)
                                    .foregroundColor(.textPrimary)
                                Text("*")
                                    .foregroundColor(.primaryTeal)
                                    .fontWeight(.bold)
                            }
                            Text(appState.t("auth.phoneModePrimaryHint"))
                                .font(.caption)
                                .foregroundColor(.textSecondary)

                            TextField(appState.t("auth.phonePlaceholder"), text: $phoneNumber)
                                .keyboardType(.phonePad)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                        }

                        // 3. Email — optional
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Label(appState.t("auth.emailLabel"), systemImage: "envelope")
                                    .font(.subheadline).fontWeight(.semibold)
                                    .foregroundColor(.textPrimary)
                                Text(appState.t("auth.emailOptional"))
                                    .font(.caption)
                                    .foregroundColor(.textSecondary)
                            }
                            Text(appState.t("auth.emailHint"))
                                .font(.caption)
                                .foregroundColor(.textSecondary)

                            TextField(appState.t("auth.emailPlaceholder"), text: $email)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(12)
                        }

                        // 4. Password
                        fieldRow(label: appState.t("auth.passwordLabel"), systemImage: "lock") {
                            HStack {
                                Group {
                                    if showPassword {
                                        TextField(appState.t("auth.passwordHint"), text: $password)
                                            .autocapitalization(.none)
                                    } else {
                                        SecureField(appState.t("auth.passwordHint"), text: $password)
                                    }
                                }
                                Button { showPassword.toggle() } label: {
                                    Image(systemName: showPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.textSecondary)
                                }
                            }
                        }

                        // 5. Confirm Password
                        fieldRow(label: appState.t("auth.confirmPasswordLabel"), systemImage: "lock") {
                            HStack {
                                Group {
                                    if showConfirmPassword {
                                        TextField(appState.t("auth.confirmPasswordPlaceholder"), text: $confirmPassword)
                                            .autocapitalization(.none)
                                    } else {
                                        SecureField(appState.t("auth.confirmPasswordPlaceholder"), text: $confirmPassword)
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
                            Text(LocalizedStringKey(appState.t("auth.acceptTerms")))
                                .font(.subheadline)
                                .foregroundColor(.textPrimary)
                        }
                        .tint(.primaryTeal)

                        // Submit
                        PrimaryButton(title: appState.t("auth.signUp"), isLoading: viewModel.isLoading) {
                            signUp()
                        }

                        // Sign in link
                        Button { dismiss() } label: {
                            HStack(spacing: 4) {
                                Text(appState.t("role.alreadyAccount"))
                                    .foregroundColor(.textSecondary)
                                Text(appState.t("role.signIn"))
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
            
            // Floating language switcher overlay at the top
            VStack {
                FloatingLanguageSwitcher()
                Spacer()
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(appState.t("auth.signUp"))
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
        appState.isRegistering = true
        viewModel.signUpUser(
            fullName: fullName,
            phoneNumber: phoneNumber,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            acceptedTerms: acceptedTerms
        ) { result in
            appState.isRegistering = false
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
