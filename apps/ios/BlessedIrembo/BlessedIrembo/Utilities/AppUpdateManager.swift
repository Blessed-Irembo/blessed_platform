/// App Update Manager
///
/// Handles checking for updates by fetching metadata from the App Store.
/// Compares the local version against the live version on the App Store.

import Foundation
import Combine

class AppUpdateManager: ObservableObject {
    static let shared = AppUpdateManager()
    
    @Published var isUpdateAvailable = false
    @Published var updateVersion: String?
    @Published var appStoreURL: URL?
    
    // Set this to true to force show the update prompt during developer testing
    private let forceShowUpdatePromptForTesting = false
    
    func checkForUpdate() {
        if forceShowUpdatePromptForTesting {
            DispatchQueue.main.async {
                self.isUpdateAvailable = true
                self.updateVersion = "2.0.0 (Test Mode)"
                self.appStoreURL = URL(string: "https://apps.apple.com/app/id6739989932")
            }
            return
        }
        
        guard let bundleId = Bundle.main.bundleIdentifier else { return }
        
        let urlString = "https://itunes.apple.com/lookup?bundleId=\(bundleId)"
        guard let url = URL(string: urlString) else { return }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            guard let data = data, error == nil else { return }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                   let results = json["results"] as? [[String: Any]],
                   let result = results.first {
                    
                    if let appStoreVersion = result["version"] as? String,
                       let trackViewUrlString = result["trackViewUrl"] as? String,
                       let appStoreURL = URL(string: trackViewUrlString) {
                        
                        let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
                        
                        if appStoreVersion.compare(currentVersion, options: .numeric) == .orderedDescending {
                            DispatchQueue.main.async {
                                self?.isUpdateAvailable = true
                                self?.updateVersion = appStoreVersion
                                self?.appStoreURL = appStoreURL
                            }
                        }
                    }
                }
            } catch {
                print("AppUpdateManager: Error parsing App Store lookup response: \(error.localizedDescription)")
            }
        }.resume()
    }
}
