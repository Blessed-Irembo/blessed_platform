/// Splash Screen View
///
/// Initial screen displayed on app launch with logo and brand name.
/// Auto-transitions to onboarding or main app after delay.

import SwiftUI

struct SplashView: View {
    @State private var scale: CGFloat = 0.8
    @State private var opacity: Double = 0.0
    
    var body: some View {
        ZStack {
            Color.primaryTeal
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                Logo(size: 120)
                    .scaleEffect(scale)
                    .opacity(opacity)
                
                Text("Blessed Irembo")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .opacity(opacity)
                
                Text("Find Pharmacies Across Rwanda")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.9))
                    .opacity(opacity)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                scale = 1.0
                opacity = 1.0
            }
        }
    }
}

#Preview {
    SplashView()
}
