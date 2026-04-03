/// Sign Up Pharmacy View
///
/// Registration screen for pharmacy owners — mirrors the web registration flow:
///  1. Council Registration Number (verified against Rwanda FDA list, comes FIRST)
///  2. Pharmacy Name (auto-populated from verified license name)
///  3. Owner / Responsible Person
///  4. Phone Number  ← primary contact field
///  5. Email
///  6. Physical Address
///  7. Location (GPS or manual coordinates)
///  8. Password + Confirm

import SwiftUI
import CoreLocation

struct SignUpPharmacyView: View {
    @StateObject private var viewModel = AuthViewModel()
    @StateObject private var locationManager = LocationManager()
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    // MARK: – Form fields
    @State private var licenseNumber    = ""
    @State private var pharmacyName     = ""
    @State private var ownerName        = ""
    @State private var phoneNumber      = ""
    @State private var email            = ""
    @State private var address          = ""
    @State private var password         = ""
    @State private var confirmPassword  = ""

    // MARK: – Operating Hours State
    @State private var is24Hours        = false
    @State private var selectedDays: Set<String> = Set(OperatingHours.allDays[0...4]) // Default to Monday-Friday
    @State private var openTime         = Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: Date()) ?? Date()
    @State private var closeTime        = Calendar.current.date(bySettingHour: 20, minute: 0, second: 0, of: Date()) ?? Date()

    // MARK: – Location state
    enum LocationTab { case gps, coordinates }
    @State private var locationTab: LocationTab = .gps
    @State private var capturedLocation: CLLocationCoordinate2D? = nil
    @State private var gpsStatus: GPSStatus = .idle
    @State private var manualLat = ""
    @State private var manualLng = ""

    enum GPSStatus { case idle, locating, success, error }

    // MARK: – UI state
    @State private var showPassword        = false
    @State private var showConfirmPassword = false

    // Computed effective coordinates
    private var effectiveLocation: CLLocationCoordinate2D? {
        switch locationTab {
        case .gps:
            return capturedLocation
        case .coordinates:
            guard let lat = Double(manualLat), let lng = Double(manualLng) else { return nil }
            return CLLocationCoordinate2D(latitude: lat, longitude: lng)
        }
    }

    // MARK: – Body
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                headerSection
                formSection
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Register Pharmacy")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: – Header
    private var headerSection: some View {
        VStack(spacing: 10) {
            Logo(size: 64)
                .padding(.top, 28)
            Text("Register Your Pharmacy")
                .font(.system(size: 26, weight: .bold))
                .foregroundColor(.textPrimary)
            Text("Your council number is verified against the\nRwanda FDA December 2025 licensed list.")
                .font(.subheadline)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .padding(.bottom, 28)
    }

    // MARK: – Form card
    private var formSection: some View {
        VStack(spacing: 20) {

            // Error banner
            if let error = viewModel.errorMessage {
                ErrorBanner(message: error)
            }

            // ── 1. Council Registration Number (most important — first) ──
            licenseSection

            // ── 2. Pharmacy Name ──
            FormField(label: "Pharmacy Name", systemImage: "building.2") {
                TextField("Enter pharmacy name", text: $pharmacyName)
                    .autocapitalization(.words)
            }

            // ── 3. Owner / Responsible Person ──
            FormField(label: "Owner / Responsible Person", systemImage: "person") {
                TextField("Enter owner full name", text: $ownerName)
                    .autocapitalization(.words)
            }

            // ── 4. Phone Number (primary) ──
            FormField(label: "Phone Number", systemImage: "phone", note: "Primary contact — used for WhatsApp & sign-in") {
                TextField("+250 788 123 456", text: $phoneNumber)
                    .keyboardType(.phonePad)
            }

            // ── 5. Email ──
            FormField(label: "Email Address", systemImage: "envelope") {
                TextField("pharmacy@example.com", text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
            }

            // ── 6. Physical Address ──
            FormField(label: "Physical Address", systemImage: "mappin.circle") {
                TextField("Enter full address including district", text: $address)
                    .autocapitalization(.words)
            }

            // ── 7. Location ──
            locationSection

            // ── 8. Operating Hours ──
            operatingHoursSection

            // ── 9. Password ──
            FormField(label: "Password", systemImage: "lock") {
                Group {
                    if showPassword {
                        TextField("Min. 6 characters", text: $password)
                            .autocapitalization(.none)
                    } else {
                        SecureField("Min. 6 characters", text: $password)
                    }
                }
                .overlay(alignment: .trailing) {
                    Button { showPassword.toggle() } label: {
                        Image(systemName: showPassword ? "eye.slash" : "eye")
                            .foregroundColor(.textSecondary)
                    }
                    .padding(.trailing, 4)
                }
            }

            // ── 10. Confirm Password ──
            FormField(label: "Confirm Password", systemImage: "lock") {
                Group {
                    if showConfirmPassword {
                        TextField("Re-enter your password", text: $confirmPassword)
                            .autocapitalization(.none)
                    } else {
                        SecureField("Re-enter your password", text: $confirmPassword)
                    }
                }
                .overlay(alignment: .trailing) {
                    Button { showConfirmPassword.toggle() } label: {
                        Image(systemName: showConfirmPassword ? "eye.slash" : "eye")
                            .foregroundColor(.textSecondary)
                    }
                    .padding(.trailing, 4)
                }
            }

            // ── FDA notice ──
            fdaNotice

            // ── Submit ──
            PrimaryButton(
                title: "Register Pharmacy",
                isLoading: viewModel.isLoading
            ) {
                submit()
            }
            .disabled(
                viewModel.licenseStatus == .checking ||
                viewModel.licenseStatus == .alreadyTaken ||
                viewModel.licenseStatus == .invalid
            )
            .opacity(
                (viewModel.licenseStatus == .checking ||
                 viewModel.licenseStatus == .alreadyTaken ||
                 viewModel.licenseStatus == .invalid) ? 0.5 : 1.0
            )

            // Sign in link
            Button { dismiss() } label: {
                HStack(spacing: 4) {
                    Text("Already have an account?")
                        .foregroundColor(.textSecondary)
                    Text("Sign In")
                        .foregroundColor(.primaryTeal)
                        .fontWeight(.semibold)
                }
                .font(.subheadline)
            }
            .padding(.bottom, 40)
        }
        .padding(20)
        .background(Color(.systemBackground))
        .cornerRadius(20)
        .shadow(color: .black.opacity(0.05), radius: 10)
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
    }

    // MARK: – License section
    private var licenseSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Label {
                    Text("Council Registration Number")
                        .font(.subheadline).fontWeight(.semibold)
                } icon: {
                    Image(systemName: "doc.text")
                        .foregroundColor(.textSecondary)
                }
                Text("*")
                    .foregroundColor(.primaryTeal)
                    .fontWeight(.bold)
            }

            Text("Format: NPC/A0000 — as issued by Rwanda FDA")
                .font(.caption)
                .foregroundColor(.textSecondary)

            HStack {
                TextField("NPC/A0000", text: $licenseNumber)
                    .autocapitalization(.allCharacters)
                    .font(.system(.body, design: .monospaced))
                    .onChange(of: licenseNumber) { newValue in
                        viewModel.checkLicense(newValue)
                    }

                // Spinner / status icon
                switch viewModel.licenseStatus {
                case .checking:
                    ProgressView()
                        .scaleEffect(0.8)
                case .valid:
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                case .alreadyTaken:
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                case .invalid:
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.red)
                case .idle:
                    EmptyView()
                }
            }
            .padding()
            .background(licenseBorderColor.opacity(0.06))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(licenseBorderColor, lineWidth: 1.5)
            )
            .cornerRadius(12)

            // Verification badge
            licenseBadge
        }
    }

    private var licenseBorderColor: Color {
        switch viewModel.licenseStatus {
        case .valid:     return .green
        case .alreadyTaken, .invalid: return .red
        default:         return Color.gray.opacity(0.3)
        }
    }

    @ViewBuilder
    private var licenseBadge: some View {
        switch viewModel.licenseStatus {
        case .valid:
            Label(
                "Verified: \(viewModel.licensedPharmacyName)",
                systemImage: "checkmark.shield.fill"
            )
            .font(.caption).fontWeight(.medium)
            .foregroundColor(.green)
        case .alreadyTaken:
            Label(
                "Already registered — sign in instead",
                systemImage: "exclamationmark.triangle.fill"
            )
            .font(.caption).fontWeight(.medium)
            .foregroundColor(.orange)
        case .invalid:
            Label(
                "Not found in the Rwanda FDA licensed list",
                systemImage: "xmark.circle.fill"
            )
            .font(.caption).fontWeight(.medium)
            .foregroundColor(.red)
        default:
            EmptyView()
        }
    }

    // MARK: – Location section
    private var locationSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Label {
                    Text("Pharmacy Location")
                        .font(.subheadline).fontWeight(.semibold)
                } icon: {
                    Image(systemName: "location.circle")
                        .foregroundColor(.textSecondary)
                }
                Text("*")
                    .foregroundColor(.primaryTeal)
                    .fontWeight(.bold)
            }

            Text("Set your pharmacy's position on the map.")
                .font(.caption)
                .foregroundColor(.textSecondary)

            // Tab switcher
            Picker("Location method", selection: $locationTab) {
                Label("Use My Location", systemImage: "location.fill")
                    .tag(LocationTab.gps)
                Label("Enter Coordinates", systemImage: "map")
                    .tag(LocationTab.coordinates)
            }
            .pickerStyle(.segmented)
            .padding(.vertical, 4)

            // GPS tab
            if locationTab == .gps {
                gpsPanel
            }

            // Manual coordinates tab
            if locationTab == .coordinates {
                coordinatesPanel
            }
        }
    }

    private var gpsPanel: some View {
        VStack(spacing: 10) {
            Text("Open this screen while physically at the pharmacy for best accuracy.")
                .font(.caption)
                .foregroundColor(.textSecondary)

            Button {
                captureGPS()
            } label: {
                HStack {
                    switch gpsStatus {
                    case .locating:
                        ProgressView().scaleEffect(0.8)
                        Text("Getting your location…")
                    case .success:
                        Image(systemName: "checkmark.circle.fill")
                        Text("Location captured — tap to update")
                    case .error:
                        Image(systemName: "exclamationmark.circle")
                        Text("Could not get location — tap to retry")
                    case .idle:
                        Image(systemName: "location.fill")
                        Text("Use My Location")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(gpsButtonBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(gpsButtonBorder, lineWidth: 1.5)
                )
                .cornerRadius(12)
            }
            .foregroundColor(gpsButtonForeground)
            .disabled(gpsStatus == .locating)

            if gpsStatus == .success, let loc = capturedLocation {
                coordinateConfirmation(lat: loc.latitude, lng: loc.longitude)
            }
        }
    }

    private var gpsButtonBackground: Color {
        switch gpsStatus {
        case .success: return Color.green.opacity(0.08)
        case .error:   return Color.red.opacity(0.06)
        default:       return Color.primaryTeal.opacity(0.06)
        }
    }
    private var gpsButtonBorder: Color {
        switch gpsStatus {
        case .success: return .green
        case .error:   return .red
        default:       return .primaryTeal
        }
    }
    private var gpsButtonForeground: Color {
        switch gpsStatus {
        case .success: return .green
        case .error:   return .red
        default:       return .primaryTeal
        }
    }

    private var coordinatesPanel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Open Google Maps, long-press your pharmacy → copy the coordinates shown.")
                .font(.caption)
                .foregroundColor(.textSecondary)

            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Latitude").font(.caption).foregroundColor(.textSecondary)
                    TextField("-1.944216", text: $manualLat)
                        .keyboardType(.decimalPad)
                        .font(.system(.body, design: .monospaced))
                        .padding(10)
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("Longitude").font(.caption).foregroundColor(.textSecondary)
                    TextField("30.061883", text: $manualLng)
                        .keyboardType(.decimalPad)
                        .font(.system(.body, design: .monospaced))
                        .padding(10)
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                }
            }

            if let loc = effectiveLocation, locationTab == .coordinates {
                coordinateConfirmation(lat: loc.latitude, lng: loc.longitude)
            }

            Link(destination: URL(string: "https://maps.google.com")!) {
                Label("Open Google Maps to find coordinates", systemImage: "arrow.up.right.square")
                    .font(.caption)
                    .foregroundColor(.primaryTeal)
            }
        }
    }

    private func coordinateConfirmation(lat: Double, lng: Double) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.green)
            VStack(alignment: .leading, spacing: 2) {
                Text("Location set")
                    .font(.caption).fontWeight(.semibold).foregroundColor(.green)
                Text(String(format: "%.6f, %.6f", lat, lng))
                    .font(.caption2)
                    .foregroundColor(.green.opacity(0.8))
                    .fontDesign(.monospaced)
            }
        }
        .padding(10)
        .background(Color.green.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.green.opacity(0.3)))
        .cornerRadius(10)
    }

    // MARK: – Operating Hours Section
    private var operatingHoursSection: some View {
        FormField(label: "Operating Hours", systemImage: "clock") {
            VStack(alignment: .leading, spacing: 12) {
                Toggle("Open 24/7", isOn: $is24Hours)
                    .font(.subheadline)
                    .tint(.primaryTeal)

                if !is24Hours {
                    Divider()

                    Text("Open Days")
                        .font(.caption)
                        .foregroundColor(.textSecondary)

                    // Day bubbles
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(OperatingHours.allDays, id: \.self) { day in
                                let isSelected = selectedDays.contains(day)
                                Text(String(day.prefix(3)))
                                    .font(.caption).fontWeight(.semibold)
                                    .padding(.horizontal, 12).padding(.vertical, 8)
                                    .background(isSelected ? Color.primaryTeal : Color.gray.opacity(0.1))
                                    .foregroundColor(isSelected ? .white : .textPrimary)
                                    .clipShape(Capsule())
                                    .onTapGesture {
                                        if isSelected { selectedDays.remove(day) }
                                        else { selectedDays.insert(day) }
                                    }
                            }
                        }
                    }

                    Divider()

                    HStack {
                        VStack(alignment: .leading) {
                            Text("Opens at").font(.caption).foregroundColor(.textSecondary)
                            DatePicker("", selection: $openTime, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                                .tint(.primaryTeal)
                        }
                        Spacer()
                        VStack(alignment: .leading) {
                            Text("Closes at").font(.caption).foregroundColor(.textSecondary)
                            DatePicker("", selection: $closeTime, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                                .tint(.primaryTeal)
                        }
                    }
                }
            }
        }
    }

    // MARK: – FDA notice
    private var fdaNotice: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "checkmark.shield.fill")
                .foregroundColor(.primaryTeal)
            Text("**Verified by Rwanda FDA.** Your council registration number is cross-checked against the official December 2025 list of 725 licensed human retail pharmacies.")
                .font(.caption)
                .foregroundColor(Color.primaryTeal.opacity(0.9))
        }
        .padding(14)
        .background(Color.primaryTeal.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.primaryTeal.opacity(0.25)))
        .cornerRadius(12)
    }

    // MARK: – Actions

    private func captureGPS() {
        gpsStatus = .locating
        if locationManager.isAuthorized {
            locationManager.startTracking()
            // Poll for the first location update
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                if let loc = locationManager.location {
                    capturedLocation = loc
                    gpsStatus = .success
                    locationManager.stopTracking()
                } else {
                    gpsStatus = .error
                }
            }
        } else {
            locationManager.requestPermission()
            // Observe authorization change once
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                if locationManager.isAuthorized {
                    captureGPS()
                } else {
                    gpsStatus = .error
                }
            }
        }
    }

    private func submit() {
        let lat = effectiveLocation?.latitude ?? 0.0
        let lng = effectiveLocation?.longitude ?? 0.0

        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        let orderedDays = OperatingHours.allDays.filter { selectedDays.contains($0) }

        viewModel.signUpPharmacy(
            pharmacyName: pharmacyName,
            ownerName: ownerName,
            phoneNumber: phoneNumber,
            email: email,
            licenseNumber: licenseNumber,
            address: address,
            latitude: lat,
            longitude: lng,
            is24Hours: is24Hours,
            operatingDays: is24Hours ? OperatingHours.allDays : orderedDays,
            openTime: is24Hours ? "00:00" : formatter.string(from: openTime),
            closeTime: is24Hours ? "23:59" : formatter.string(from: closeTime),
            password: password,
            confirmPassword: confirmPassword
        ) { result in
            switch result {
            case .success(let pharmacy):
                appState.signIn(pharmacy: pharmacy)
            case .failure(let error):
                print("Pharmacy sign-up failed: \(error)")
            }
        }
    }
}

// MARK: – Reusable sub-components

/// Labelled form field with optional helper note
private struct FormField<Content: View>: View {
    let label: String
    let systemImage: String
    var note: String? = nil
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(label, systemImage: systemImage)
                .font(.subheadline).fontWeight(.semibold)
                .foregroundColor(.textPrimary)

            if let note = note {
                Text(note)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
            }

            content
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
        }
    }
}

/// Red error banner shown above the form
private struct ErrorBanner: View {
    let message: String
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.circle.fill")
                .foregroundColor(.red)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.red)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.red.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.red.opacity(0.25)))
        .cornerRadius(12)
    }
}

#Preview {
    NavigationStack {
        SignUpPharmacyView()
            .environmentObject(AppState())
    }
}
