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
        // Kigali city center — hard-coded so the SDK NEVER shows San Francisco
        let kigaliLat: CLLocationDegrees = -1.9536
        let kigaliLng: CLLocationDegrees = 30.0606
        
        let camera = GMSCameraPosition.camera(
            withLatitude: kigaliLat,
            longitude: kigaliLng,
            zoom: 13.5
        )
        
        let options = GMSMapViewOptions()
        options.camera = camera
        let mapView = GMSMapView(options: options)
        
        // Apply custom map style
        if let styleURL = Bundle.main.url(forResource: "map_style", withExtension: "json"),
           let style = try? GMSMapStyle(contentsOfFileURL: styleURL) {
            mapView.mapStyle = style
        }
        
        mapView.isMyLocationEnabled = true
        mapView.settings.myLocationButton = false
        mapView.delegate = context.coordinator
        
        // Force move to Kigali synchronously (without animation)
        // This overrides any SDK internal default before first render
        mapView.moveCamera(GMSCameraUpdate.setTarget(CLLocationCoordinate2D(latitude: kigaliLat, longitude: kigaliLng), zoom: 13.5))
        
        // Draw initial markers
        context.coordinator.updateMarkers(on: mapView, pharmacies: pharmacies, selected: selectedPharmacy?.id)
        context.coordinator.lastPharmacyIds = pharmacies.map { $0.id }
        
        return mapView
    }
    
    func updateUIView(_ mapView: GMSMapView, context: Context) {
        // Only move camera if cameraTarget changed meaningfully
        let current = mapView.camera.target
        let threshold: Double = 0.0001
        if abs(current.latitude - cameraTarget.latitude) > threshold ||
           abs(current.longitude - cameraTarget.longitude) > threshold {
            mapView.animate(to: GMSCameraPosition.camera(
                withLatitude: cameraTarget.latitude,
                longitude: cameraTarget.longitude,
                zoom: mapView.camera.zoom
            ))
        }
        
        // Only redraw markers if the pharmacy list changed — not on every render
        let newIds = pharmacies.map { $0.id }
        let selectedId = selectedPharmacy?.id
        if newIds != context.coordinator.lastPharmacyIds || selectedId != context.coordinator.lastSelectedId {
            mapView.clear()
            context.coordinator.updateMarkers(on: mapView, pharmacies: pharmacies, selected: selectedId)
            context.coordinator.lastPharmacyIds = newIds
            context.coordinator.lastSelectedId = selectedId
        }
    }
    
    // MARK: - Coordinator
    
    class Coordinator: NSObject, GMSMapViewDelegate {
        var parent: GoogleMapsView
        var lastPharmacyIds: [String] = []
        var lastSelectedId: String? = nil
        
        init(_ parent: GoogleMapsView) {
            self.parent = parent
        }
        
        func updateMarkers(on mapView: GMSMapView, pharmacies: [Pharmacy], selected selectedId: String?) {
            for pharmacy in pharmacies {
                let marker = GMSMarker()
                marker.position = CLLocationCoordinate2D(latitude: pharmacy.latitude, longitude: pharmacy.longitude)
                marker.title = pharmacy.name
                marker.snippet = pharmacy.address
                marker.icon = GoogleMapsView.makeMarkerIcon(isVerified: pharmacy.isVerified, isSelected: pharmacy.id == selectedId)
                marker.userData = pharmacy.id
                marker.map = mapView
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
    
    // MARK: - Static Marker Icon Generator
    
    static func makeMarkerIcon(isVerified: Bool, isSelected: Bool) -> UIImage {
        let size: CGFloat = isSelected ? 48 : 36
        let color = UIColor.white
        let strokeColor = isVerified ? UIColor(red: 0.051, green: 0.580, blue: 0.533, alpha: 1) : UIColor.systemGray
        
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: size + 8, height: size + size * 0.3 + 8))
        return renderer.image { ctx in
            // Move drawing area to accommodate shadow (4px offset from top-left)
            ctx.cgContext.translateBy(x: 4, y: 4)
            
            // Apply subtle drop shadow
            ctx.cgContext.setShadow(offset: CGSize(width: 0, height: 2), blur: 4, color: UIColor.black.withAlphaComponent(0.2).cgColor)
            
            // Bubble rect
            let rect = CGRect(x: 0, y: 0, width: size, height: size)
            let path = UIBezierPath(roundedRect: rect, cornerRadius: size * 0.3)
            
            // Pointer
            let pointerPath = UIBezierPath()
            pointerPath.move(to: CGPoint(x: size * 0.4, y: size))
            pointerPath.addLine(to: CGPoint(x: size * 0.5, y: size + size * 0.25))
            pointerPath.addLine(to: CGPoint(x: size * 0.6, y: size))
            pointerPath.close()
            
            path.append(pointerPath)
            
            // Fill
            color.setFill()
            path.fill()
            
            // Clear drop shadow to prevent stroke from being doubled
            ctx.cgContext.setShadow(offset: .zero, blur: 0, color: nil)
            
            // Stroke
            strokeColor.setStroke()
            path.lineWidth = 1.5
            path.stroke()
            
            // Draw logo image inside
            if let logoImage = UIImage(named: "logo1") {
                let imageInset: CGFloat = size * 0.15
                let imageRect = CGRect(x: imageInset, y: imageInset, width: size - imageInset * 2, height: size - imageInset * 2)
                
                ctx.cgContext.saveGState()
                let clipPath = UIBezierPath(roundedRect: imageRect, cornerRadius: (size - imageInset * 2) / 2)
                clipPath.addClip()
                logoImage.draw(in: imageRect)
                ctx.cgContext.restoreGState()
            } else {
                // Fallback white cross
                let lineWidth: CGFloat = size * 0.12
                let crossInset: CGFloat = size * 0.25
                ctx.cgContext.setStrokeColor(UIColor.white.cgColor)
                ctx.cgContext.setLineWidth(lineWidth)
                ctx.cgContext.setLineCap(.round)
                
                // Vertical bar
                ctx.cgContext.move(to: CGPoint(x: size / 2, y: crossInset))
                ctx.cgContext.addLine(to: CGPoint(x: size / 2, y: size - crossInset))
                
                // Horizontal bar
                ctx.cgContext.move(to: CGPoint(x: crossInset, y: size / 2))
                ctx.cgContext.addLine(to: CGPoint(x: size - crossInset, y: size / 2))
                
                ctx.cgContext.strokePath()
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
        mapView.isUserInteractionEnabled = true
        mapView.isMyLocationEnabled = true
        mapView.settings.compassButton = true
        
        if let styleURL = Bundle.main.url(forResource: "map_style", withExtension: "json"),
           let style = try? GMSMapStyle(contentsOfFileURL: styleURL) {
            mapView.mapStyle = style
        }
        
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
