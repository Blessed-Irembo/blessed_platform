/// Edit Location & Address View
///
/// Shows the pharmacy's current location data in read-only mode by default.
/// The user must tap "Change Address" to unlock editing, preventing
/// accidental changes. Saves address, district, and GPS coordinates to Firestore.

import SwiftUI
import CoreLocation
import FirebaseFirestore

struct EditLocationView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.presentationMode) var presentationMode

    // MARK: - Mode

    @State private var isEditing = false

    // MARK: - Form State (populated from current pharmacy on appear)

    @State private var address = ""
    @State private var district = ""
    @State private var latitudeText = ""
    @State private var longitudeText = ""

    // MARK: - Async State

    @State private var isSaving = false
    @State private var isGeocoding = false
    @State private var showSuccess = false
    @State private var errorMessage: String?

    // MARK: - Body

    var body: some View {
        Form {
            // Current data — always visible, read-only
            currentInfoSection

            // Edit form — only shown when editing
            if isEditing {
                editFieldsSection
                geocodeSection
                saveSection
            }

            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }
            }
        }
        .navigationTitle("Location & Address")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear(perform: loadCurrentValues)
        .alert("Location updated", isPresented: $showSuccess) {
            Button("OK", role: .cancel) {
                isEditing = false
                presentationMode.wrappedValue.dismiss()
            }
        } message: {
            Text("Your location and address have been saved successfully.")
        }
    }

    // MARK: - Read-Only Section

    private var currentInfoSection: some View {
        Section {
            infoRow(icon: "mappin.circle.fill", iconColor: .red,
                    label: "Address",
                    value: appState.currentPharmacy?.address.isEmpty == false
                        ? appState.currentPharmacy!.address : "Not set")

            infoRow(icon: "building.2.fill", iconColor: Color.primaryTeal,
                    label: "District",
                    value: appState.currentPharmacy?.district.isEmpty == false
                        ? appState.currentPharmacy!.district : "Not set")

            if let lat = appState.currentPharmacy?.latitude,
               let lon = appState.currentPharmacy?.longitude,
               lat != 0 || lon != 0 {
                infoRow(icon: "location.fill", iconColor: .blue,
                        label: "Coordinates",
                        value: String(format: "%.5f, %.5f", lat, lon))
            }

            // Change button — only when not already editing
            if !isEditing {
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isEditing = true
                    }
                } label: {
                    HStack {
                        Spacer()
                        Image(systemName: "pencil")
                        Text("Change Address")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                    .foregroundColor(Color.primaryTeal)
                }
            }
        } header: {
            Text("Current Location")
        }
    }

    // MARK: - Edit Fields

    private var editFieldsSection: some View {
        Section {
            TextField("Street address", text: $address, axis: .vertical)
                .lineLimit(2...4)
                .autocapitalization(.words)

            TextField("District (e.g. Kicukiro)", text: $district)
                .autocapitalization(.words)

            HStack {
                Label {
                    Text("Latitude")
                        .foregroundColor(.secondary)
                } icon: {
                    Image(systemName: "location.north.fill")
                        .foregroundColor(.secondary)
                }
                Spacer()
                TextField("–1.9536", text: $latitudeText)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 130)
            }

            HStack {
                Label {
                    Text("Longitude")
                        .foregroundColor(.secondary)
                } icon: {
                    Image(systemName: "location.east.fill")
                        .foregroundColor(.secondary)
                }
                Spacer()
                TextField("30.0606", text: $longitudeText)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 130)
            }

            // Cancel editing
            Button(role: .cancel) {
                withAnimation { isEditing = false }
                loadCurrentValues()   // reset any unsaved typing
                errorMessage = nil
            } label: {
                HStack {
                    Spacer()
                    Text("Cancel")
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
        } header: {
            Text("Edit Location")
        } footer: {
            Text("Find your coordinates by long-pressing your location in Google Maps.")
        }
    }

    // MARK: - Geocode Button

    private var geocodeSection: some View {
        Section {
            Button(action: geocodeAddress) {
                HStack {
                    Spacer()
                    if isGeocoding {
                        ProgressView().padding(.horizontal, 8)
                    } else {
                        Image(systemName: "map.fill")
                        Text("Auto-fill coordinates from address")
                    }
                    Spacer()
                }
            }
            .disabled(address.trimmingCharacters(in: .whitespaces).isEmpty || isGeocoding)
            .foregroundColor(address.trimmingCharacters(in: .whitespaces).isEmpty ? .gray : Color.primaryTeal)
        }
    }

    // MARK: - Save Button

    private var saveSection: some View {
        Section {
            Button(action: save) {
                HStack {
                    Spacer()
                    if isSaving {
                        ProgressView()
                    } else {
                        Text("Save Location")
                            .fontWeight(.bold)
                    }
                    Spacer()
                }
            }
            .disabled(isSaving || address.trimmingCharacters(in: .whitespaces).isEmpty)
            .foregroundColor(address.trimmingCharacters(in: .whitespaces).isEmpty ? .gray : Color.primaryTeal)
        }
    }

    // MARK: - Helper Row

    private func infoRow(icon: String, iconColor: Color, label: String, value: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(iconColor)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.body)
                    .foregroundColor(.primary)
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Logic

    private func loadCurrentValues() {
        guard let pharmacy = appState.currentPharmacy else { return }
        address       = pharmacy.address
        district      = pharmacy.district
        latitudeText  = pharmacy.latitude  != 0 ? String(format: "%.6f", pharmacy.latitude)  : ""
        longitudeText = pharmacy.longitude != 0 ? String(format: "%.6f", pharmacy.longitude) : ""
    }

    private func geocodeAddress() {
        let query = "\(address), \(district), Rwanda"
        isGeocoding = true
        errorMessage = nil
        CLGeocoder().geocodeAddressString(query) { placemarks, error in
            DispatchQueue.main.async {
                isGeocoding = false
                if let error = error {
                    errorMessage = "Could not find coordinates: \(error.localizedDescription)"
                    return
                }
                if let loc = placemarks?.first?.location {
                    latitudeText  = String(format: "%.6f", loc.coordinate.latitude)
                    longitudeText = String(format: "%.6f", loc.coordinate.longitude)
                } else {
                    errorMessage = "No results found. Try a more specific address."
                }
            }
        }
    }

    private func save() {
        guard let pharmacy = appState.currentPharmacy else { return }
        errorMessage = nil

        let lat = Double(latitudeText) ?? pharmacy.latitude
        let lon = Double(longitudeText) ?? pharmacy.longitude

        guard Pharmacy.isValidRwandaCoordinates(latitude: lat, longitude: lon) else {
            errorMessage = "Coordinates appear to be outside Rwanda. Please double-check."
            return
        }

        isSaving = true
        let data: [String: Any] = [
            "address":   address.trimmingCharacters(in: .whitespaces),
            "district":  district.trimmingCharacters(in: .whitespaces),
            "latitude":  lat,
            "longitude": lon,
            "updatedAt": FieldValue.serverTimestamp()
        ]

        FirebaseManager.shared.pharmaciesCollection
            .document(pharmacy.id)
            .updateData(data) { error in
                DispatchQueue.main.async {
                    isSaving = false
                    if let error = error {
                        errorMessage = "Failed to save: \(error.localizedDescription)"
                    } else {
                        showSuccess = true
                    }
                }
            }
    }
}
