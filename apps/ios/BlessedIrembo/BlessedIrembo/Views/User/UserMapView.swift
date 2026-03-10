/// User Map View - Redesigned
///
/// Main screen for users showing a compact map at the top with
/// a scrollable list of pharmacies below. Includes search and filtering.

import SwiftUI
import GoogleMaps
import CoreLocation
import Combine

struct UserMapView: View {
    @StateObject private var viewModel = PharmacyMapViewModel()
    @StateObject private var locationManager = LocationManager()
    @State private var cameraTarget = MockData.defaultLocation
    @State private var selectedPharmacy: Pharmacy?
    @State private var cancellables = Set<AnyCancellable>()
    
    var body: some View {
        VStack(spacing: 0) {
            searchSection
            mapSection
            pharmacyHeader
            Divider()
            pharmacyList
        }
        .background(Color.white)
        .navigationTitle("Find Pharmacies")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            setupLocationTracking()
        }
    }
    
    private var searchSection: some View {
        SearchBar(text: $viewModel.searchText)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.white)
    }
    
    private var mapSection: some View {
        ZStack(alignment: .topTrailing) {
            GoogleMapsView(
                pharmacies: viewModel.filteredPharmacies,
                selectedPharmacy: $selectedPharmacy,
                cameraTarget: $cameraTarget,
                userLocation: locationManager.location
            ) { pharmacy in
                selectPharmacy(pharmacy)
            }
            .frame(height: 280)
            
            locationButton
        }
    }
    
    private var locationButton: some View {
        Button(action: centerOnUserLocation) {
            Circle()
                .fill(Color.white)
                .frame(width: 44, height: 44)
                .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
                .overlay(
                    Image(systemName: locationManager.isAuthorized ? "location.fill" : "location")
                        .foregroundColor(.primaryTeal)
                        .font(.system(size: 20))
                )
        }
        .padding(12)
    }
    
    private var pharmacyHeader: some View {
        HStack {
            Text("\(viewModel.filteredPharmacies.count) pharmacies nearby")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.textPrimary)
            
            Spacer()
            
            Button(action: {}) {
                HStack(spacing: 4) {
                    Image(systemName: "line.3.horizontal.decrease.circle")
                        .font(.system(size: 18))
                    Text("Sort")
                        .font(.subheadline)
                }
                .foregroundColor(.primaryTeal)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.white)
    }
    
    private var pharmacyList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.pharmaciesByDistance()) { pharmacy in
                    NavigationLink(destination: PharmacyDetailsView(pharmacy: pharmacy, userLocation: locationManager.location ?? MockData.defaultLocation)) {
                        PharmacyListCard(
                            pharmacy: pharmacy,
                            userLocation: locationManager.location ?? MockData.defaultLocation,
                            isSelected: selectedPharmacy?.id == pharmacy.id
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Color.gray.opacity(0.05))
    }
    
    private func setupLocationTracking() {
        viewModel.userLocation = locationManager.location
        if let location = locationManager.location {
            region.center = location
        }
        locationManager.$location.sink { newLocation in
            viewModel.userLocation = newLocation
        }.store(in: &cancellables)
    }
    
    private func selectPharmacy(_ pharmacy: Pharmacy) {
        selectedPharmacy = pharmacy
        withAnimation {
            cameraTarget = pharmacy.coordinate
        }
    }
    
    private func centerOnUserLocation() {
        if !locationManager.isAuthorized {
            locationManager.requestPermission()
            return
        }
        
        if let location = locationManager.location {
            withAnimation {
                cameraTarget = location
            }
        }
    }
}

// MARK: - Compact Pharmacy Marker

struct CompactPharmacyMarker: View {
    let pharmacy: Pharmacy
    let isSelected: Bool
    
    var body: some View {
        Circle()
            .fill(pharmacy.isVerified ? Color.primaryTeal : Color.gray)
            .frame(width: isSelected ? 36 : 28, height: isSelected ? 36 : 28)
            .overlay(
                Image(systemName: pharmacy.isVerified ? "cross.case.fill" : "cross.case")
                    .foregroundColor(.white)
                    .font(.system(size: isSelected ? 16 : 12))
            )
            .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
            .scaleEffect(isSelected ? 1.1 : 1.0)
            .animation(.spring(response: 0.3), value: isSelected)
    }
}

// MARK: - Pharmacy List Card

struct PharmacyListCard: View {
    let pharmacy: Pharmacy
    let userLocation: CLLocationCoordinate2D
    let isSelected: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            // Pharmacy icon/image
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(
                        LinearGradient(
                            colors: [Color.primaryTeal.opacity(0.1), Color.primaryTeal.opacity(0.05)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 70, height: 70)
                
                Image(systemName: "cross.case.fill")
                    .font(.system(size: 32))
                    .foregroundColor(.primaryTeal)
            }
            
            // Pharmacy details
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 6) {
                    Text(pharmacy.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)
                    
                    if pharmacy.isVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 14))
                            .foregroundColor(.primaryTeal)
                    }
                }
                
                // Distance and rating
                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.primaryTeal)
                        Text(pharmacy.formattedDistance(from: userLocation))
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                    }
                    
                    if pharmacy.reviewCount > 0 {
                        HStack(spacing: 3) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 11))
                                .foregroundColor(.orange)
                            Text(String(format: "%.1f", pharmacy.rating))
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                            Text("(\(pharmacy.reviewCount))")
                                .font(.caption)
                                .foregroundColor(.textSecondary)
                        }
                    }
                }
                
                // Address
                Text(pharmacy.address)
                    .font(.caption)
                    .foregroundColor(.textSecondary)
                    .lineLimit(1)
                
                // Status/Hours
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 6, height: 6)
                    Text("Open now")
                        .font(.caption)
                        .foregroundColor(.green)
                        .fontWeight(.medium)
                }
            }
            
            Spacer()
            
            // Chevron
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.gray.opacity(0.4))
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(isSelected ? 0.12 : 0.06), radius: isSelected ? 12 : 6, x: 0, y: 2)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isSelected ? Color.primaryTeal.opacity(0.3) : Color.clear, lineWidth: 2)
        )
    }
}

// MARK: - Search Bar Component

struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.textSecondary)
                .font(.system(size: 18))
            
            TextField("Search pharmacies...", text: $text)
                .font(.body)
                .foregroundColor(.textPrimary)
            
            if !text.isEmpty {
                Button(action: { text = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.textSecondary)
                        .font(.system(size: 18))
                }
            }
        }
        .padding(12)
        .background(Color.gray.opacity(0.08))
        .cornerRadius(12)
    }
}

#Preview {
    UserMapView()
}
