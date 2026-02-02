/// Onboarding Page View
///
/// Individual page component for the onboarding flow displaying
/// an icon, title, and description.

import SwiftUI

struct OnboardingPageView: View {
    let page: OnboardingPage
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Icon
            Image(systemName: page.systemImage)
                .font(.system(size: 100))
                .foregroundColor(.primaryTeal)
                .padding(.bottom, 20)
            
            // Title
            Text(page.title)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.textPrimary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            // Description
            Text(page.description)
                .font(.body)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
                .lineSpacing(6)
            
            Spacer()
        }
    }
}

#Preview {
    OnboardingPageView(
        page: OnboardingPage(
            title: "Welcome to Blessed Irembo",
            description: "Find trusted pharmacies anywhere in Rwanda",
            systemImage: "map.fill"
        )
    )
}
