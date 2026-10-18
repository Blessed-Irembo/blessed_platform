export type ReminderStage = '7_days' | '3_days' | '1_day' | 'expired';

export interface PharmacyRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  subscriptionEndDate?: any;
  trialEndDate?: any;
  createdAt?: any;
  isPremium?: boolean;
  hasPaidSubscription?: boolean;
  subscriptionPlan?: string;
  isActive?: boolean;
  remindersSent?: Record<string, any>;
}

export interface ReminderTask {
  pharmacy: PharmacyRecord;
  stage: ReminderStage;
  daysRemaining: number;
  expiryDate: Date;
  reminderKey: string;
}
