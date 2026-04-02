/// Edit Operating Hours View
///
/// Lets the pharmacy owner configure their opening schedule.
/// Changes are written directly to Firestore and reflected live
/// via the AppState snapshot listener.

import SwiftUI
import FirebaseFirestore

struct EditOperatingHoursView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.presentationMode) var presentationMode

    // MARK: - State

    @State private var is24Hours = false
    @State private var selectedDays: Set<String> = []
    @State private var openTime = Date()
    @State private var closeTime = Date()
    @State private var isSaving = false
    @State private var showSuccess = false
    @State private var errorMessage: String?

    private let allDays = OperatingHours.allDays

    // MARK: - Body

    var body: some View {
        Form {
            // 24/7 Toggle
            Section {
                Toggle(isOn: $is24Hours) {
                    Label {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Open 24/7")
                                .font(.body)
                            Text("Always open, all days")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    } icon: {
                        Image(systemName: "clock.fill")
                            .foregroundColor(.orange)
                    }
                }
                .tint(Color.primaryTeal)
            }

            // Day selection
            if !is24Hours {
                Section("Open Days") {
                    ForEach(allDays, id: \.self) { day in
                        Button(action: { toggleDay(day) }) {
                            HStack {
                                Text(day)
                                    .foregroundColor(.primary)
                                Spacer()
                                if selectedDays.contains(day) {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(Color.primaryTeal)
                                } else {
                                    Image(systemName: "circle")
                                        .foregroundColor(.gray.opacity(0.4))
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }

                // Time pickers
                Section("Opening Hours") {
                    DatePicker("Opens at", selection: $openTime, displayedComponents: .hourAndMinute)
                        .tint(Color.primaryTeal)
                    DatePicker("Closes at", selection: $closeTime, displayedComponents: .hourAndMinute)
                        .tint(Color.primaryTeal)
                }
            }

            // Save
            Section {
                Button(action: save) {
                    HStack {
                        Spacer()
                        if isSaving {
                            ProgressView()
                        } else {
                            Text("Save Hours")
                                .fontWeight(.bold)
                        }
                        Spacer()
                    }
                }
                .disabled(isSaving || (!is24Hours && selectedDays.isEmpty))
                .foregroundColor((!is24Hours && selectedDays.isEmpty) ? .gray : Color.primaryTeal)
            }

            if let error = errorMessage {
                Section {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }
            }
        }
        .navigationTitle("Operating Hours")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear(perform: loadCurrentValues)
        .alert("Hours updated", isPresented: $showSuccess) {
            Button("OK", role: .cancel) {
                presentationMode.wrappedValue.dismiss()
            }
        } message: {
            Text("Your operating hours have been saved successfully.")
        }
    }

    // MARK: - Helpers

    private func toggleDay(_ day: String) {
        if selectedDays.contains(day) {
            selectedDays.remove(day)
        } else {
            selectedDays.insert(day)
        }
    }

    private func loadCurrentValues() {
        guard let ph = appState.currentPharmacy else { return }
        let oh = ph.operatingHours
        is24Hours = oh.is24Hours
        selectedDays = Set(oh.days)

        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"

        if !oh.openTime.isEmpty, let d = formatter.date(from: oh.openTime) {
            openTime = d
        } else {
            // Default: 08:00
            openTime = calendar.date(bySettingHour: 8, minute: 0, second: 0, of: Date()) ?? Date()
        }
        if !oh.closeTime.isEmpty, let d = formatter.date(from: oh.closeTime) {
            closeTime = d
        } else {
            // Default: 20:00
            closeTime = calendar.date(bySettingHour: 20, minute: 0, second: 0, of: Date()) ?? Date()
        }
    }

    private func save() {
        guard let pharmacy = appState.currentPharmacy else { return }
        isSaving = true
        errorMessage = nil

        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"

        // Sort selected days in canonical order
        let orderedDays = allDays.filter { selectedDays.contains($0) }

        let ohData: [String: Any] = [
            "is24Hours": is24Hours,
            "days": is24Hours ? allDays : orderedDays,
            "openTime": is24Hours ? "00:00" : formatter.string(from: openTime),
            "closeTime": is24Hours ? "23:59" : formatter.string(from: closeTime)
        ]

        FirebaseManager.shared.pharmaciesCollection
            .document(pharmacy.id)
            .updateData([
                "operatingHours": ohData,
                "is24_7": is24Hours,
                "updatedAt": FieldValue.serverTimestamp()
            ]) { error in
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
