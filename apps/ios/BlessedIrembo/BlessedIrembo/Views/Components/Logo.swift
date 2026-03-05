/// Logo Component
///
/// Reusable logo component with size customization.
/// Uses the logo image from web app assets.

import SwiftUI

struct Logo: View {
    var size: CGFloat = 100
    
    var body: some View {
        Image("logo1")
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
    }
}

#Preview {
    VStack(spacing: 20) {
        Logo(size: 60)
        Logo(size: 100)
        Logo(size: 150)
    }
}
