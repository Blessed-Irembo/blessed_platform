/// Onboarding ViewModel
///
/// Manages the state and logic for the onboarding flow including
/// page navigation, skip functionality, and completion tracking.

import SwiftUI
import Combine

class OnboardingViewModel: ObservableObject {
    @Published var currentPage = 0
    
    let pages = Constants.Onboarding.pages
    
    var isLastPage: Bool {
        currentPage == pages.count - 1
    }
    
    var buttonTitle: String {
        isLastPage ? "Get Started" : "Next"
    }
    
    /// Move to next page
    func nextPage() {
        if currentPage < pages.count - 1 {
            withAnimation {
                currentPage += 1
            }
        }
    }
    
    /// Move to previous page
    func previousPage() {
        if currentPage > 0 {
            withAnimation {
                currentPage -= 1
            }
        }
    }
    
    /// Skip to last page
    func skip() {
        withAnimation {
            currentPage = pages.count - 1
        }
    }
}
