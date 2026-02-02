/// Opening Screen View
///
/// Animated transition screen shown after login while app initializes.
/// Displays the Blessed Irembo logo with a smooth fade-in animation.

import SwiftUI

struct OpeningScreenView: View {
    @Binding var isPresented: Bool
    @State private var logoOpacity: Double = 0
    @State private var logoScale: CGFloat = 0.5
    @State private var circleScale: CGFloat = 0
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color.primaryTeal.opacity(0.1),
                    Color.white
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Animated circles background
            ZStack {
                Circle()
                    .fill(Color.primaryTeal.opacity(0.1))
                    .frame(width: 300, height: 300)
                    .scaleEffect(circleScale)
                    .blur(radius: 30)
                
                Circle()
                    .fill(Color.primaryTeal.opacity(0.05))
                    .frame(width: 200, height: 200)
                    .scaleEffect(circleScale * 1.2)
                    .blur(radius: 20)
            }
            
            // Logo and text
            VStack(spacing: 24) {
                // Logo
                Logo(size: 120)
                    .scaleEffect(logoScale)
                    .opacity(logoOpacity)
                
                // App name
                Text("Blessed Irembo")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.textPrimary)
                    .opacity(logoOpacity)
                
                // Tagline
                Text("Find pharmacies near you")
                    .font(.body)
                    .foregroundColor(.textSecondary)
                    .opacity(logoOpacity * 0.8)
                
                // Loading indicator
                ProgressView()
                    .scaleEffect(1.2)
                    .tint(.primaryTeal)
                    .padding(.top, 20)
                    .opacity(logoOpacity)
            }
        }
        .onAppear {
            startAnimation()
        }
    }
    
    private func startAnimation() {
        // Animate circles
        withAnimation(.easeOut(duration: 1.5)) {
            circleScale = 1.0
        }
        
        // Animate logo appearance
        withAnimation(.spring(response: 0.8, dampingFraction: 0.6)) {
            logoScale = 1.0
        }
        
        withAnimation(.easeIn(duration: 0.8)) {
            logoOpacity = 1.0
        }
        
        // Auto-dismiss after animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation(.easeOut(duration: 0.5)) {
                isPresented = false
            }
        }
    }
}

#Preview {
    OpeningScreenView(isPresented: .constant(true))
}
