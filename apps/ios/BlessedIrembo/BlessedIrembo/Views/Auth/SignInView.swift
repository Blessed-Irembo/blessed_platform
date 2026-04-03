/// Sign In View
///
/// Universal sign-in screen for both users and pharmacy owners.
/// Users can authenticate with their phone number OR email address.
/// Phone-number path: Firestore look-up of matching email → Firebase Auth sign-in.

import SwiftUI

struct SignInView: View {
    @StateObject private var viewModel = AuthViewModel()
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    // Phone / Email toggle
    enum SignInMethod: String, CaseIterable {
        case phone = "Phone Number"
        case email = "Email"
    }
    @State private var signInMethod: SignInMethod = .phone

    @State private var identifier       = ""  // phone or email depending on mode
    @State private var password         = ""
    @State private var rememberMe       = false
    @State private var showPassword     = false
    @State private var showResetAlert   = false
    @State private var resetEmailInput  = ""

    // The field placeholder adapts to the selected method
    private var identifierPlaceholder: String {
        signInMethod == .phone ? "+250 788 123 456" : "you@example.com"
    }
    private var identifierIcon: String {
        signInMethod == .phone ? "phone" : "envelope"
    }
    private var identifierKeyboard: UIKeyboardType {
        signInMethod == .phone ? .phonePad : .emailAddress
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // ── Header ──────────────────────────────────────────────
                VStack(spacing: 10) {
                    Logo(size: 72)
                        .padding(.top, 40)
                    Text("Welcome Back")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(.textPrimary)
                    Text("Sign in to continue")
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

                    // ── Sign-in method picker ──
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Sign in with")
                            .font(.subheadline).fontWeight(.semibold)
                            .foregroundColor(.textPrimary)

                        Picker("Sign in method", selection: $signInMethod) {
                            ForEach(SignInMethod.allCases, id: \.self) { method in
                                Label {
                                    Text(method.rawValue)
                                } icon: {
                                    Image(systemName: method == .phone ? "phone" : "envelope")
                                }
                                .tag(method)
                            }
                        }
                        .pickerStyle(.segmented)
                        .onChange(of: signInMethod) { _ in
                            // Clear field when switching method to avoid confusion
                            identifier = ""
                            viewModel.errorMessage = nil
                        }
                    }

                    // ── Identifier field ──
                    VStack(alignment: .leading, spacing: 6) {
                        Label(signInMethod.rawValue, systemImage: identifierIcon)
                            .font(.subheadline).fontWeight(.semibold)
                            .foregroundColor(.textPrimary)

                        if signInMethod == .phone {
                            Text("Enter the phone number you registered with")
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }

                        TextField(identifierPlaceholder, text: $identifier)
                            .keyboardType(identifierKeyboard)
                            .autocapitalization(.none)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                    }

                    // ── Password ──
                    VStack(alignment: .leading, spacing: 6) {
                        Label("Password", systemImage: "lock")
                            .font(.subheadline).fontWeight(.semibold)
                            .foregroundColor(.textPrimary)

                        HStack {
                            Group {
                                if showPassword {
                                    TextField("Enter your password", text: $password)
                                        .autocapitalization(.none)
                                } else {
                                    SecureField("Enter your password", text: $password)
                                }
                            }
                            Button { showPassword.toggle() } label: {
                                Image(systemName: showPassword ? "eye.slash" : "eye")
                                    .foregroundColor(.textSecondary)
                            }
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }

                    // ── Remember me + Forgot password ──
                    HStack {
                        Toggle("Remember me", isOn: $rememberMe)
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                            .tint(.primaryTeal)
                        Spacer()
                        Button("Forgot password?") {
                            // Pre-fill with email if user typed one in email mode
                            resetEmailInput = signInMethod == .email ? identifier : ""
                            showResetAlert = true
                        }
                        .font(.subheadline)
                        .foregroundColor(.primaryTeal)
                    }

                    // ── Sign In button ──
                    PrimaryButton(title: "Sign In", isLoading: viewModel.isLoading) {
                        signIn()
                    }

                    // ── Divider ──
                    HStack {
                        Rectangle().frame(height: 1).foregroundColor(Color.gray.opacity(0.2))
                        Text("or").font(.caption).foregroundColor(.textSecondary).padding(.horizontal, 8)
                        Rectangle().frame(height: 1).foregroundColor(Color.gray.opacity(0.2))
                    }

                    // ── Phone note ── (only shown in phone mode)
                    if signInMethod == .phone {
                        HStack(spacing: 8) {
                            Image(systemName: "info.circle")
                                .foregroundColor(.primaryTeal)
                                .font(.caption)
                            Text("We look up your account using your registered phone number. Your password stays the same.")
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }
                        .padding(12)
                        .background(Color.primaryTeal.opacity(0.06))
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.primaryTeal.opacity(0.2)))
                        .cornerRadius(10)
                    }

                    Spacer(minLength: 8)
                }
                .padding(20)
                .background(Color(.systemBackground))
                .cornerRadius(20)
                .shadow(color: .black.opacity(0.05), radius: 10)
                .padding(.horizontal, 16)
                .padding(.bottom, 40)
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Sign In")
        .navigationBarTitleDisplayMode(.inline)

        // ── Reset password alert ──
        .alert("Reset Password", isPresented: $showResetAlert) {
            TextField("Enter your email", text: $resetEmailInput)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
            Button("Send Reset Email") {
                viewModel.resetPassword(email: resetEmailInput)
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("We'll send a password reset link to your email.")
        }
        .alert("Email Sent", isPresented: $viewModel.resetEmailSent) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Check your inbox for a password reset link.")
        }
    }

    // MARK: – Sign in action

    private func signIn() {
        let currentAppState = appState
        let dismissAction = dismiss

        viewModel.signIn(
            identifier: identifier,
            password: password,
            rememberMe: rememberMe
        ) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let data):
                    if let user = data.user {
                        currentAppState.signIn(user: user)
                    } else if let pharmacy = data.pharmacy {
                        currentAppState.signIn(pharmacy: pharmacy)
                    }
                    dismissAction()
                case .failure(let error):
                    print("Sign in failed: \(error)")
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
