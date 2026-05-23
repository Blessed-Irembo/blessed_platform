/// Onboarding Page View
///
/// Individual page component for the onboarding flow displaying
/// an icon, title, and description.

import SwiftUI

struct OnboardingPageView: View {
    let page: OnboardingPage
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Icon
            Image(systemName: page.systemImage)
                .font(.system(size: 100))
                .foregroundColor(.primaryTeal)
                .padding(.bottom, 20)
            
            // Title
            Text(appState.t(page.titleKey))
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.textPrimary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            // Description
            Text(appState.t(page.descriptionKey))
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
            titleKey: "onboarding.page1.title",
            descriptionKey: "onboarding.page1.desc",
            systemImage: "map.fill"
        )
    )
    .environmentObject(AppState())
}
