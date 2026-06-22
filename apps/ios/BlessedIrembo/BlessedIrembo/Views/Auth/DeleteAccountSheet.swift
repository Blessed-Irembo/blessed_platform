/// Delete Account Sheet
///
/// Prompts the user to enter their password to re-authenticate and delete their account permanently.
/// Handles clean up of Firestore and Firebase Auth instances with proper loading and error states.

import SwiftUI

struct DeleteAccountSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    @State private var password = ""
    @State private var showPassword = false
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Warning Banner
                warningSection
                
                // Password Field
                passwordFieldSection
                
                if let error = errorMessage {
                    ErrorBanner(message: error)
                }
                
                Spacer()
                
                // Action Buttons
                actionButtonsSection
            }
            .padding(20)
            .background(Color(.systemGroupedBackground))
            .navigationTitle(appState.t("profile.deleteAccount"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(appState.t("common.cancel")) {
                        dismiss()
                    }
                    .foregroundColor(.primaryTeal)
                    .disabled(isLoading)
                }
            }
        }
    }
    
    // MARK: - Warning Banner
    
    private var warningSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.title2)
                    .foregroundColor(.red)
                
                Text(appState.t("profile.deleteAccount"))
                    .font(.headline)
                    .foregroundColor(.red)
            }
            
            Text(appState.t("profile.deleteAccountWarning"))
                .font(.subheadline)
                .foregroundColor(.red.opacity(0.8))
                .lineSpacing(4)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.red.opacity(0.06))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.red.opacity(0.15), lineWidth: 1)
        )
    }
    
    // MARK: - Password Input
    
    private var passwordFieldSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(appState.t("profile.deleteAccountConfirmPrompt"))
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.textPrimary)
            
            HStack {
                Group {
                    if showPassword {
                        TextField(appState.t("auth.passwordPlaceholder"), text: $password)
                            .autocapitalization(.none)
                    } else {
                        SecureField(appState.t("auth.passwordPlaceholder"), text: $password)
                    }
                }
                .font(.body)
                .disabled(isLoading)
                
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(.textSecondary)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
    
    // MARK: - Action Buttons
    
    private var actionButtonsSection: some View {
        VStack(spacing: 12) {
            Button(action: deleteAccount) {
                HStack(spacing: 12) {
                    if isLoading {
                        ProgressView()
                            .scaleEffect(0.9)
                            .tint(.white)
                        Text(appState.t("profile.deleteAccountDeleting"))
                    } else {
                        Image(systemName: "trash.fill")
                        Text(appState.t("profile.deleteAccountConfirmButton"))
                    }
                }
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    password.isEmpty || isLoading
                    ? Color.red.opacity(0.4)
                    : Color.red
                )
                .cornerRadius(12)
                .shadow(color: password.isEmpty || isLoading ? Color.clear : Color.red.opacity(0.3), radius: 8, x: 0, y: 4)
            }
            .disabled(password.isEmpty || isLoading)
        }
    }
    
    // MARK: - Delete Action
    
    private func deleteAccount() {
        isLoading = true
        errorMessage = nil
        
        appState.deleteAccount(password: password) { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success:
                    dismiss()
                case .failure(let error):
                    print("Account deletion failed: \(error.localizedDescription)")
                    errorMessage = appState.t("profile.deleteAccountFailed")
                }
            }
        }
    }
}

// MARK: - Reusable Error Banner

private struct ErrorBanner: View {
    let message: String
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundColor(.red)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.red)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.red.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.red.opacity(0.25)))
        .cornerRadius(12)
    }
}

#Preview {
    DeleteAccountSheet()
        .environmentObject(AppState())
}
