/// App Update Popup View
///
/// A premium overlay modal to prompt users to update their app when a new version
/// is available on the App Store.

import SwiftUI

struct AppUpdatePopupView: View {
    @EnvironmentObject var appState: AppState
    
    let appStoreURL: URL?
    let updateVersion: String
    let onDismiss: () -> Void
    
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            // Darkened backdrop overlay
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .transition(.opacity)
                .onTapGesture {
                    // Tap backdrop to dismiss (optional fallback)
                    onDismiss()
                }
            
            // Modal Card
            VStack(spacing: 20) {
                // Download icon badge with gradient background
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.primaryTeal.opacity(0.15), Color.primaryTeal.opacity(0.05)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 80, height: 80)
                    
                    Image(systemName: "arrow.down.app.fill")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 38, height: 38)
                        .foregroundColor(.primaryTeal)
                }
                .padding(.top, 8)
                
                VStack(spacing: 6) {
                    // Title
                    Text(appState.t("update.title"))
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.textPrimary)
                        .multilineTextAlignment(.center)
                    
                    // Version indicator tag
                    Text("v\(updateVersion)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.primaryTeal)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.primaryTeal.opacity(0.1))
                        .cornerRadius(8)
                }
                
                // Message
                Text(appState.t("update.message"))
                    .font(.system(size: 15))
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 12)
                    .padding(.bottom, 8)
                
                // Action Buttons
                VStack(spacing: 12) {
                    // Primary Update Button
                    Button {
                        if let url = appStoreURL {
                            UIApplication.shared.open(url, options: [:], completionHandler: nil)
                        }
                    } label: {
                        Text(appState.t("update.button"))
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.primaryTeal)
                            .cornerRadius(12)
                            .shadow(color: Color.primaryTeal.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                    
                    // Secondary Later Link
                    Button {
                        onDismiss()
                    } label: {
                        Text(appState.t("update.later"))
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.textSecondary)
                            .padding(.vertical, 8)
                    }
                }
            }
            .padding(28)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color(.systemBackground))
                    .shadow(color: Color.black.opacity(0.15), radius: 20, x: 0, y: 10)
            )
            .frame(maxWidth: 325)
            .scaleEffect(isAnimating ? 1.0 : 0.85)
            .opacity(isAnimating ? 1.0 : 0.0)
            .padding(.horizontal, 24)
        }
        .onAppear {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.7, blendDuration: 0)) {
                isAnimating = true
            }
        }
    }
}
