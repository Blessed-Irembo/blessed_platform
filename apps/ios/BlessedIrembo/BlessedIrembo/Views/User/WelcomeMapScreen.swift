/// Welcome Map Screen
///
/// First screen users see after login, showing an invitation to explore pharmacies.
/// Features a map illustration and "Open Map" button to proceed to the interactive map.

import SwiftUI

struct WelcomeMapScreen: View {
    @EnvironmentObject var appState: AppState
    @State private var animateContent = false
    
    var body: some View {
        welcomeContent
    }
    
    private var welcomeContent: some View {
        VStack(spacing: 0) {
            // Main content area
            ScrollView {
                VStack(spacing: 32) {
                    Spacer(minLength: 60)
                    
                    // Logo illustration
                    VStack(spacing: 20) {
                        ZStack {
                            // Background circle
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            Color.primaryTeal.opacity(0.1),
                                            Color.primaryTeal.opacity(0.05)
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 280, height: 280)
                                .scaleEffect(animateContent ? 1.0 : 0.8)
                            
                            // Logo2 image
                            Image("logo2")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 200, height: 200)
                                .scaleEffect(animateContent ? 1.0 : 0.8)
                        }
                        .padding(.top, 20)
                    }
                    
                    // Text content
                    VStack(spacing: 16) {
                        Text("Find pharmacies near you")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.textPrimary)
                            .multilineTextAlignment(.center)
                            .opacity(animateContent ? 1.0 : 0.0)
                        
                        Text("Discover verified pharmacies in your area with real-time availability and easy navigation")
                            .font(.body)
                            .foregroundColor(.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                            .opacity(animateContent ? 1.0 : 0.0)
                    }
                    .animation(.easeInOut(duration: 0.6).delay(0.3), value: animateContent)
                    
                    // Open Map button with NavigationLink
                    NavigationLink(destination: UserMapView()) {
                        HStack(spacing: 12) {
                            Image(systemName: "map.circle.fill")
                                .font(.system(size: 24))
                            
                            Text("Open Map")
                                .font(.system(size: 18, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(
                            LinearGradient(
                                colors: [Color.primaryTeal, Color.primaryTeal.opacity(0.8)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(16)
                        .shadow(color: Color.primaryTeal.opacity(0.4), radius: 12, x: 0, y: 6)
                    }
                    .padding(.horizontal, 32)
                    .padding(.top, 20)
                    .scaleEffect(animateContent ? 1.0 : 0.9)
                    .opacity(animateContent ? 1.0 : 0.0)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.5), value: animateContent)
                    
                    Spacer(minLength: 40)
                }
            }
            
            // Bottom navigation bar
            bottomNavBar
        }
        .background(Color.white.ignoresSafeArea())
        .onAppear {
            withAnimation {
                animateContent = true
            }
        }
    }
    
    private var bottomNavBar: some View {
        HStack(spacing: 0) {
            // Home
            NavBarItem(icon: "house.fill", label: "Home", isSelected: true)
            
            // Profile
            NavigationLink(destination: ProfileView().environmentObject(appState)) {
                NavBarItem(icon: "person.fill", label: "Profile", isSelected: false)
            }
        }
        .padding(.vertical, 12)
        .background(
            Color.white
                .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: -2)
        )
        .opacity(animateContent ? 1.0 : 0.0)
        .animation(.easeInOut(duration: 0.6).delay(0.6), value: animateContent)
    }
    
    private func markerOffset(for index: Int) -> CGPoint {
        let positions: [CGPoint] = [
            CGPoint(x: -80, y: -60),   // Top left
            CGPoint(x: 70, y: -40),    // Top right
            CGPoint(x: 0, y: 80)       // Bottom center
        ]
        return positions[index]
    }
}

// MARK: - Bottom Nav Bar Item

struct NavBarItem: View {
    let icon: String
    let label: String
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 22))
                .foregroundColor(isSelected ? .primaryTeal : .gray.opacity(0.6))
            
            Text(label)
                .font(.caption2)
                .foregroundColor(isSelected ? .primaryTeal : .gray.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    WelcomeMapScreen()
}
