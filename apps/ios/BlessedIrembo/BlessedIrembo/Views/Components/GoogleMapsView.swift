/// Google Maps View
///
/// UIViewRepresentable wrapping GMSMapView to embed Google Maps
/// inside SwiftUI. Displays pharmacy pins and user location.

import SwiftUI
import GoogleMaps
import CoreLocation

// MARK: - Main Map View (UserMapView usage)

struct GoogleMapsView: UIViewRepresentable {
    
    // MARK: Properties
    
    let pharmacies: [Pharmacy]
    @Binding var selectedPharmacy: Pharmacy?
    @Binding var cameraTarget: CLLocationCoordinate2D
    var userLocation: CLLocationCoordinate2D?
    var onPharmacyTap: ((Pharmacy) -> Void)?
    
    // MARK: Coordinator
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    // MARK: UIViewRepresentable
    
    func makeUIView(context: Context) -> GMSMapView {
        let camera = GMSCameraPosition.camera(
            withLatitude: cameraTarget.latitude,
            longitude: cameraTarget.longitude,
            zoom: 13.5
        )
        
        let options = GMSMapViewOptions()
        options.camera = camera
        let mapView = GMSMapView(options: options)
        
        // Style settings
        mapView.isMyLocationEnabled = true
        mapView.settings.myLocationButton = false
        mapView.delegate = context.coordinator
        
        // Apply custom map style (optional – can be nil for default)
        if let styleURL = Bundle.main.url(forResource: "map_style", withExtension: "json"),
           let style = try? GMSMapStyle(contentsOfFileURL: styleURL) {
            mapView.mapStyle = style
        }
        
        // Initial markers
        addMarkers(to: mapView)
        
        return mapView
    }
    
    func updateUIView(_ mapView: GMSMapView, context: Context) {
        // Update camera if cameraTarget changed significantly
        let currentCenter = mapView.camera.target
        let threshold = 0.001
        if abs(currentCenter.latitude - cameraTarget.latitude) > threshold ||
           abs(currentCenter.longitude - cameraTarget.longitude) > threshold {
            let newCamera = GMSCameraPosition.camera(
                withLatitude: cameraTarget.latitude,
                longitude: cameraTarget.longitude,
                zoom: mapView.camera.zoom
            )
            mapView.animate(to: newCamera)
        }
        
        // Refresh markers when pharmacies change
        mapView.clear()
        addMarkers(to: mapView)
    }
    
    // MARK: - Marker Helpers
    
    private func addMarkers(to mapView: GMSMapView) {
        for pharmacy in pharmacies {
            let marker = GMSMarker()
            marker.position = CLLocationCoordinate2D(
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude
            )
            marker.title = pharmacy.name
            marker.snippet = pharmacy.address
            marker.icon = makeMarkerIcon(isVerified: pharmacy.isVerified,
                                         isSelected: selectedPharmacy?.id == pharmacy.id)
            marker.userData = pharmacy.id
            marker.map = mapView
        }
    }
    
    /// Render a teal circle with a cross icon that mirrors CompactPharmacyMarker
    static func makeMarkerIcon(isVerified: Bool, isSelected: Bool) -> UIImage {
        let size: CGFloat = isSelected ? 44 : 32
        let color = isVerified ? UIColor(red: 0.051, green: 0.580, blue: 0.533, alpha: 1) : UIColor.systemGray
        
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: size, height: size))
        return renderer.image { ctx in
            // Circle
            let rect = CGRect(x: 0, y: 0, width: size, height: size)
            ctx.cgContext.setFillColor(color.cgColor)
            ctx.cgContext.fillEllipse(in: rect)
            
            // White cross
            let lineWidth: CGFloat = size * 0.12
            let inset: CGFloat = size * 0.28
            ctx.cgContext.setStrokeColor(UIColor.white.cgColor)
            ctx.cgContext.setLineWidth(lineWidth)
            ctx.cgContext.setLineCap(.round)
            
            // Vertical bar
            ctx.cgContext.move(to: CGPoint(x: size / 2, y: inset))
            ctx.cgContext.addLine(to: CGPoint(x: size / 2, y: size - inset))
            
            // Horizontal bar
            ctx.cgContext.move(to: CGPoint(x: inset, y: size / 2))
            ctx.cgContext.addLine(to: CGPoint(x: size - inset, y: size / 2))
            
            ctx.cgContext.strokePath()
        }
    }
    
    func makeMarkerIcon(isVerified: Bool, isSelected: Bool) -> UIImage {
        return Self.makeMarkerIcon(isVerified: isVerified, isSelected: isSelected)
    }
    
    // MARK: - Coordinator
    
    class Coordinator: NSObject, GMSMapViewDelegate {
        var parent: GoogleMapsView
        private var pharmacyMap: [String: Pharmacy] = [:]
        
        init(_ parent: GoogleMapsView) {
            self.parent = parent
            // Build quick lookup
            for pharmacy in parent.pharmacies {
                pharmacyMap[pharmacy.id] = pharmacy
            }
        }
        
        func mapView(_ mapView: GMSMapView, didTap marker: GMSMarker) -> Bool {
            if let pharmacyId = marker.userData as? String,
               let pharmacy = parent.pharmacies.first(where: { $0.id == pharmacyId }) {
                DispatchQueue.main.async {
                    self.parent.selectedPharmacy = pharmacy
                    self.parent.onPharmacyTap?(pharmacy)
                }
            }
            return true
        }
        
        func mapView(_ mapView: GMSMapView, didTapAt coordinate: CLLocationCoordinate2D) {
            DispatchQueue.main.async {
                self.parent.selectedPharmacy = nil
            }
        }
    }
}

// MARK: - Detail Map View (PharmacyDetailsView usage)

struct GoogleMapsDetailView: UIViewRepresentable {
    let pharmacy: Pharmacy
    
    func makeUIView(context: Context) -> GMSMapView {
        let camera = GMSCameraPosition.camera(
            withLatitude: pharmacy.latitude,
            longitude: pharmacy.longitude,
            zoom: 15
        )
        let options = GMSMapViewOptions()
        options.camera = camera
        let mapView = GMSMapView(options: options)
        mapView.isUserInteractionEnabled = false
        mapView.isMyLocationEnabled = false
        
        // Add single pharmacy marker
        let marker = GMSMarker()
        marker.position = CLLocationCoordinate2D(
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude
        )
        marker.icon = GoogleMapsView.makeMarkerIcon(isVerified: pharmacy.isVerified, isSelected: true)
        marker.map = mapView
        
        return mapView
    }
    
    func updateUIView(_ uiView: GMSMapView, context: Context) {}
}
