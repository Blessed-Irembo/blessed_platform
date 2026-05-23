import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct UserProfileSettingsView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.presentationMode) var presentationMode
    
    @State private var fullName: String = ""
    @State private var email: String = ""
    @State private var phone: String = ""
    @State private var password: String = ""
    
    @State private var isSaving = false
    @State private var showSuccessAlert = false
    
    var body: some View {
        Form {
            Section(appState.t("profile.personalDetailsTitle")) {
                TextField(appState.t("auth.fullNameLabel"), text: $fullName)
                TextField(appState.t("auth.emailLabel"), text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                TextField(appState.t("auth.phoneLabel"), text: $phone)
                    .keyboardType(.phonePad)
            }
            
            Section(appState.t("profile.securityOptional")) {
                SecureField(appState.t("profile.newPassword"), text: $password)
            }
            
            Section {
                Button(action: saveChanges) {
                    HStack {
                        Spacer()
                        if isSaving {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Text(appState.t("profile.saveChanges"))
                                .fontWeight(.bold)
                        }
                        Spacer()
                    }
                }
                .disabled(isSaving)
            }
        }
        .navigationTitle(appState.t("profile.editProfile"))
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if let user = appState.currentUser {
                fullName = user.fullName
                email = user.email
                phone = user.phoneNumber
            }
        }
        .alert(appState.t("common.success"), isPresented: $showSuccessAlert) {
            Button("OK") {
                presentationMode.wrappedValue.dismiss()
            }
        } message: {
            Text(appState.t("profile.profileUpdatedUser"))
        }
    }
    
    private func saveChanges() {
        guard let currentUser = appState.currentUser else { return }
        isSaving = true
        
        let db = FirebaseManager.shared.firestore
        db.collection("users").document(currentUser.id).updateData([
            "fullName": fullName,
            "email": email,
            "phoneNumber": phone
        ]) { error in
            isSaving = false
            if let error = error {
                print("Error updating profile: \(error)")
                return
            }
            
            // Optionally update FirebaseAuth mapped password if populated
            if !password.isEmpty {
                if let authUser = Auth.auth().currentUser {
                    authUser.updatePassword(to: password) { authError in
                        if let authError = authError {
                            print("Error updating password: \(authError)")
                        }
                    }
                }
            }
            
            DispatchQueue.main.async {
                appState.currentUser?.fullName = fullName
                appState.currentUser?.email = email
                appState.currentUser?.phoneNumber = phone
                showSuccessAlert = true
            }
        }
    }
}
