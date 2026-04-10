/// Pharmacy Profile Settings View
///
/// Shows the pharmacy's current profile data in read-only mode by default.
/// The user must tap "Edit Profile" to unlock the fields, preventing
/// accidental changes. Saves name, email, and phone to Firestore.

import SwiftUI
import FirebaseFirestore
import FirebaseAuth

struct PharmacyProfileSettingsView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.presentationMode) var presentationMode

    // MARK: - Mode

    @State private var isEditing = false

    // MARK: - Form State

    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var showPassword = false

    // MARK: - Async State

    @State private var isSaving = false
    @State private var showSuccess = false
    @State private var errorMessage: String?

    // MARK: - Body

    var body: some View {
        Form {
            // Read-only display — always visible
            currentInfoSection

            // Edit fields — only shown when editing
            if isEditing {
                editFieldsSection
                securitySection
                saveSection
            }

            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear(perform: loadCurrentValues)
        .alert("Profile updated", isPresented: $showSuccess) {
            Button("OK", role: .cancel) {
                isEditing = false
                presentationMode.wrappedValue.dismiss()
            }
        } message: {
            Text("Your profile has been updated successfully.")
        }
    }

    // MARK: - Read-Only Section

    private var currentInfoSection: some View {
        Section {
            infoRow(icon: "cross.case.fill", iconColor: Color.primaryTeal,
                    label: "Pharmacy Name",
                    value: appState.currentPharmacy?.name.isEmpty == false
                        ? appState.currentPharmacy!.name : "Not set")

            infoRow(icon: "envelope.fill", iconColor: .blue,
                    label: "Email",
                    value: appState.currentPharmacy?.email.isEmpty == false
                        ? appState.currentPharmacy!.email : "Not set")

            infoRow(icon: "phone.fill", iconColor: .green,
                    label: "Phone Number",
                    value: appState.currentPharmacy?.phoneNumber.isEmpty == false
                        ? appState.currentPharmacy!.phoneNumber : "Not set")

            // Edit button — only when not already editing
            if !isEditing {
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isEditing = true
                    }
                } label: {
                    HStack {
                        Spacer()
                        Image(systemName: "pencil")
                        Text("Edit Profile")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                    .foregroundColor(Color.primaryTeal)
                }
            }
        } header: {
            Text("Current Information")
        }
    }

    // MARK: - Edit Fields

    private var editFieldsSection: some View {
        Section {
            TextField("Pharmacy Name", text: $name)
                .autocapitalization(.words)

            TextField("Email Address", text: $email)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .textInputAutocapitalization(.never)

            TextField("Phone Number", text: $phone)
                .keyboardType(.phonePad)

            // Cancel
            Button(role: .cancel) {
                withAnimation { isEditing = false }
                loadCurrentValues()
                errorMessage = nil
                password = ""
            } label: {
                HStack {
                    Spacer()
                    Text("Cancel")
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
        } header: {
            Text("Edit Details")
        }
    }

    // MARK: - Security Section

    private var securitySection: some View {
        Section {
            HStack {
                if showPassword {
                    TextField("New password (optional)", text: $password)
                        .autocapitalization(.none)
                        .textInputAutocapitalization(.never)
                } else {
                    SecureField("New password (optional)", text: $password)
                }
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(.secondary)
                }
            }
        } header: {
            Text("Security (Optional)")
        } footer: {
            Text("Leave blank to keep your current password.")
        }
    }

    // MARK: - Save Button

    private var saveSection: some View {
        Section {
            Button(action: saveChanges) {
                HStack {
                    Spacer()
                    if isSaving {
                        ProgressView()
                    } else {
                        Text("Save Changes")
                            .fontWeight(.bold)
                    }
                    Spacer()
                }
            }
            .disabled(isSaving || name.trimmingCharacters(in: .whitespaces).isEmpty)
            .foregroundColor(name.trimmingCharacters(in: .whitespaces).isEmpty ? .gray : Color.primaryTeal)
        }
    }

    // MARK: - Helper Row

    private func infoRow(icon: String, iconColor: Color, label: String, value: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(iconColor)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.body)
                    .foregroundColor(.primary)
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Logic

    private func loadCurrentValues() {
        guard let pharmacy = appState.currentPharmacy else { return }
        name  = pharmacy.name
        email = pharmacy.email
        phone = pharmacy.phoneNumber
    }

    private func saveChanges() {
        guard let pharmacy = appState.currentPharmacy else { return }
        isSaving = true
        errorMessage = nil

        let trimmedName  = name.trimmingCharacters(in: .whitespaces)
        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        let trimmedPhone = phone.trimmingCharacters(in: .whitespaces)

        FirebaseManager.shared.pharmaciesCollection
            .document(pharmacy.id)
            .updateData([
                "name":          trimmedName,
                "email":         trimmedEmail,
                "phoneNumber":   trimmedPhone,
                // Keep whatsAppNumber in sync with phoneNumber so
                // the WhatsApp button still works after a number change
                "whatsAppNumber": trimmedPhone,
                "updatedAt":     FieldValue.serverTimestamp()
            ]) { error in
                DispatchQueue.main.async {
                    self.isSaving = false
                    if let error = error {
                        self.errorMessage = "Failed to save: \(error.localizedDescription)"
                        return
                    }

                    // Optional password update
                    if !self.password.isEmpty, let user = Auth.auth().currentUser {
                        user.updatePassword(to: self.password) { err in
                            if let err = err {
                                print("Password update failed: \(err.localizedDescription)")
                            }
                        }
                    }

                    self.showSuccess = true
                }
            }
    }
}
