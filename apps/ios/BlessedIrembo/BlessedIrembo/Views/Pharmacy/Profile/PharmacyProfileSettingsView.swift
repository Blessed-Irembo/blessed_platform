/// Pharmacy Profile Settings View
/// Allows editing of current pharmacy details

import SwiftUI
import FirebaseFirestore
import FirebaseAuth

struct PharmacyProfileSettingsView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.presentationMode) var presentationMode
    
    @State private var name: String = ""
    @State private var email: String = ""
    @State private var address: String = ""
    @State private var phone: String = ""
    @State private var password: String = ""
    
    @State private var isSaving = false
    @State private var showSuccessAlert = false
    
    var body: some View {
        Form {
            Section("Basic Information") {
                TextField("Pharmacy Name", text: $name)
                TextField("Email Address", text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                TextField("Phone Number", text: $phone)
                    .keyboardType(.phonePad)
            }
            
            Section("Location") {
                TextField("Address", text: $address)
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
                .disabled(isSaving || name.isEmpty || address.isEmpty)
                .foregroundColor(name.isEmpty || address.isEmpty ? .gray : .primaryTeal)
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if let pharmacy = appState.currentPharmacy {
                name = pharmacy.name
                email = pharmacy.email
                address = pharmacy.address
                phone = pharmacy.phoneNumber
            }
        }
        .alert("Success", isPresented: $showSuccessAlert) {
            Button("OK", role: .cancel) {
                presentationMode.wrappedValue.dismiss()
            }
        } message: {
            Text("Profile updated successfully.")
        }
    }
    
    private func saveChanges() {
        guard let currentPharmacy = appState.currentPharmacy else { return }
        isSaving = true
        
        let db = FirebaseManager.shared.firestore
        db.collection("pharmacies").document(currentPharmacy.id).updateData([
            "name": name,
            "email": email,
            "address": address,
            "phoneNumber": phone
        ]) { error in
            isSaving = false
            if let error = error {
                print("Error updating profile: \(error)")
                return
            }
            
            // Password change
            if !password.isEmpty, let user = Auth.auth().currentUser {
                user.updatePassword(to: password) { error in
                    if let error = error {
                        print("Failed to update password: \(error)")
                    }
                }
            }
            
            // Reflect updates natively locally
            DispatchQueue.main.async {
                appState.currentPharmacy?.name = name
                appState.currentPharmacy?.email = email
                appState.currentPharmacy?.address = address
                appState.currentPharmacy?.phoneNumber = phone
                showSuccessAlert = true
            }
        }
    }
}
