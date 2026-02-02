/// Primary Button Component
///
/// Reusable button component with teal background, white text,
/// loading state, and disabled state support.

import SwiftUI

struct PrimaryButton: View {
    let title: String
    let isLoading: Bool
    let action: () -> Void
    
    init(
        title: String,
        isLoading: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.isLoading = isLoading
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                }
                
                Text(isLoading ? "Please wait..." : title)
                    .font(.headline)
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .frame(height: Constants.Dimensions.buttonHeight)
            .background(Color.primaryTeal)
            .cornerRadius(Constants.Dimensions.cornerRadius)
        }
        .disabled(isLoading)
        .opacity(isLoading ? 0.7 : 1.0)
    }
}

#Preview {
    VStack(spacing: 20) {
        PrimaryButton(title: "Sign In") {}
        PrimaryButton(title: "Loading", isLoading: true) {}
    }
    .padding()
}
