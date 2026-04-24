/// Pharmacy Subscription View
///
/// Full implementation mirroring the web app subscription flow:
///   1. Status banner (Free Trial / Premium / Expired)
///   2. Three plan cards (expandable)
///   3. Expanded plan → USSD payment code → "I Intend to Pay" button
///   4. Pending state → receipt upload + cancel option
///
/// Requires FirebaseStorage for receipt upload.
/// See SubscriptionViewModel.swift for instructions to add it.

import SwiftUI
import PhotosUI
import FirebaseFirestore

struct PharmacySubscriptionView: View {

    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = SubscriptionViewModel()

    @State private var expandedPlanId: String? = nil
    @State private var selectedPhoto: PhotosPickerItem? = nil
    @State private var selectedImageData: Data? = nil
    @State private var showCancelConfirm = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {

                // ── Status Banner ──────────────────────────────────────
                statusBanner

                // ── Pending State or Plan Selection ───────────────────
                if let pending = viewModel.pendingRequest {
                    pendingView(request: pending)
                } else {
                    planSelectionSection
                }

                Spacer(minLength: 40)
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Subscription")
        .navigationBarTitleDisplayMode(.large)
        .onAppear(perform: onAppear)
        .onDisappear { viewModel.stopListener() }
        .onChange(of: appState.currentPharmacy?.id) { _ in onAppear() }
        .onChange(of: selectedPhoto) { newItem in
            Task { await loadSelectedPhoto(from: newItem) }
        }
        .alert("Error", isPresented: Binding(
            get: { viewModel.errorMessage != nil },
            set: { if !$0 { viewModel.clearMessages() } }
        )) {
            Button("OK") { viewModel.clearMessages() }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
        .alert("Success", isPresented: Binding(
            get: { viewModel.successMessage != nil },
            set: { if !$0 { viewModel.clearMessages() } }
        )) {
            Button("OK") { viewModel.clearMessages() }
        } message: {
            Text(viewModel.successMessage ?? "")
        }
        .confirmationDialog(
            "Cancel Payment Request",
            isPresented: $showCancelConfirm,
            titleVisibility: .visible
        ) {
            Button("Cancel Request", role: .destructive) {
                Task { await viewModel.cancelRequest() }
            }
            Button("Keep Request", role: .cancel) {}
        } message: {
            Text("Are you sure you want to cancel your pending payment request? You will need to submit a new intent to pay again.")
        }
    }

    // MARK: - Status Banner

    @ViewBuilder
    private var statusBanner: some View {
        let status = viewModel.status
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(statusColor(status).opacity(0.15))
                    .frame(width: 48, height: 48)
                Image(systemName: statusIcon(status))
                    .font(.title3.weight(.semibold))
                    .foregroundColor(statusColor(status))
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(status.displayTitle)
                    .font(.headline)
                    .foregroundColor(.primary)
                Text(status.displaySubtitle)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding(16)
        .background(statusColor(status).opacity(0.08))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(statusColor(status).opacity(0.3), lineWidth: 1)
        )
        .cornerRadius(14)
    }

    // MARK: - Plan Selection

    private var planSelectionSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Choose a Plan")
                .font(.title3.weight(.bold))
                .padding(.top, 8)

            ForEach(SubscriptionPlan.all) { plan in
                planCard(plan)
            }
        }
    }

    @ViewBuilder
    private func planCard(_ plan: SubscriptionPlan) -> some View {
        let isExpanded = expandedPlanId == plan.id

        VStack(spacing: 0) {

            // ── Popular badge ─────────────────────────────────────
            if plan.isPopular {
                Text("MOST POPULAR")
                    .font(.caption.weight(.bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .background(Color.primaryTeal)
                    .cornerRadius(isExpanded ? 0 : 14, corners: [.topLeft, .topRight])
            }

            // ── Card Header ───────────────────────────────────────
            Button(action: {
                withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                    expandedPlanId = isExpanded ? nil : plan.id
                }
            }) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(plan.name)
                            .font(.headline)
                            .foregroundColor(.primary)
                        Text(plan.label)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption.weight(.semibold))
                        .foregroundColor(Color.primaryTeal)
                }
                .padding(16)
                .background(Color(.systemBackground))
            }
            .buttonStyle(.plain)

            // ── Expanded: USSD code + Intent button ───────────────
            if isExpanded {
                Divider()
                    .padding(.horizontal)

                VStack(alignment: .leading, spacing: 20) {

                    // Step 1: Payment instructions
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Step 1: Make Payment via MoMo", systemImage: "1.circle.fill")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(Color.primaryTeal)

                        Text("Dial the code below on your phone to pay \(plan.amount.formatted()) RWF via MTN Mobile Money:")
                            .font(.footnote)
                            .foregroundColor(.secondary)

                        // USSD Code block
                        VStack(spacing: 8) {
                            // Build the USSD string as an AttributedString to prevent
                            // SwiftUI from interpreting the leading * as markdown bold.
                            let ussdCode = "*182*8*1*38220*\(plan.amount)#"
                            Text(ussdCode)
                                .font(.system(.body, design: .monospaced).weight(.bold))
                                .foregroundColor(Color.primaryTeal)
                                .multilineTextAlignment(.center)
                                .textSelection(.enabled)          // iOS 15+: long-press to copy
                                .environment(\.openURL, OpenURLAction { _ in .discarded })
                                // Disable markdown by giving it a verbatim AttributedString
                                .padding(14)
                                .frame(maxWidth: .infinity)
                                .background(Color.primaryTeal.opacity(0.08))
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.primaryTeal.opacity(0.3), lineWidth: 1)
                                )

                            Button(action: { copyUSSD(amount: plan.amount) }) {
                                Label("Copy Code", systemImage: "doc.on.doc")
                                    .font(.caption.weight(.medium))
                                    .foregroundColor(Color.primaryTeal)
                            }

                            // Confirmation hint — mirrors the web app
                            HStack(spacing: 6) {
                                Image(systemName: "info.circle.fill")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                                Text("You will be prompted to confirm a payment to **Blessed HealthConnect LTD** for **\(plan.amount.formatted()) RWF**.")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(10)
                            .background(Color.orange.opacity(0.07))
                            .cornerRadius(8)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("📌 Important:")
                                .font(.caption.weight(.semibold))
                                .foregroundColor(.secondary)
                            Text("After dialing, follow the prompts on your phone to confirm the MoMo payment. Once paid, tap the button below.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(10)
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(8)
                    }

                    // Intend to Pay Button (after Step 1)
                    Button(action: {
                        guard let pharmacy = appState.currentPharmacy else { return }
                        Task { await viewModel.submitIntent(plan: plan, pharmacy: pharmacy) }
                    }) {
                        HStack {
                            if viewModel.isLoading {
                                ProgressView()
                                    .tint(.white)
                                    .padding(.trailing, 4)
                            }
                            Text(viewModel.isLoading ? "Submitting..." : "I Have Paid — Intend to Pay")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(14)
                        .background(Color.primaryTeal)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .disabled(viewModel.isLoading)
                }
                .padding(16)
                .background(Color(.systemBackground))
            }
        }
        .cornerRadius(14)
        .shadow(color: plan.isPopular ? Color.primaryTeal.opacity(0.15) : .black.opacity(0.05), radius: 8, x: 0, y: 3)
    }

    // MARK: - Pending Request View

    @ViewBuilder
    private func pendingView(request: SubscriptionRequest) -> some View {
        VStack(alignment: .leading, spacing: 16) {

            // Header
            HStack(spacing: 12) {
                Image(systemName: "clock.fill")
                    .foregroundColor(.orange)
                    .font(.title3)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Payment Pending Review")
                        .font(.headline)
                    Text("Our team is reviewing your \(request.planDisplayName) plan request.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.orange.opacity(0.08))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.orange.opacity(0.3), lineWidth: 1)
            )

            // Plan summary
            VStack(alignment: .leading, spacing: 8) {
                infoRow(label: "Plan", value: request.planDisplayName)
                infoRow(label: "Amount", value: "\(request.amount.formatted()) RWF")
                infoRow(label: "Submitted", value: request.createdAt.formatted(date: .abbreviated, time: .shortened))
                if let receiptUrl = request.receiptUrl, !receiptUrl.isEmpty {
                    HStack {
                        Text("Receipt")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .frame(width: 80, alignment: .leading)
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Uploaded")
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(.green)
                    }
                }
            }
            .padding(14)
            .background(Color(.systemBackground))
            .cornerRadius(12)

            // Step 2: Receipt Upload
            VStack(alignment: .leading, spacing: 12) {
                Label("Step 2: Upload Payment Receipt (Optional)", systemImage: "2.circle.fill")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(Color.primaryTeal)

                Text("To speed up approval, upload a screenshot of your MoMo payment confirmation.")
                    .font(.footnote)
                    .foregroundColor(.secondary)

                if let imageData = selectedImageData,
                   let uiImage = UIImage(data: imageData) {
                    // Preview selected image
                    VStack(spacing: 10) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFit()
                            .frame(maxHeight: 220)
                            .cornerRadius(10)

                        Button(action: {
                            guard let pharmacy = appState.currentPharmacy,
                                  let data = selectedImageData else { return }
                            Task { await viewModel.uploadReceipt(imageData: data, pharmacy: pharmacy) }
                        }) {
                            HStack {
                                if viewModel.isUploading {
                                    ProgressView(value: viewModel.uploadProgress)
                                        .tint(.white)
                                        .frame(width: 60)
                                }
                                Text(viewModel.isUploading ? "Uploading..." : "Upload Receipt")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(12)
                            .background(Color.primaryTeal)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(viewModel.isUploading)
                    }
                } else {
                    PhotosPicker(
                        selection: $selectedPhoto,
                        matching: .images,
                        photoLibrary: .shared()
                    ) {
                        HStack {
                            Image(systemName: "photo.badge.plus")
                            Text("Select Screenshot from Photos")
                                .fontWeight(.medium)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(12)
                        .background(Color(.secondarySystemBackground))
                        .foregroundColor(Color.primaryTeal)
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.primaryTeal.opacity(0.4), lineWidth: 1.5)
                        )
                    }
                }
            }
            .padding(14)
            .background(Color(.systemBackground))
            .cornerRadius(12)

            // Cancel request
            Button(role: .destructive, action: { showCancelConfirm = true }) {
                Label("Cancel Pending Request", systemImage: "xmark.circle")
                    .frame(maxWidth: .infinity)
                    .padding(12)
                    .background(Color.red.opacity(0.07))
                    .foregroundColor(.red)
                    .cornerRadius(10)
            }
            .disabled(viewModel.isLoading)
        }
    }

    // MARK: - Helpers

    private func onAppear() {
        guard let pharmacy = appState.currentPharmacy else { return }
        viewModel.calculateStatus(pharmacy: pharmacy)
        viewModel.startPendingRequestListener(pharmacyId: pharmacy.id)
    }

    private func infoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(width: 80, alignment: .leading)
            Text(value)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.primary)
            Spacer()
        }
    }

    private func copyUSSD(amount: Int) {
        UIPasteboard.general.string = "*182*8*1*38220*\(amount)#"
    }

    private func loadSelectedPhoto(from item: PhotosPickerItem?) async {
        guard let item else { return }
        if let data = try? await item.loadTransferable(type: Data.self) {
            selectedImageData = data
        }
    }

    private func statusColor(_ status: SubscriptionStatus) -> Color {
        switch status {
        case .freeTrial: return .blue
        case .premium: return Color.primaryTeal
        case .expired: return .red
        case .unknown: return .gray
        }
    }

    private func statusIcon(_ status: SubscriptionStatus) -> String {
        switch status {
        case .freeTrial: return "gift.fill"
        case .premium: return "star.fill"
        case .expired: return "exclamationmark.triangle.fill"
        case .unknown: return "questionmark.circle"
        }
    }
}

// MARK: - Corner Radius Helper

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat
    var corners: UIRectCorner
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
