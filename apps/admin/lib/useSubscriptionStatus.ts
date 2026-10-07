/**
 * useSubscriptionStatus (Admin copy)
 *
 * Shared utility that calculates a pharmacy's subscription status from
 * Firestore data. Used by the Access Control panel, Pharmacies list, and
 * Subscriptions management pages.
 *
 * Status rules:
 *  - Administratively disabled (isActive === false) → "expired"
 *  - subscriptionEndDate in future:
 *      * explicit paid / renewed, OR past initial 90-day trial → "premium"
 *      * within initial 90-day trial period → "freeTrial"
 *  - subscriptionEndDate in past → "expired"
 *  - No subscriptionEndDate:
 *      * within 90 days of createdAt/trialEndDate → "freeTrial"
 *      * else → "expired"
 */

export type SubscriptionStatus = 'freeTrial' | 'premium' | 'expired' | 'loading';

export interface SubscriptionStatusResult {
  status: SubscriptionStatus;
  isExpired: boolean;
  daysRemaining: number | null;
  expiresOn: Date | null;
}

export function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === 'function') {
    try {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch (_) {}
  }
  if (typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000);
  }
  if (typeof val === 'number') {
    const d = val < 10000000000 ? new Date(val * 1000) : new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
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

  // ── Resolve Dates ────────────────────────────────────────────────────────
  const endDate: Date | null = parseDate(pharmacy.subscriptionEndDate);
  const createdAt: Date | null = parseDate(pharmacy.createdAt);
  const trialEndDate: Date | null = parseDate(pharmacy.trialEndDate) ||
    (createdAt ? new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000) : null);

  const isExplicitPaid = pharmacy.isPremium === true ||
    pharmacy.hasPaidSubscription === true ||
    pharmacy.subscriptionPlan === 'Premium';

  // ── Active Subscription Check ────────────────────────────────────────────
  if (endDate && endDate > now) {
    // If explicitly marked as paid/premium, OR if the end date extends beyond the initial 90-day trial period,
    // OR if the pharmacy registered more than 90 days ago, this is an active paid/renewed subscription.
    const isPastInitialTrial = trialEndDate
      ? (endDate.getTime() > trialEndDate.getTime() + 24 * 60 * 60 * 1000 || now.getTime() > trialEndDate.getTime())
      : true;

    if (isExplicitPaid || isPastInitialTrial) {
      return { status: 'premium', isExpired: false, daysRemaining: null, expiresOn: endDate };
    } else {
      // Newly registered pharmacy within initial trial period
      const msRemaining = endDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
      return { status: 'freeTrial', isExpired: false, daysRemaining, expiresOn: endDate };
    }
  }

  // ── If subscriptionEndDate is set and in the past, it is expired ──────────
  if (endDate && endDate <= now) {
    return { status: 'expired', isExpired: true, daysRemaining: 0, expiresOn: endDate };
  }

  // ── Free Trial (within 90 days of registration without subscriptionEndDate)
  if (trialEndDate) {
    if (trialEndDate > now) {
      const msRemaining = trialEndDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
      return { status: 'freeTrial', isExpired: false, daysRemaining, expiresOn: trialEndDate };
    }
    return { status: 'expired', isExpired: true, daysRemaining: 0, expiresOn: trialEndDate };
  }

  // ── Fallback Expired ──────────────────────────────────────────────────────
  return { status: 'expired', isExpired: true, daysRemaining: null, expiresOn: null };
}
