/// Page Indicator Component
///
/// Custom page indicator for onboarding flow showing current page
/// and total pages with smooth animations.

import SwiftUI

struct PageIndicator: View {
    let numberOfPages: Int
    let currentPage: Int
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<numberOfPages, id: \.self) { index in
                Circle()
                    .fill(index == currentPage ? Color.primaryTeal : Color.gray.opacity(0.3))
                    .frame(width: index == currentPage ? 10 : 8, height: index == currentPage ? 10 : 8)
                    .animation(.easeInOut(duration: 0.3), value: currentPage)
            }
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        PageIndicator(numberOfPages: 3, currentPage: 0)
        PageIndicator(numberOfPages: 3, currentPage: 1)
        PageIndicator(numberOfPages: 3, currentPage: 2)
    }
}
