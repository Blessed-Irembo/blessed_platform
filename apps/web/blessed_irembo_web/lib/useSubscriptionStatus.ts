/**
 * useSubscriptionStatus
 *
 * Shared hook that calculates a pharmacy's subscription status from Firestore
 * data. Used by all protected pharmacy pages to determine if a paywall should
 * be shown.
 *
 * Status rules (mirror iOS SubscriptionViewModel exactly):
 *  - Has subscriptionEndDate AND it's in the future → "premium"
 *  - No subscriptionEndDate AND within 90 days of createdAt → "freeTrial"
 *  - All other cases → "expired"
 */

export type SubscriptionStatus = 'freeTrial' | 'premium' | 'expired' | 'loading';

export interface SubscriptionStatusResult {
  status: SubscriptionStatus;
  isExpired: boolean;
  daysRemaining: number | null;   // for freeTrial
  expiresOn: Date | null;         // for premium
}

export function getSubscriptionStatus(pharmacy: any): SubscriptionStatusResult {
  if (!pharmacy) {
    return { status: 'loading', isExpired: false, daysRemaining: null, expiresOn: null };
  }

  const now = new Date();

  // ── Administrative Deactivation ──────────────────────────────────────────
  if (pharmacy.isActive === false) {
    return { status: 'expired', isExpired: true, daysRemaining: null, expiresOn: null };
  }

  // ── Premium: has a paid subscriptionEndDate ──────────────────────────────
  if (pharmacy.subscriptionEndDate) {
    const endDate: Date =
      typeof pharmacy.subscriptionEndDate.toDate === 'function'
        ? pharmacy.subscriptionEndDate.toDate()
        : new Date(pharmacy.subscriptionEndDate);

    if (endDate > now) {
      return { status: 'premium', isExpired: false, daysRemaining: null, expiresOn: endDate };
    }
    // Has an end date but it's in the past → expired
    return { status: 'expired', isExpired: true, daysRemaining: null, expiresOn: endDate };
  }

  // ── Free Trial: no paid sub, check 90-day trial window ────────────────────
  if (pharmacy.createdAt) {
    const createdAt: Date =
      typeof pharmacy.createdAt.toDate === 'function'
        ? pharmacy.createdAt.toDate()
        : new Date(pharmacy.createdAt);

    const trialEnd = new Date(createdAt);
    trialEnd.setDate(trialEnd.getDate() + 90);

    if (trialEnd > now) {
      const msRemaining = trialEnd.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
      return { status: 'freeTrial', isExpired: false, daysRemaining, expiresOn: trialEnd };
    }
  }

  // ── Expired ───────────────────────────────────────────────────────────────
  return { status: 'expired', isExpired: true, daysRemaining: null, expiresOn: null };
}
