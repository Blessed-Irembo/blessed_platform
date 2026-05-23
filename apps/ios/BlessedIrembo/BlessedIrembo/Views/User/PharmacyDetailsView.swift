/// Pharmacy Details View
///
/// Full-screen view showing comprehensive pharmacy information.
/// Aligned with the web /pharmacies/[id] page:
///   - Call + WhatsApp quick actions (WhatsApp increments Firestore click counter)
///   - Real open/closed status from structured operatingHours
///   - Expandable day-by-day schedule (mirrors web)
///   - No inquiries, no reviews, no services tabs

import SwiftUI
import CoreLocation
import GoogleMaps
import FirebaseFirestore

struct PharmacyDetailsView: View {
    let pharmacy: Pharmacy
    let userLocation: CLLocationCoordinate2D

    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @State private var hoursExpanded = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                mapHeaderSection
                mainInfoCard
                contactAndHoursCard
                locationCard
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                shareButton
            }
        }
        .onAppear {
            // Track this view in Firestore — mirrors whatsappClicks tracking.
            // Only fires if the pharmacy has a non-empty ID (always true for real data).
            guard !pharmacy.id.isEmpty else { return }
            FirebaseManager.shared.pharmaciesCollection
                .document(pharmacy.id)
                .updateData(["profileViews": FieldValue.increment(Int64(1))])
        }
    }

    // MARK: - Map Header

    private var mapHeaderSection: some View {
        GoogleMapsDetailView(pharmacy: pharmacy)
            .frame(height: 200)
            .overlay(
                LinearGradient(
                    colors: [Color.black.opacity(0.3), Color.clear],
                    startPoint: .bottom,
                    endPoint: .top
                )
            )
    }

    // MARK: - Main Info Card (name, badges, description, quick actions)

    private var mainInfoCard: some View {
        VStack(alignment: .leading, spacing: 16) {

            // Name + verified badge
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        Text(pharmacy.name)
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.textPrimary)

                        if pharmacy.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(.primaryTeal)
                                .font(.system(size: 20))
                        }
                    }

                    Text(pharmacy.formattedDistance(from: userLocation, localizedWith: appState))
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }
                Spacer()
            }

            // Badges row
            if pharmacy.isVerified || pharmacy.is24_7 || pharmacy.isPremium {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        if pharmacy.isVerified {
                            BadgeView(label: appState.t("details.verified"), color: .primaryTeal, icon: "checkmark.shield.fill")
                        }
                        if pharmacy.is24_7 {
                            BadgeView(label: appState.t("details.alwaysOpen"), color: Color.blue, icon: "clock.fill")
                        }
                        if pharmacy.isPremium {
                            BadgeView(label: appState.t("details.premiumMember"), color: Color(hex: "4F46E5"), icon: "star.fill")
                        }
                    }
                }
            }

            // Description
            if !pharmacy.description.isEmpty {
                Text(pharmacy.description)
                    .font(.body)
                    .foregroundColor(.textSecondary)
                    .lineSpacing(4)
            }

            Divider()

            // Quick action buttons — Call + WhatsApp
            HStack(spacing: 12) {
                // Call
                Link(destination: URL(string: "tel://\(pharmacy.phoneNumber.filter(\.isNumber))")!) {
                    HStack(spacing: 8) {
                        Image(systemName: "phone.fill")
                            .font(.system(size: 16))
                        Text(appState.t("details.call"))
                            .font(.system(size: 15, weight: .semibold))
                    }
                    .foregroundColor(Color(hex: "0F766E"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(hex: "F0FDFA"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color(hex: "99F6E4"), lineWidth: 1)
                    )
                    .cornerRadius(12)
                }

                // WhatsApp
                Button(action: openWhatsApp) {
                    HStack(spacing: 8) {
                        Image(systemName: "message.fill")   // SF Symbol fallback for WhatsApp
                            .font(.system(size: 16))
                        Text(appState.t("details.whatsapp"))
                            .font(.system(size: 15, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(hex: "25D366"))
                    .cornerRadius(12)
                }
            }
        }
        .padding(20)
        .background(Color.white)
    }

    // MARK: - Contact & Hours Card

    private var contactAndHoursCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(appState.t("details.contactHoursTitle"))
                .font(.system(size: 17, weight: .bold))
                .foregroundColor(.textPrimary)
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 16)

            // Address
            ContactRow(icon: "mappin.circle.fill", iconColor: Color(hex: "0D9488"), label: appState.t("auth.addressLabel"), value: pharmacy.address.isEmpty ? "N/A" : pharmacy.address)

            Divider().padding(.leading, 56)

            // Phone
            ContactRow(icon: "phone.fill", iconColor: Color(hex: "2563EB"), label: appState.t("auth.phoneLabel"), value: pharmacy.phoneNumber.isEmpty ? "N/A" : pharmacy.phoneNumber)

            Divider().padding(.leading, 56)

            // Email
            ContactRow(icon: "envelope.fill", iconColor: Color(hex: "7C3AED"), label: appState.t("auth.emailLabel"), value: pharmacy.email.isEmpty ? "N/A" : pharmacy.email)

            Divider().padding(.leading, 56)

            // Operating Hours
            hoursRow

            Spacer(minLength: 20)
        }
        .background(Color.white)
        .padding(.top, 12)
    }

    // MARK: - Hours Row (expandable, mirrors web)

    private var hoursRow: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: { withAnimation(.easeInOut(duration: 0.25)) { hoursExpanded.toggle() } }) {
                HStack(spacing: 16) {
                    // Icon
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color(hex: "F0FDF4"))
                            .frame(width: 36, height: 36)
                        Image(systemName: "clock.fill")
                            .font(.system(size: 16))
                            .foregroundColor(Color(hex: "16A34A"))
                    }

                    // Open/Closed + summary
                    VStack(alignment: .leading, spacing: 3) {
                        Text(appState.t("details.hours"))
                            .font(.caption)
                            .foregroundColor(.textSecondary)

                        HStack(spacing: 6) {
                            Circle()
                                .fill(pharmacy.isCurrentlyOpen ? Color.green : Color.red)
                                .frame(width: 8, height: 8)

                            Text(appState.t(pharmacy.isCurrentlyOpen ? "details.openNow" : "details.closedNow"))
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(pharmacy.isCurrentlyOpen ? .green : .red)

                            Text("·")
                                .foregroundColor(.textSecondary)

                            Text(pharmacy.formattedHoursSummary(localizedWith: appState))
                                .font(.system(size: 14))
                                .foregroundColor(.textSecondary)
                                .lineLimit(1)
                        }
                    }

                    Spacer()

                    Image(systemName: "chevron.down")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.gray.opacity(0.5))
                        .rotationEffect(.degrees(hoursExpanded ? 180 : 0))
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 14)
            }
            .buttonStyle(.plain)

            // Expanded schedule
            if hoursExpanded {
                expandedSchedule
                    .transition(.opacity.combined(with: .move(edge: .top)))
                    .padding(.horizontal, 20)
                    .padding(.bottom, 12)
            }
        }
    }

    private var expandedSchedule: some View {
        let oh = pharmacy.operatingHours
        let today = todayName()

        return VStack(spacing: 0) {
            ForEach(OperatingHours.allDays, id: \.self) { day in
                let isToday = day == today
                let isOpen = oh.is24Hours || oh.days.contains(day)

                HStack {
                    Text(appState.t("day.\(day)"))
                        .font(.system(size: 14, weight: isToday ? .semibold : .regular))
                        .foregroundColor(isToday ? Color(hex: "0F766E") : .textPrimary)

                    Spacer()

                    if oh.is24Hours {
                        Text(appState.t("details.open24Hours"))
                            .font(.system(size: 14))
                            .foregroundColor(isToday ? Color(hex: "0D9488") : .textSecondary)
                    } else if isOpen {
                        Text("\(oh.openTime.isEmpty ? "?" : oh.openTime) – \(oh.closeTime.isEmpty ? "?" : oh.closeTime)")
                            .font(.system(size: 14, weight: isToday ? .semibold : .regular))
                            .foregroundColor(isToday ? Color(hex: "0D9488") : .textSecondary)
                    } else {
                        Text(appState.t("map.closed"))
                            .font(.system(size: 14))
                            .foregroundColor(isToday ? .red : Color.gray.opacity(0.6))
                    }
                }
                .padding(.vertical, 10)
                .padding(.horizontal, 12)
                .background(isToday ? Color(hex: "F0FDFA") : Color.clear)
                .cornerRadius(8)

                if day != OperatingHours.allDays.last {
                    Divider()
                }
            }
        }
        .background(Color(hex: "F9FAFB"))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.gray.opacity(0.12), lineWidth: 1)
        )
    }

    // MARK: - Location / Directions Card

    private var locationCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(appState.t("details.location"))
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(.textPrimary)

                Spacer()

                Text(String(format: "%.4f, %.4f", pharmacy.latitude, pharmacy.longitude))
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundColor(.gray.opacity(0.5))
            }

            // Directions button — opens Google Maps (falls back to Apple Maps)
            Button(action: openDirections) {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.triangle.turn.up.right.circle.fill")
                        .font(.system(size: 18))
                    Text(appState.t("details.getDirections"))
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.primaryTeal)
                .cornerRadius(12)
            }
        }
        .padding(20)
        .background(Color.white)
        .padding(.top, 12)
    }

    // MARK: - Share Button

    private var shareButton: some View {
        Button(action: sharePharmacy) {
            Image(systemName: "square.and.arrow.up")
                .foregroundColor(.primaryTeal)
        }
    }

    // MARK: - Actions

    /// Opens WhatsApp with a pre-filled message and increments the Firestore click counter.
    private func openWhatsApp() {
        let number = pharmacy.whatsAppNumber.filter(\.isNumber)
        let msg = "Hello, I found your pharmacy via the Blessed Irembo platform."
        let encoded = msg.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""

        // Try WhatsApp native app, fall back to web
        let waURL = URL(string: "whatsapp://send?phone=\(number)&text=\(encoded)")
        let webURL = URL(string: "https://wa.me/\(number)?text=\(encoded)")

        if let url = waURL, UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        } else if let url = webURL {
            UIApplication.shared.open(url)
        }

        // Track click in Firestore (mirrors web /api/pharmacies/[id]/track-whatsapp)
        FirebaseManager.shared.pharmaciesCollection
            .document(pharmacy.id)
            .updateData(["whatsappClicks": FieldValue.increment(Int64(1))])
    }

    /// Opens Google Maps with turn-by-turn directions, falling back to Apple Maps.
    private func openDirections() {
        let lat = pharmacy.latitude
        let lon = pharmacy.longitude
        let googleURL = URL(string: "comgooglemaps://?daddr=\(lat),\(lon)&directionsmode=driving")
        let webURL = URL(string: "https://maps.google.com/?daddr=\(lat),\(lon)&travelmode=driving")
        let appleMapsURL = URL(string: "maps://?daddr=\(lat),\(lon)")

        if let url = googleURL, UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        } else if let url = webURL {
            UIApplication.shared.open(url)
        } else if let url = appleMapsURL {
            UIApplication.shared.open(url)
        }
    }

    private func sharePharmacy() {
        let text = "\(pharmacy.name)\n\(pharmacy.address)\n\(pharmacy.phoneNumber)"
        let vc = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(vc, animated: true)
        }
    }

    // MARK: - Helpers

    private func todayName() -> String {
        let weekdayIndex = Calendar.current.component(.weekday, from: Date()) // 1=Sun
        let names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return names[weekdayIndex - 1]
    }
}

// MARK: - Badge View

struct BadgeView: View {
    let label: String
    let color: Color
    let icon: String

    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 11))
            Text(label)
                .font(.system(size: 12, weight: .semibold))
        }
        .foregroundColor(.white)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(color)
        .cornerRadius(20)
    }
}

// MARK: - Contact Row

struct ContactRow: View {
    let icon: String
    let iconColor: Color
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(iconColor.opacity(0.08))
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(iconColor)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                Text(value)
                    .font(.system(size: 15))
                    .foregroundColor(.textPrimary)
            }

            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
    }
}

// MARK: - ActionButton (kept for backward compat)

struct ActionButton: View {
    let icon: String
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(Color.primaryTeal.opacity(0.1))
                        .frame(width: 50, height: 50)
                    Image(systemName: icon)
                        .foregroundColor(.primaryTeal)
                        .font(.system(size: 22))
                }
                Text(label)
                    .font(.caption)
                    .foregroundColor(.textPrimary)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - TabButton (kept for backward compat)

struct TabButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(title)
                    .font(.body)
                    .fontWeight(isSelected ? .semibold : .regular)
                    .foregroundColor(isSelected ? .primaryTeal : .textSecondary)
                Rectangle()
                    .fill(isSelected ? Color.primaryTeal : Color.clear)
                    .frame(height: 2)
            }
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - InfoRow (kept for backward compat)

struct InfoRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.primaryTeal)
                .font(.system(size: 16))
                .frame(width: 20)
            Text(text)
                .font(.body)
                .foregroundColor(.textSecondary)
        }
    }
}

// Color(hex:) is defined in Utilities/ColorExtension.swift — no duplicate needed here.

#Preview {
    NavigationStack {
        PharmacyDetailsView(
            pharmacy: MockData.pharmacies[0],
            userLocation: MockData.defaultLocation
        )
    }
}
