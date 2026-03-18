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
            Section("Personal Details") {
                TextField("Full Name", text: $fullName)
                TextField("Email Address", text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                TextField("Phone Number", text: $phone)
                    .keyboardType(.phonePad)
            }
            
            Section("Security (Optional)") {
                SecureField("New Password", text: $password)
            }
            
            Section {
                Button(action: saveChanges) {
                    HStack {
                        Spacer()
                        if isSaving {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Text("Save Changes")
                                .fontWeight(.bold)
                        }
                        Spacer()
                    }
                }
                .disabled(isSaving)
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if let user = appState.currentUser {
                fullName = user.fullName
                email = user.email
                phone = user.phoneNumber
            }
        }
        .alert("Success", isPresented: $showSuccessAlert) {
            Button("OK") {
                presentationMode.wrappedValue.dismiss()
            }
        } message: {
            Text("Your profile has been updated.")
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
