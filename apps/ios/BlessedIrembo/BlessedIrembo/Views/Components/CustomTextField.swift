/// Custom Text Field Component
///
/// Reusable text field with icon support, secure entry toggle,
/// and validation state styling.

import SwiftUI

struct CustomTextField: View {
    let placeholder: String
    let systemImage: String?
    @Binding var text: String
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default
    
    @State private var isPasswordVisible = false
    
    var body: some View {
        HStack(spacing: 12) {
            if let systemImage = systemImage {
                Image(systemName: systemImage)
                    .foregroundColor(.textSecondary)
                    .frame(width: 20)
            }
            
            if isSecure && !isPasswordVisible {
                SecureField(placeholder, text: $text)
                    .keyboardType(keyboardType)
            } else {
                TextField(placeholder, text: $text)
                    .keyboardType(keyboardType)
                    .autocapitalization(keyboardType == .emailAddress ? .none : .words)
            }
            
            if isSecure {
                Button(action: { isPasswordVisible.toggle() }) {
                    Image(systemName: isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                        .foregroundColor(.textSecondary)
                }
            }
        }
        .padding()
        .background(Color.backgroundLight)
        .cornerRadius(Constants.Dimensions.cornerRadius)
        .overlay(
            RoundedRectangle(cornerRadius: Constants.Dimensions.cornerRadius)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
}

#Preview {
    VStack(spacing: 16) {
        CustomTextField(
            placeholder: "Email",
            systemImage: "envelope",
            text: .constant(""),
            keyboardType: .emailAddress
        )
        
        CustomTextField(
            placeholder: "Password",
            systemImage: "lock",
            text: .constant(""),
            isSecure: true
        )
    }
    .padding()
}
