import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ReminderSettings {
  logMeals: boolean;
  logMealsTime: string; // "19:00" format
  drinkWater: boolean;
  drinkWaterFrequency: string; // "every_2_hours"
  weighIn: boolean;
  weighInDay: string; // "monday"
  weighInTime: string; // "08:00" format
}

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: Notifications.AndroidNotificationPriority;
}

class MobileNotificationService {
  private isInitialized: boolean = false;
  private settings: ReminderSettings | null = null;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupNotificationChannels();
      }

      // Load saved settings
      await this.loadSettings();

      // Set up notification handlers
      this.setupNotificationHandlers();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  private async setupNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('hydration', {
      name: 'Hydration Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('weigh-in', {
      name: 'Weekly Weigh-In',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9800',
      sound: 'default',
    });
  }

  private setupNotificationHandlers(): void {
    // Handle notification received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      this.handleNotificationTap(response);
    });
  }

  private handleNotificationTap(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    // Handle deep linking based on notification type
    if (data?.type === 'meal-reminder') {
      // Navigate to log food screen
      console.log('Navigate to log food screen');
    } else if (data?.type === 'hydration-reminder') {
      // Navigate to home screen
      console.log('Navigate to home screen');
    } else if (data?.type === 'weigh-in-reminder') {
      // Navigate to progress screen
      console.log('Navigate to progress screen');
    }
  }

  async requestPermission(): Promise<Notifications.PermissionStatus> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }

  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  async scheduleLocalNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          priority: notification.priority || Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger,
      });
      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  async showImmediateNotification(notification: NotificationData): Promise<string> {
    return this.scheduleLocalNotification(notification, null);
  }

  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Settings management
  async loadSettings(): Promise<ReminderSettings | null> {
    try {
      const settingsJson = await AsyncStorage.getItem('reminderSettings');
      if (settingsJson) {
        this.settings = JSON.parse(settingsJson);
        return this.settings;
      }
      return null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  async saveSettings(settings: ReminderSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('reminderSettings', JSON.stringify(settings));
      this.settings = settings;
      await this.updateSchedules(settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async updateSchedules(settings: ReminderSettings): Promise<void> {
    // Cancel existing schedules
    await this.cancelAllNotifications();

    // Schedule new notifications based on settings
    if (settings.logMeals) {
      await this.scheduleMealReminders(settings);
    }

    if (settings.drinkWater) {
      await this.scheduleHydrationReminders(settings);
    }

    if (settings.weighIn) {
      await this.scheduleWeeklyWeighIn(settings);
    }
  }

  private async scheduleMealReminders(settings: ReminderSettings): Promise<void> {
    const [hours, minutes] = settings.logMealsTime.split(':').map(Number);
    // Schedule daily at specified time
    await this.scheduleLocalNotification(
      {
        title: 'Time to Log Your Meal! 🍽️',
        body: 'Don\'t forget to track your nutrition for today. Tap to log your meal now!',
        data: { type: 'meal-reminder', url: '/log-food/manual' },
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      }
    );
  }

  private async scheduleHydrationReminders(settings: ReminderSettings): Promise<void> {
    const frequencyMap = {
      'every_hour': 60 * 60 * 1000,
      'every_2_hours': 2 * 60 * 60 * 1000,
      'every_3_hours': 3 * 60 * 60 * 1000,
    };
    const interval = frequencyMap[settings.drinkWaterFrequency as keyof typeof frequencyMap] || 2 * 60 * 60 * 1000;
    // Schedule recurring hydration reminders (every X hours during waking hours)
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    for (let hour = startHour; hour < endHour; hour += Math.floor(interval / (60 * 60 * 1000))) {
      await this.scheduleLocalNotification(
        {
          title: 'Stay Hydrated! 💧',
          body: 'Time to drink some water and stay healthy!',
          data: { type: 'hydration-reminder', url: '/' },
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        {
          type: SchedulableTriggerInputTypes.DAILY,
          hour,
          minute: 0,
        }
      );
    }
  }

  private async scheduleWeeklyWeighIn(settings: ReminderSettings): Promise<void> {
    const dayMap = {
      'sunday': 1,
      'monday': 2,
      'tuesday': 3,
      'wednesday': 4,
      'thursday': 5,
      'friday': 6,
      'saturday': 7,
    };
    const targetDay = dayMap[settings.weighInDay as keyof typeof dayMap] || 2;
    const [hours, minutes] = settings.weighInTime.split(':').map(Number);
    await this.scheduleLocalNotification(
      {
        title: 'Weekly Weigh-In Reminder ⚖️',
        body: 'Time for your weekly progress check! Track your weight to monitor your journey.',
        data: { type: 'weigh-in-reminder', url: '/progress' },
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      {
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday: targetDay,
        hour: hours,
        minute: minutes,
      }
    );
  }

  async showTestNotification(): Promise<void> {
    await this.showImmediateNotification({
      title: 'Test Notification 🧪',
      body: 'This is a test notification from Calorie Tracker!',
      data: { type: 'test' },
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    });
  }

  // Utility methods
  isDeviceSupported(): boolean {
    return Device.isDevice;
  }

  getDeviceType(): string {
    return typeof Device.deviceType === 'string' ? Device.deviceType : 'unknown';
  }
}

// Create singleton instance
const notificationService = new MobileNotificationService();

export default notificationService; 