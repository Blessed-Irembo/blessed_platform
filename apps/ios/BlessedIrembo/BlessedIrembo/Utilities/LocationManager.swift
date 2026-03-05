/// Location Manager
///
/// Handles user location tracking and authorization for map features.
/// Wraps CoreLocation functionality for SwiftUI integration.

import Foundation
import CoreLocation
import Combine

class LocationManager: NSObject, ObservableObject {
    private let locationManager = CLLocationManager()
    
    @Published var location: CLLocationCoordinate2D?
    @Published var authorizationStatus: CLAuthorizationStatus
    @Published var isAuthorized: Bool = false
    
    override init() {
        self.authorizationStatus = locationManager.authorizationStatus
        super.init()
        
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 10 // Update every 10 meters
        
        checkAuthorization()
    }
    
    /// Request location permission
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    /// Start tracking user location
    func startTracking() {
        guard isAuthorized else {
            requestPermission()
            return
        }
        locationManager.startUpdatingLocation()
    }
    
    /// Stop tracking user location
    func stopTracking() {
        locationManager.stopUpdatingLocation()
    }
    
    /// Check current authorization status
    private func checkAuthorization() {
        switch authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            isAuthorized = true
            startTracking()
        case .notDetermined:
            isAuthorized = false
        case .denied, .restricted:
            isAuthorized = false
        @unknown default:
            isAuthorized = false
        }
    }
}

// MARK: - CLLocationManagerDelegate

extension LocationManager: CLLocationManagerDelegate {
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus
        checkAuthorization()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        self.location = location.coordinate
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location manager failed with error: \(error.localizedDescription)")
    }
}
