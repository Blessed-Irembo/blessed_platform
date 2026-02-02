/// Secondary Button Component
///
/// Reusable outlined button component with teal border and text,
/// transparent background.

import SwiftUI

struct SecondaryButton: View {
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .foregroundColor(.primaryTeal)
                .frame(maxWidth: .infinity)
                .frame(height: Constants.Dimensions.buttonHeight)
                .background(Color.white)
                .cornerRadius(Constants.Dimensions.cornerRadius)
                .overlay(
                    RoundedRectangle(cornerRadius: Constants.Dimensions.cornerRadius)
                        .stroke(Color.primaryTeal, lineWidth: 2)
                )
        }
    }
}

#Preview {
    SecondaryButton(title: "Sign Up") {}
        .padding()
}
