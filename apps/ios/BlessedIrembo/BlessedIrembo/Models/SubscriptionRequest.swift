/// Subscription Request Model
///
/// Mirrors the Firestore `subscription_requests` collection schema.
/// A document is created when a pharmacy submits a payment intent
/// and updated when a receipt is uploaded or the admin acts on it.

import Foundation
import FirebaseFirestore

// MARK: - Plan Definition

struct SubscriptionPlan: Identifiable {
    let id: String          // e.g. "1_month"
    let name: String        // e.g. "1 Month"
    let amount: Int         // RWF
    let months: Int         // months to add on approval
    let label: String       // display string
    let isPopular: Bool

    static let all: [SubscriptionPlan] = [
        SubscriptionPlan(id: "1_month",   name: "1 Month",   amount: 1000,  months: 1,  label: "1,000 RWF / month",   isPopular: false),
        SubscriptionPlan(id: "3_months",  name: "3 Months",  amount: 3000,  months: 3,  label: "3,000 RWF / 3 months", isPopular: true),
        SubscriptionPlan(id: "12_months", name: "12 Months", amount: 10000, months: 12, label: "10,000 RWF / year",    isPopular: false),
    ]
}

// MARK: - Subscription Status

enum SubscriptionStatus: Equatable {
    case freeTrial(daysRemaining: Int)
    case premium(expiresOn: Date)
    case expired
    case unknown

    var displayTitle: String {
        switch self {
        case .freeTrial(let days): return days > 0 ? "Free Trial" : "Free Trial (ending today)"
        case .premium: return "Premium"
        case .expired: return "Expired"
        case .unknown: return "Loading..."
        }
    }

    var displaySubtitle: String {
        switch self {
        case .freeTrial(let days):
            return days > 1 ? "\(days) days remaining" : "1 day remaining"
        case .premium(let date):
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            return "Active until \(formatter.string(from: date))"
        case .expired:
            return "Please renew to keep your listing active"
        case .unknown:
            return ""
        }
    }

    var isActive: Bool {
        switch self {
        case .freeTrial, .premium: return true
        case .expired, .unknown: return false
        }
    }
}

// MARK: - Subscription Request

struct SubscriptionRequest: Identifiable {
    let id: String
    let pharmacyId: String
    let pharmacyName: String
    let planId: String
    let amount: Int
    var receiptUrl: String?
    let status: String      // "pending" | "approved" | "rejected"
    let createdAt: Date

    /// Human-readable plan name derived from planId
    var planDisplayName: String {
        SubscriptionPlan.all.first(where: { $0.id == planId })?.name ?? planId
    }

    init(id: String, data: [String: Any]) {
        self.id = id
        self.pharmacyId = data["pharmacyId"] as? String ?? ""
        self.pharmacyName = data["pharmacyName"] as? String ?? ""
        self.planId = data["planId"] as? String ?? ""
        self.amount = data["amount"] as? Int ?? 0
        self.receiptUrl = data["receiptUrl"] as? String
        self.status = data["status"] as? String ?? "pending"
        if let ts = data["createdAt"] as? Timestamp {
            self.createdAt = ts.dateValue()
        } else {
            self.createdAt = Date()
        }
    }
}
