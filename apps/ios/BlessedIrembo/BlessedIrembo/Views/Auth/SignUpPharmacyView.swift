/// Sign Up Pharmacy View
///
/// Registration screen for pharmacy owners to register their business.
/// Includes business information, license validation, and location data.

import SwiftUI
import FirebaseAuth

struct SignUpPharmacyView: View {
    @StateObject private var viewModel = AuthViewModel()
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    
    @State private var pharmacyName = ""
    @State private var ownerName = ""
    @State private var email = ""
    @State private var phoneNumber = ""
    @State private var licenseNumber = ""
    @State private var address = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 12) {
                    Logo(size: 70)
                        .padding(.top, 20)
                    
                    Text("Register Pharmacy")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textPrimary)
                    
                    Text("Join our network of pharmacies")
                        .font(.body)
                        .foregroundColor(.textSecondary)
                }
                
                // Form
                VStack(spacing: 16) {
                    CustomTextField(
                        placeholder: "Pharmacy Name",
                        systemImage: "cross.case",
                        text: $pharmacyName
                    )
                    
                    CustomTextField(
                        placeholder: "Owner Name",
                        systemImage: "person",
                        text: $ownerName
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
                        placeholder: "License Number",
                        systemImage: "doc.text",
                        text: $licenseNumber
                    )
                    
                    CustomTextField(
                        placeholder: "Physical Address",
                        systemImage: "mappin.circle",
                        text: $address
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
                    
                    // Info text
                    Text("Your pharmacy will be verified before going live")
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                        .padding(.top, 8)
                }
                .padding(.horizontal, 24)
                .padding(.top, 24)
                
                // Sign Up button
                PrimaryButton(
                    title: "Register Pharmacy",
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
        .navigationTitle("Register")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func signUp() {
        // Using mock coordinates for now - would use location picker in production
        let latitude = -1.9403  // Kigali
        let longitude = 29.8739
        
        viewModel.signUpPharmacy(
            pharmacyName: pharmacyName,
            ownerName: ownerName,
            email: email,
            phoneNumber: phoneNumber,
            licenseNumber: licenseNumber,
            address: address,
            latitude: latitude,
            longitude: longitude,
            password: password,
            confirmPassword: confirmPassword
        ) { result in
            switch result {
            case .success(let pharmacy):
                appState.signIn(pharmacy: pharmacy)
            case .failure(let error):
                print("Sign up failed: \(error)")
            }
        }
    }
}

#Preview {
    NavigationStack {
        SignUpPharmacyView()
            .environmentObject(AppState())
    }
}
