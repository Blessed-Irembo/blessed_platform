import SwiftUI

struct NotificationBellView: View {
    @StateObject private var viewModel = NotificationViewModel()
    @EnvironmentObject var appState: AppState
    @State private var showSheet = false
    
    var body: some View {
        Button(action: { showSheet = true }) {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "bell.fill")
                    .font(.system(size: 20))
                    .foregroundColor(Color.primaryTeal)
                
                if viewModel.unreadCount > 0 {
                    Text(viewModel.unreadCount > 9 ? "9+" : "\(viewModel.unreadCount)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .padding(4)
                        .background(Color.red)
                        .clipShape(Circle())
                        .overlay(
                            Circle().stroke(Color.white, lineWidth: 1.5)
                        )
                        .offset(x: 6, y: -6)
                }
            }
        }
        .onAppear {
            if let pharmacyId = appState.currentPharmacy?.id {
                viewModel.startListening(for: pharmacyId)
            }
        }
        .onChange(of: appState.currentPharmacy?.id) { newId in
            if let id = newId {
                viewModel.startListening(for: id)
            } else {
                viewModel.stopListening()
            }
        }
        .sheet(isPresented: $showSheet) {
            NotificationsSheetView(viewModel: viewModel)
        }
    }
}

struct NotificationsSheetView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var viewModel: NotificationViewModel
    
    var body: some View {
        NavigationView {
            List {
                if viewModel.notifications.isEmpty {
                    Text("No notifications yet.")
                        .foregroundColor(.secondary)
                        .listRowBackground(Color.clear)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 40)
                } else {
                    ForEach(viewModel.notifications) { notif in
                        NotificationRow(notif: notif)
                            .onTapGesture {
                                if !notif.isRead {
                                    Task {
                                        await viewModel.markAsRead(notificationId: notif.id)
                                    }
                                }
                            }
                            .listRowBackground(notif.isRead ? Color(UIColor.systemBackground) : Color(UIColor.secondarySystemBackground))
                    }
                }
            }
            .listStyle(PlainListStyle())
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .font(.headline)
                    .foregroundColor(Color.primaryTeal)
                }
            }
        }
    }
}

struct NotificationRow: View {
    let notif: AppNotification
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Icon
            ZStack {
                Circle()
                    .fill(iconBackgroundColor)
                    .frame(width: 40, height: 40)
                Image(systemName: iconName)
                    .foregroundColor(iconColor)
                    .font(.system(size: 18))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(notif.title)
                    .font(.subheadline)
                    .fontWeight(notif.isRead ? .medium : .bold)
                    .foregroundColor(.primary)
                
                Text(notif.message)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
                
                Text(notif.createdAt, style: .time)
                    .font(.system(size: 10))
                    .foregroundColor(.gray)
                    .padding(.top, 2)
            }
            
            Spacer()
            
            if !notif.isRead {
                Circle()
                    .fill(Color.primaryTeal)
                    .frame(width: 8, height: 8)
                    .padding(.top, 6)
            }
        }
        .padding(.vertical, 4)
    }
    
    private var iconName: String {
        switch notif.type {
        case "subscription": return "creditcard.fill"
        case "alert": return "exclamationmark.triangle.fill"
        default: return "bell.fill"
        }
    }
    
    private var iconColor: Color {
        switch notif.type {
        case "subscription": return Color.primaryTeal
        case "alert": return .red
        default: return .gray
        }
    }
    
    private var iconBackgroundColor: Color {
        iconColor.opacity(0.15)
    }
}
