import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AppNotification {
  id: string;
  recipientId: string;       // pharmacy.id, user.id, or "ADMIN"
  title: string;
  message: string;
  type: 'subscription' | 'system' | 'alert';
  isRead: boolean;
  createdAt: any;            // Firestore Timestamp
  actionUrl?: string;        // Optional URL to navigate to when clicked
}

/**
 * Creates a new notification in Firestore.
 */
export async function sendNotification(
  recipientId: string,
  title: string,
  message: string,
  type: AppNotification['type'] = 'system',
  actionUrl?: string
) {
  try {
    const payload = {
      recipientId,
      title,
      message,
      type,
      isRead: false,
      createdAt: serverTimestamp(),
      ...(actionUrl && { actionUrl }),
    };

    await addDoc(collection(db, 'notifications'), payload);
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Marks a notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
    });
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}
