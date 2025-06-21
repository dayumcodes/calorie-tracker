"use client";

import { useReminderSettings, ReminderSettings } from '@/hooks/use-reminder-settings';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration || !this.isSupported) {
      return null;
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Get VAPID public key (you'll need to generate this)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      // Convert VAPID key to Uint8Array
      const vapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      console.log('Push subscription created:', this.subscription);
      
      // Save subscription to backend (you'll implement this)
      await this.saveSubscriptionToBackend(this.subscription);
      
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      
      // Remove subscription from backend
      await this.removeSubscriptionFromBackend();
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async scheduleLocalNotification(notification: NotificationData, delay: number): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    try {
      // Schedule notification using setTimeout (for demo purposes)
      // In production, you'd use a more robust scheduling system
      setTimeout(() => {
        this.showLocalNotification(notification);
      }, delay);
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  }

  async showLocalNotification(notification: NotificationData): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/favicon/android-chrome-192x192.png',
        badge: notification.badge || '/favicon/favicon-32x32.png',
        tag: notification.tag || 'calorie-reminder',
        requireInteraction: true,
        data: notification.data || {}
      };

      if (this.registration) {
        await this.registration.showNotification(notification.title, options);
      } else {
        new Notification(notification.title, options);
      }
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  async scheduleDailyReminders(settings: ReminderSettings): Promise<void> {
    if (!settings.logMeals) {
      return;
    }

    // Parse reminder time
    const [hours, minutes] = settings.logMealsTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    // Schedule the notification
    await this.scheduleLocalNotification({
      title: 'Time to Log Your Meal! 🍽️',
      body: 'Don\'t forget to track your nutrition for today. Tap to log your meal now!',
      tag: 'daily-meal-reminder',
      data: {
        url: '/log-food/manual',
        type: 'meal-reminder'
      }
    }, delay);

    // Schedule recurring reminder (every 24 hours)
    setInterval(async () => {
      await this.showLocalNotification({
        title: 'Time to Log Your Meal! 🍽️',
        body: 'Don\'t forget to track your nutrition for today. Tap to log your meal now!',
        tag: 'daily-meal-reminder',
        data: {
          url: '/log-food/manual',
          type: 'meal-reminder'
        }
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  async scheduleHydrationReminders(settings: ReminderSettings): Promise<void> {
    if (!settings.drinkWater) {
      return;
    }

    const frequencyMap = {
      'every_hour': 60 * 60 * 1000,
      'every_2_hours': 2 * 60 * 60 * 1000,
      'every_3_hours': 3 * 60 * 60 * 1000
    };

    const interval = frequencyMap[settings.drinkWaterFrequency as keyof typeof frequencyMap] || 2 * 60 * 60 * 1000;

    // Schedule recurring hydration reminders
    setInterval(async () => {
      await this.showLocalNotification({
        title: 'Stay Hydrated! 💧',
        body: 'Time to drink some water and stay healthy!',
        tag: 'hydration-reminder',
        data: {
          url: '/',
          type: 'hydration-reminder'
        }
      });
    }, interval);
  }

  async scheduleWeeklyWeighIn(settings: ReminderSettings): Promise<void> {
    if (!settings.weighIn) {
      return;
    }

    const dayMap = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 0
    };

    const targetDay = dayMap[settings.weighInDay as keyof typeof dayMap] || 1;
    const [hours, minutes] = settings.weighInTime.split(':').map(Number);

    const scheduleWeeklyReminder = () => {
      const now = new Date();
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);

      // Find next occurrence of the target day
      const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
      targetDate.setDate(now.getDate() + daysUntilTarget);

      // If time has passed today and it's the target day, schedule for next week
      if (daysUntilTarget === 0 && targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 7);
      }

      const delay = targetDate.getTime() - now.getTime();

      setTimeout(async () => {
        await this.showLocalNotification({
          title: 'Weekly Weigh-In Reminder ⚖️',
          body: 'Time for your weekly progress check! Track your weight to monitor your journey.',
          tag: 'weekly-weigh-in',
          data: {
            url: '/progress',
            type: 'weigh-in-reminder'
          }
        });

        // Schedule next week's reminder
        scheduleWeeklyReminder();
      }, delay);
    };

    scheduleWeeklyReminder();
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async saveSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    // TODO: Implement backend API call to save subscription
    console.log('Saving subscription to backend:', subscription);
    
    // Example implementation:
    // await fetch('/api/notifications/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription)
    // });
  }

  private async removeSubscriptionFromBackend(): Promise<void> {
    // TODO: Implement backend API call to remove subscription
    console.log('Removing subscription from backend');
    
    // Example implementation:
    // await fetch('/api/notifications/unsubscribe', {
    //   method: 'DELETE'
    // });
  }

  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// React hook for using notification service
export function useNotificationService() {
  const { settings } = useReminderSettings();

  const initializeNotifications = async () => {
    const initialized = await notificationService.initialize();
    if (initialized) {
      await notificationService.scheduleDailyReminders(settings);
      await notificationService.scheduleHydrationReminders(settings);
      await notificationService.scheduleWeeklyWeighIn(settings);
    }
    return initialized;
  };

  const subscribeToNotifications = async () => {
    return await notificationService.subscribeToPushNotifications();
  };

  const unsubscribeFromNotifications = async () => {
    return await notificationService.unsubscribeFromPushNotifications();
  };

  const showTestNotification = async () => {
    await notificationService.showLocalNotification({
      title: 'Test Notification',
      body: 'This is a test notification from Calorie Tracker!',
      tag: 'test-notification'
    });
  };

  return {
    initializeNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    showTestNotification,
    isSupported: notificationService.isNotificationSupported(),
    subscription: notificationService.getSubscription()
  };
} 