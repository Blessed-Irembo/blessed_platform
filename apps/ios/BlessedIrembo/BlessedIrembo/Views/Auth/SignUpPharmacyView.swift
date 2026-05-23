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
        ZStack {
            ScrollView {
                VStack(spacing: 0) {
                    Spacer().frame(height: 36)
                    headerSection
                    formSection
                }
            }
            
            VStack {
                FloatingLanguageSwitcher()
                Spacer()
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(appState.t("auth.registerPharmacy"))
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: – Header
    private var headerSection: some View {
        VStack(spacing: 10) {
            Logo(size: 64)
                .padding(.top, 28)
            Text(appState.t("auth.registerPharmacy"))
                .font(.system(size: 26, weight: .bold))
                .foregroundColor(.textPrimary)
            Text(appState.t("auth.registerPharmacySubtitle"))
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
            FormField(label: appState.t("auth.pharmacyNameLabel"), systemImage: "building.2") {
                TextField(appState.t("auth.pharmacyNamePlaceholder"), text: $pharmacyName)
                    .autocapitalization(.words)
            }

            // ── 3. Owner / Responsible Person ──
            FormField(label: appState.t("auth.ownerNameLabel"), systemImage: "person") {
                TextField(appState.t("auth.ownerNamePlaceholder"), text: $ownerName)
                    .autocapitalization(.words)
            }

            // ── 4. Phone Number (primary) ──
            FormField(label: appState.t("auth.phoneLabel"), systemImage: "phone", note: appState.t("auth.phoneModePrimaryHint")) {
                TextField(appState.t("auth.phonePlaceholder"), text: $phoneNumber)
                    .keyboardType(.phonePad)
            }

            // ── 5. Email ──
            FormField(label: appState.t("auth.emailLabel"), systemImage: "envelope") {
                TextField(appState.t("auth.emailPlaceholder"), text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
            }

            // ── 6. Physical Address ──
            FormField(label: appState.t("auth.addressLabel"), systemImage: "mappin.circle") {
                TextField(appState.t("auth.addressPlaceholder"), text: $address)
                    .autocapitalization(.words)
            }

            // ── 7. Location ──
            locationSection

            // ── 8. Operating Hours ──
            operatingHoursSection

            // ── 9. Password ──
            FormField(label: appState.t("auth.passwordLabel"), systemImage: "lock") {
                Group {
                    if showPassword {
                        TextField(appState.t("auth.passwordHint"), text: $password)
                            .autocapitalization(.none)
                    } else {
                        SecureField(appState.t("auth.passwordHint"), text: $password)
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
            FormField(label: appState.t("auth.confirmPasswordLabel"), systemImage: "lock") {
                Group {
                    if showConfirmPassword {
                        TextField(appState.t("auth.confirmPasswordPlaceholder"), text: $confirmPassword)
                            .autocapitalization(.none)
                    } else {
                        SecureField(appState.t("auth.confirmPasswordPlaceholder"), text: $confirmPassword)
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
                title: appState.t("auth.registerPharmacy"),
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
                    Text(appState.t("role.alreadyAccount"))
                        .foregroundColor(.textSecondary)
                    Text(appState.t("role.signIn"))
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
                    Text(appState.t("auth.licenseLabel"))
                        .font(.subheadline).fontWeight(.semibold)
                } icon: {
                    Image(systemName: "doc.text")
                        .foregroundColor(.textSecondary)
                }
                Text("*")
                    .foregroundColor(.primaryTeal)
                    .fontWeight(.bold)
            }

            Text(appState.t("auth.licenseHint"))
                .font(.caption)
                .foregroundColor(.textSecondary)

            HStack {
                TextField(appState.t("auth.licensePlaceholder"), text: $licenseNumber)
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
                String(format: appState.t("auth.licenseVerified"), viewModel.licensedPharmacyName),
                systemImage: "checkmark.shield.fill"
            )
            .font(.caption).fontWeight(.medium)
            .foregroundColor(.green)
        case .alreadyTaken:
            Label(
                appState.t("auth.licenseTaken"),
                systemImage: "exclamationmark.triangle.fill"
            )
            .font(.caption).fontWeight(.medium)
            .foregroundColor(.orange)
        case .invalid:
            Label(
                appState.t("auth.licenseNotFound"),
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
                    Text(appState.t("auth.pharmacyLocation"))
                        .font(.subheadline).fontWeight(.semibold)
                } icon: {
                    Image(systemName: "location.circle")
                        .foregroundColor(.textSecondary)
                }
                Text("*")
                    .foregroundColor(.primaryTeal)
                    .fontWeight(.bold)
            }

            Text(appState.t("auth.pharmacyLocationSubtitle"))
                .font(.caption)
                .foregroundColor(.textSecondary)

            // Tab switcher
            Picker(appState.t("auth.locationMethod"), selection: $locationTab) {
                Label(appState.t("auth.useMyLocation"), systemImage: "location.fill")
                    .tag(LocationTab.gps)
                Label(appState.t("auth.enterCoordinates"), systemImage: "map")
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
            Text(appState.t("auth.gpsHint"))
                .font(.caption)
                .foregroundColor(.textSecondary)

            Button {
                captureGPS()
            } label: {
                HStack {
                    switch gpsStatus {
                    case .locating:
                        ProgressView().scaleEffect(0.8)
                        Text(appState.t("auth.gettingLocation"))
                    case .success:
                        Image(systemName: "checkmark.circle.fill")
                        Text(appState.t("auth.gpsSuccess"))
                    case .error:
                        Image(systemName: "exclamationmark.circle")
                        Text(appState.t("auth.gpsError"))
                    case .idle:
                        Image(systemName: "location.fill")
                        Text(appState.t("auth.useMyLocation"))
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
            Text(appState.t("auth.coordsHint"))
                .font(.caption)
                .foregroundColor(.textSecondary)

            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(appState.t("auth.latitude")).font(.caption).foregroundColor(.textSecondary)
                    TextField("-1.944216", text: $manualLat)
                        .keyboardType(.decimalPad)
                        .font(.system(.body, design: .monospaced))
                        .padding(10)
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text(appState.t("auth.longitude")).font(.caption).foregroundColor(.textSecondary)
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
                Label(appState.t("auth.openMapsHint"), systemImage: "arrow.up.right.square")
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
                Text(appState.t("auth.locationSet"))
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
        FormField(label: appState.t("auth.operatingHours"), systemImage: "clock") {
            VStack(alignment: .leading, spacing: 12) {
                Toggle(appState.t("auth.is24_7"), isOn: $is24Hours)
                    .font(.subheadline)
                    .tint(.primaryTeal)

                if !is24Hours {
                    Divider()

                    Text(appState.t("auth.openDays"))
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
                            Text(appState.t("auth.opensAt")).font(.caption).foregroundColor(.textSecondary)
                            DatePicker("", selection: $openTime, displayedComponents: .hourAndMinute)
                                .labelsHidden()
                                .tint(.primaryTeal)
                        }
                        Spacer()
                        VStack(alignment: .leading) {
                            Text(appState.t("auth.closesAt")).font(.caption).foregroundColor(.textSecondary)
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
            Text(appState.t("auth.fdaNotice"))
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
