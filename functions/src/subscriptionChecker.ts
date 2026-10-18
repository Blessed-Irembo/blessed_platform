import * as admin from 'firebase-admin';
import { PharmacyRecord, ReminderStage, ReminderTask } from './types';
import { buildReminderEmail } from './templates';
import { sendEmail } from './emailService';

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

export function determineReminderStage(
  daysRemaining: number,
  remindersSent?: Record<string, any>,
  expiryDateStr?: string
): ReminderStage | null {
  const isSent = (stage: ReminderStage): boolean => {
    if (!remindersSent || !expiryDateStr) return false;
    return Boolean(remindersSent[`reminder_${stage}_${expiryDateStr}`]);
  };

  // Stage 4: Expired today or in the last 3 days (sent at most once)
  if (daysRemaining <= 0 && daysRemaining >= -3) {
    if (!isSent('expired')) return 'expired';
    return null;
  }

  // Stage 3: Final 24 hours / 1 day remaining
  if (daysRemaining === 1) {
    if (!isSent('1_day')) return '1_day';
    return null;
  }

  // Stage 2: 2 to 3 days remaining
  if (daysRemaining <= 3 && daysRemaining > 1) {
    if (!isSent('3_days')) return '3_days';
    return null;
  }

  // Stage 1: 4 to 7 days remaining
  if (daysRemaining <= 7 && daysRemaining > 3) {
    if (!isSent('7_days')) return '7_days';
    return null;
  }

  return null;
}

export async function checkAndSendSubscriptionReminders(): Promise<{
  totalPharmacies: number;
  remindersSent: number;
  skipped: number;
  errors: number;
}> {
  const db = admin.firestore();
  const snapshot = await db.collection('pharmacies').get();

  const now = new Date();
  const tasksToExecute: ReminderTask[] = [];

  let remindersSent = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as PharmacyRecord;
    data.id = doc.id;

    // Skip administratively deactivated pharmacies
    if (data.isActive === false) {
      skipped++;
      continue;
    }

    // Skip if pharmacy has no valid email address
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
      skipped++;
      continue;
    }

    // Resolve expiration date
    const endDate = parseDate(data.subscriptionEndDate);
    const createdAt = parseDate(data.createdAt);
    const trialEndDate = parseDate(data.trialEndDate) ||
      (createdAt ? new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000) : null);

    const effectiveEndDate = endDate || trialEndDate;

    if (!effectiveEndDate) {
      skipped++;
      continue;
    }

    // Calculate days remaining
    const diffMs = effectiveEndDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const expiryDateStr = effectiveEndDate.toISOString().split('T')[0];
    const stage = determineReminderStage(daysRemaining, data.remindersSent, expiryDateStr);

    if (!stage) {
      // Already sent for this stage or not in a reminder window
      continue;
    }

    const reminderKey = `reminder_${stage}_${expiryDateStr}`;

    tasksToExecute.push({
      pharmacy: data,
      stage,
      daysRemaining,
      expiryDate: effectiveEndDate,
      reminderKey,
    });
  }

  console.log(`[SubscriptionChecker] Found ${tasksToExecute.length} reminder(s) to send.`);

  const renewalUrl = process.env.RENEWAL_URL || 'https://www.blessedirembo.com/pharmacy/subscription';

  for (const task of tasksToExecute) {
    const { pharmacy, stage, daysRemaining, expiryDate, reminderKey } = task;

    try {
      const expiryDateFormatted = expiryDate.toLocaleDateString('en-RW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const emailPayload = buildReminderEmail({
        pharmacyName: pharmacy.name,
        stage,
        daysRemaining,
        expiryDateFormatted,
        renewalUrl,
      });

      await sendEmail({
        to: pharmacy.email,
        subject: emailPayload.subject,
        html: emailPayload.html,
        text: emailPayload.text,
      });

      // Mark reminder as sent in Firestore
      await db.collection('pharmacies').doc(pharmacy.id).set(
        {
          remindersSent: {
            [reminderKey]: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      console.log(`[SubscriptionChecker] Successfully sent ${reminderKey} to ${pharmacy.name} (${pharmacy.email})`);
      remindersSent++;
    } catch (err: any) {
      console.error(`[SubscriptionChecker] Error sending ${reminderKey} to ${pharmacy.name}:`, err);
      errors++;
    }
  }

  return {
    totalPharmacies: snapshot.size,
    remindersSent,
    skipped,
    errors,
  };
}
