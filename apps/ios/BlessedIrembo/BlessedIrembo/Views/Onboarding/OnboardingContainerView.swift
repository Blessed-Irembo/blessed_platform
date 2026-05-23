/// Onboarding Container View
///
/// Main container for the onboarding flow managing page navigation,
/// skip functionality, and completion.

import SwiftUI

struct OnboardingContainerView: View {
    @StateObject private var viewModel = OnboardingViewModel()
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        ZStack {
            Color.white.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header spacer for overlay switcher
                Spacer()
                    .frame(height: 44)
                
                // Skip button
                HStack {
                    Spacer()
                    if !viewModel.isLastPage {
                        Button(appState.t("onboarding.skip")) {
                            viewModel.skip()
                        }
                        .foregroundColor(.textSecondary)
                        .padding()
                    }
                }
                
                // Page content
                TabView(selection: $viewModel.currentPage) {
                    ForEach(0..<viewModel.pages.count, id: \.self) { index in
                        OnboardingPageView(page: viewModel.pages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                
                // Page indicator
                PageIndicator(
                    numberOfPages: viewModel.pages.count,
                    currentPage: viewModel.currentPage
                )
                .padding(.bottom, 24)
                
                // Navigation button
                PrimaryButton(title: appState.t(viewModel.isLastPage ? "onboarding.getStarted" : "onboarding.next")) {
                    if viewModel.isLastPage {
                        appState.completeOnboarding()
                    } else {
                        viewModel.nextPage()
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
            }
            
            // Floating language switcher overlay at the top
            VStack {
                FloatingLanguageSwitcher()
                Spacer()
            }
        }
    }
}

#Preview {
    OnboardingContainerView()
        .environmentObject(AppState())
}
