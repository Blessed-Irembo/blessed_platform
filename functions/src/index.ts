import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import { checkAndSendSubscriptionReminders } from './subscriptionChecker';

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Scheduled Cloud Function
 * Runs every day at 08:00 AM Kigali / Rwanda Time (Africa/Kigali)
 */
export const checkSubscriptionReminders = onSchedule(
  {
    schedule: 'every day 08:00',
    timeZone: 'Africa/Kigali',
    memory: '256MiB',
    maxInstances: 1,
    timeoutSeconds: 300,
  },
  async () => {
    console.log('[ScheduledJob] Starting daily pharmacy subscription expiration check...');
    const result = await checkAndSendSubscriptionReminders();
    console.log('[ScheduledJob] Check completed:', JSON.stringify(result));
  }
);

/**
 * Manual Trigger HTTP Endpoint
 * Allows running the check on-demand for testing or manual maintenance.
 * Usage: GET/POST https://<region>-<project>.cloudfunctions.net/triggerSubscriptionRemindersManual?token=blessed-reminders-2026
 */
export const triggerSubscriptionRemindersManual = onRequest(
  {
    memory: '256MiB',
    timeoutSeconds: 300,
    cors: false,
  },
  async (req, res) => {
    const secret = req.query.token || req.headers['x-admin-token'];
    if (secret !== 'blessed-reminders-2026') {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }

    try {
      console.log('[ManualTrigger] Initiated manual pharmacy subscription check...');
      const result = await checkAndSendSubscriptionReminders();
      res.status(200).json({ success: true, result });
    } catch (error: any) {
      console.error('[ManualTrigger] Error during manual check:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
